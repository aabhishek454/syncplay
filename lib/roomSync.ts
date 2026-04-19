import { useEffect } from 'react';
import { supabase } from './supabase';
import { usePlayerStore, Identity } from '@/store/playerStore';
import { TRACK_LIST } from './tracks';

let heartbeatInterval: NodeJS.Timeout | null = null;
let heartbeatTimeout: NodeJS.Timeout | null = null;

export type SyncEvent =
  | { type: 'play'; ts: number; user: Identity }
  | { type: 'pause'; ts: number; user: Identity }
  | { type: 'seek'; position: number; ts: number; user: Identity }
  | { type: 'song'; trackId: string; position: number; ts: number; user: Identity }
  | { type: 'heartbeat'; user: Identity };

export function initRoomSync(roomCode: string) {
  const channel = supabase.channel(`room:${roomCode}`);

  channel
    .on('broadcast', { event: 'sync' }, ({ payload }) => {
      handleBroadcast(payload as SyncEvent);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
         startHeartbeat(roomCode);
      }
    });

  const unsubscribe = () => {
    channel.unsubscribe();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
  };

  return { channel, unsubscribe };
}

function handleBroadcast(event: SyncEvent) {
  const store = usePlayerStore.getState();
  const partnerName = store.identity === 'host' ? 'Radhika' : 'You (Partner)';
  const senderName = event.user === store.identity ? 'You' : (event.user === 'host' ? (store.identity === 'guest' ? 'You (Partner)' : 'Radhika') : 'Radhika');
  // Essentially: if event.user !== store.identity, it's the partner.
  const isPartner = event.user !== store.identity;
  const displayPartnerName = store.identity === 'host' ? 'Radhika' : 'Partner';

  if (event.type === 'heartbeat') {
    if (isPartner) {
        store.setPartnerOnline(true);
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        // If no heartbeat for 12s, partner is offline
        heartbeatTimeout = setTimeout(() => {
           usePlayerStore.getState().setPartnerOnline(false);
        }, 12000);
    }
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

function startHeartbeat(roomCode: string) {
  const channel = supabase.channel(`room:${roomCode}`);
  
  const ping = () => {
    const identity = usePlayerStore.getState().identity;
    channel.send({
      type: 'broadcast',
      event: 'sync',
      payload: { type: 'heartbeat', user: identity },
    });
  };
  
  ping();
  heartbeatInterval = setInterval(ping, 5000);
}

export function broadcastEvent(roomCode: string, payload: Partial<SyncEvent>) {
  if (!roomCode) return;
  
  const identity = usePlayerStore.getState().identity;
  const fullPayload = { ...payload, ts: Date.now(), user: identity } as SyncEvent;
  
  // Optimistically execute locally for instant feedback or if offline
  handleBroadcast(fullPayload);

  const channel = supabase.channel(`room:${roomCode}`);
  channel.send({
    type: 'broadcast',
    event: 'sync',
    payload: fullPayload,
  });
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
