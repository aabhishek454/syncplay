import { usePlayerStore, Identity } from '@/store/playerStore';
import { TRACK_LIST } from './tracks';

let peerInstance: any = null;
let connectionInstance: any = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let heartbeatTimeout: NodeJS.Timeout | null = null;
let isReconnecting = false;

// Conflict Debounce Lock
let seekingLock = false;
let processedEventIds = new Set<string>();

export type SyncPayload =
  | { type: 'play'; position: number }
  | { type: 'pause'; position: number }
  | { type: 'seek'; position: number }
  | { type: 'song'; trackId: string; position: number }
  | { type: 'heartbeat'; position: number; isPlaying: boolean }
  | { type: 'requestSync' }
  | { type: 'syncState'; trackId: string; isPlaying: boolean; position: number }
  | { type: 'ping'; tempTs: number }
  | { type: 'pong'; tempTs: number; hostTs: number; hostReceiptTs: number };

export type SyncEvent = {
  v: number;
  id: string;
  user: Identity;
  hostTime: number; // Single source of truth for timestamps
  payload: SyncPayload;
};

export async function initRoomSync(roomCode: string) {
  const store = usePlayerStore.getState();
  const isHost = store.identity === 'host';
  const hostId = `syncplay-app-${roomCode}-host`;
  
  if (peerInstance) peerInstance.destroy();
  
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
    
    // Auto reconnect on guest disconnect
    peerInstance.on('disconnected', () => {
       reconnectPeer(hostId);
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

function reconnectPeer(hostId: string) {
  if (isReconnecting || !peerInstance || peerInstance.destroyed) return;
  isReconnecting = true;
  setTimeout(() => {
    usePlayerStore.getState().setResyncing(true);
    peerInstance.reconnect();
    // On reconnect, it will fire 'open' and re-request sync
    isReconnecting = false;
  }, 2000);
}

function setupConnection(conn: any) {
  conn.on('data', (data: any) => {
    if (!data.v) return; // Drop malformed packets
    handleBroadcast(data as SyncEvent);
  });
  
  conn.on('close', () => {
     usePlayerStore.getState().setPartnerOnline(false);
  });
  
  conn.on('open', () => {
    startHeartbeat();
    if (usePlayerStore.getState().identity === 'guest') {
       usePlayerStore.getState().setResyncing(true);
       sendEvent({ type: 'requestSync' });
       // Start Ping for NTP Protocol
       sendEvent({ type: 'ping', tempTs: Date.now() });
    }
  });
}

function getCorrectedTime() {
  const store = usePlayerStore.getState();
  if (store.identity === 'host') return Date.now();
  return Date.now() + store.networkOffset;
}

function createEvent(payload: SyncPayload): SyncEvent {
  return {
    v: 1,
    id: Math.random().toString(36).substr(2, 9),
    user: usePlayerStore.getState().identity,
    hostTime: getCorrectedTime(),
    payload
  };
}

export function sendEvent(payload: SyncPayload) {
  const event = createEvent(payload);
  
  // Clean up old processed events to prevent memory leak
  if (processedEventIds.size > 100) processedEventIds.clear();
  processedEventIds.add(event.id);

  if (connectionInstance && connectionInstance.open) {
    connectionInstance.send(event);
  }
}

function handleBroadcast(event: SyncEvent) {
  const store = usePlayerStore.getState();
  
  if (processedEventIds.has(event.id)) return; // Duplicate drop
  processedEventIds.add(event.id);
  
  const isHost = store.identity === 'host';
  const isPartner = event.user !== store.identity;
  const p = event.payload;

  // -- NTP Time Synchronization --
  if (p.type === 'ping' && isHost) {
     sendEvent({ type: 'pong', tempTs: p.tempTs, hostReceiptTs: Date.now(), hostTs: Date.now() });
     return;
  }
  
  if (p.type === 'pong' && !isHost) {
     const t3 = Date.now();
     const t0 = p.tempTs;
     const t1 = p.hostReceiptTs;
     const t2 = p.hostTs;
     
     const roundTrip = (t3 - t0) - (t2 - t1);
     const oneWayLatency = Math.max(0, roundTrip / 2);
     const offset = ((t1 - t0) + (t2 - t3)) / 2;
     
     store.setLatency(Math.round(oneWayLatency));
     store.setNetworkOffset(offset);
     return;
  }
  
  // -- Sync Protocol --
  if (p.type === 'heartbeat') {
    if (isPartner) {
        store.setPartnerOnline(true);
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
           usePlayerStore.getState().setPartnerOnline(false);
           store.setLatency(0);
        }, 12000);
        
        // Host master clock drift correction
        if (!isHost && 'position' in p && p.isPlaying === store.isPlaying) {
           const timeSinceEvent = (getCorrectedTime() - event.hostTime) / 1000;
           const expectedHostPos = p.isPlaying ? p.position + timeSinceEvent : p.position;
           if (Math.abs(expectedHostPos - store.progress) > 0.3) {
               console.log(`[SyncEngine] Drift > 300ms detected. Local: ${store.progress}, Host: ${expectedHostPos}. Resyncing...`);
               store.setProgress(expectedHostPos);
           }
        }
    }
    return;
  }
  
  if (p.type === 'requestSync') {
     if (!isPartner) return;
     if (isHost && connectionInstance && connectionInstance.open) {
        sendEvent({
           type: 'syncState',
           trackId: store.track?.id || '',
           isPlaying: store.isPlaying,
           position: store.progress
        });
     }
     return;
  }
  
  if (p.type === 'syncState' && isPartner) {
     const track = TRACK_LIST.find(t => t.id === p.trackId);
     if (track) store.setTrack(track);
     
     // Delay Compensated Position
     const timeSinceEvent = (getCorrectedTime() - event.hostTime) / 1000;
     const compensatedPos = p.isPlaying ? p.position + timeSinceEvent : p.position;
     
     store.setIsPlaying(p.isPlaying);
     store.setProgress(Math.max(0, compensatedPos));
     store.setResyncing(false);
     return;
  }

  // --- HOST AUTHORITY MODEL ---
  // If we are Host, we can accept guest actions if we want to allow shared control.
  // But let's strictly reject playback commands from guest to maintain perfect sync,
  // EXCEPT for 'play/pause', we might allow shared control. Let's allow but Host processes it and rebroadcasts it.
  
  const displayPartnerName = isHost ? 'Radhika' : 'Partner';

  // Delay/Drift Compensation for incoming commands
  const timeSinceEvent = (getCorrectedTime() - event.hostTime) / 1000;
  const compensatedPos = Math.max(0, p.type === 'seek' ? p.position : ('position' in p ? p.position + timeSinceEvent : 0));

  if (p.type === 'play') {
    store.setIsPlaying(true);
    store.setProgress(compensatedPos);
    if (isPartner) store.addToast(`${displayPartnerName} played`);
  } 
  else if (p.type === 'pause') {
    store.setIsPlaying(false);
    store.setProgress(p.position);
    if (isPartner) store.addToast(`${displayPartnerName} paused`);
  } 
  else if (p.type === 'seek') {
    store.setProgress(compensatedPos);
    if (isPartner) store.addToast(`${displayPartnerName} seeked`);
  } 
  else if (p.type === 'song') {
    const track = TRACK_LIST.find(t => t.id === p.trackId);
    if (track) {
      store.setTrack(track);
      store.setIsPlaying(true);
      store.setProgress(0);
      if (isPartner) store.addToast(`${displayPartnerName} changed song`);
    }
  }
}

function startHeartbeat() {
  const pingLoop = () => {
    const store = usePlayerStore.getState();
    sendEvent({ 
       type: 'heartbeat', 
       position: store.progress, 
       isPlaying: store.isPlaying 
    });
    
    if (store.identity === 'guest') {
       sendEvent({ type: 'ping', tempTs: Date.now() });
    }
  };
  pingLoop();
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(pingLoop, 5000);
}

// User-Facing API for UI triggers (Auto-wraps into Event)
export function broadcastEvent(roomCode: string, payload: Partial<SyncPayload>) {
  if (!roomCode) return;
  const store = usePlayerStore.getState();
  
  // HOST AUTHORITY: Guests cannot organically change song or manually seek to cause conflicts.
  // They can only play/pause. This fulfills strict conflict prevention requirements.
  if (store.identity === 'guest' && (payload.type === 'seek' || payload.type === 'song')) {
     store.addToast("Only Host can perform this action");
     return;
  }
  const pos = ('position' in payload) ? payload.position : store.progress;
  const fullPayload = { ...payload, position: pos } as SyncPayload;
  // Optimistically execute purely locally
  const tempEvent = createEvent(fullPayload);
  handleBroadcast(tempEvent);

  sendEvent(fullPayload);
}
