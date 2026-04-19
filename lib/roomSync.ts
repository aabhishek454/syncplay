import { usePlayerStore, Identity } from '@/store/playerStore';
import { TRACK_LIST } from './tracks';

let peerInstance: any = null;
let connectionInstance: any = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let heartbeatTimeout: NodeJS.Timeout | null = null;

export type SyncEvent =
  | { type: 'play'; ts: number; user: Identity }
  | { type: 'pause'; ts: number; user: Identity }
  | { type: 'seek'; position: number; ts: number; user: Identity }
  | { type: 'song'; trackId: string; position: number; ts: number; user: Identity }
  | { type: 'heartbeat'; user: Identity }
  | { type: 'requestSync'; user: Identity }
  | { type: 'syncState'; trackId: string; isPlaying: boolean; position: number; user: Identity };

export async function initRoomSync(roomCode: string) {
  const store = usePlayerStore.getState();
  const isHost = store.identity === 'host';
  const hostId = `syncplay-app-${roomCode}-host`;
  
  if (peerInstance) peerInstance.destroy();
  
  // Dynamically import to avoid Next.js Server-Side Rendering issues
  const PeerJS = (await import('peerjs')).default;
  
  if (isHost) {
    peerInstance = new PeerJS(hostId);
    peerInstance.on('connection', (conn: any) => {
      connectionInstance = conn;
      setupConnection(conn);
    });
  } else {
    peerInstance = new PeerJS();
    peerInstance.on('open', () => {
      const conn = peerInstance.connect(hostId);
      connectionInstance = conn;
      setupConnection(conn);
    });
  }

  const unsubscribe = () => {
    if (peerInstance) peerInstance.destroy();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
    connectionInstance = null;
  };

  return { unsubscribe };
}

function setupConnection(conn: any) {
  conn.on('data', (data: any) => {
    handleBroadcast(data as SyncEvent);
  });
  
  conn.on('open', () => {
    const isGuest = usePlayerStore.getState().identity === 'guest';
    startHeartbeat();
    
    // If we just joined as a guest, ask host what song is playing
    if (isGuest) {
       conn.send({ type: 'requestSync', user: 'guest' });
    }
  });
}

function handleBroadcast(event: SyncEvent) {
  const store = usePlayerStore.getState();
  const isPartner = event.user !== store.identity;
  const displayPartnerName = store.identity === 'host' ? 'Radhika' : 'Partner';

  if (event.type === 'heartbeat') {
    if (isPartner) {
        store.setPartnerOnline(true);
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
           usePlayerStore.getState().setPartnerOnline(false);
        }, 12000);
    }
    return;
  }
  
  if (event.type === 'requestSync') {
     if (!isPartner) return;
     // Host responds with current state
     const state = usePlayerStore.getState();
     if (connectionInstance && connectionInstance.open) {
        connectionInstance.send({
           type: 'syncState',
           trackId: state.track?.id || '',
           isPlaying: state.isPlaying,
           position: state.progress,
           user: store.identity
        });
     }
     return;
  }
  
  if (event.type === 'syncState' && isPartner) {
     const track = TRACK_LIST.find(t => t.id === event.trackId);
     if (track) store.setTrack(track);
     store.setIsPlaying(event.isPlaying);
     store.setProgress(event.position);
     return;
  }

  // Handle media events
  switch (event.type) {
    case 'play':
      store.setIsPlaying(true);
      if (isPartner) store.addToast(`${displayPartnerName} played the music`);
      break;
    case 'pause':
      store.setIsPlaying(false);
      if (isPartner) store.addToast(`${displayPartnerName} paused the music`);
      break;
    case 'seek':
      store.setProgress(event.position);
      if (isPartner) store.addToast(`${displayPartnerName} seeked to ${formatTime(event.position)}`);
      break;
    case 'song':
      const track = TRACK_LIST.find(t => t.id === event.trackId);
      if (track) {
        store.setTrack(track);
        store.setIsPlaying(true);
        store.setProgress(0);
        if (isPartner) store.addToast(`${displayPartnerName} changed the song`);
      }
      break;
  }
}

function startHeartbeat() {
  const ping = () => {
    if (connectionInstance && connectionInstance.open) {
      connectionInstance.send({ type: 'heartbeat', user: usePlayerStore.getState().identity });
    }
  };
  ping();
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(ping, 5000);
}

export function broadcastEvent(roomCode: string, payload: Partial<SyncEvent>) {
  if (!roomCode) return;
  const identity = usePlayerStore.getState().identity;
  const fullPayload = { ...payload, ts: Date.now(), user: identity } as SyncEvent;
  
  handleBroadcast(fullPayload);
  
  if (connectionInstance && connectionInstance.open) {
     connectionInstance.send(fullPayload);
  }
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
