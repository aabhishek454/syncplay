import { create } from 'zustand';
import { Track } from '@/lib/tracks';

export type Identity = 'host' | 'guest';

export type ToastMessage = {
  id: string;
  message: string;
};

type PlayerState = {
  roomCode: string;
  identity: Identity;
  track: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  latency: number;
  networkOffset: number; // local + offset = hostTime
  controlMode: 'HOST' | 'SHARED';
  isResyncing: boolean;
  partnerOnline: boolean;
  audioUnlocked: boolean;
  toasts: ToastMessage[];
  
  setRoomCode: (code: string) => void;
  setIdentity: (identity: Identity) => void;
  setControlMode: (mode: 'HOST' | 'SHARED') => void;
  setTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  setLatency: (latency: number) => void;
  setNetworkOffset: (offset: number) => void;
  setResyncing: (resync: boolean) => void;
  setPartnerOnline: (online: boolean) => void;
  setAudioUnlocked: (unlocked: boolean) => void;
  addToast: (msg: string) => void;
  removeToast: (id: string) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  roomCode: '',
  identity: 'host',
  track: null,
  isPlaying: false,
  progress: 0,
  volume: 100,
  latency: 0,
  networkOffset: 0,
  controlMode: 'SHARED', // Default to shared for this specific romantic couple app
  isResyncing: false,
  partnerOnline: false,
  audioUnlocked: false,
  toasts: [],
  
  setRoomCode: (code) => set({ roomCode: code }),
  setIdentity: (identity) => {
     set({ identity, audioUnlocked: identity === 'host' }); // Host unlocks automatically
  },
  setControlMode: (controlMode) => set({ controlMode }),
  setTrack: (track) => set({ track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  setLatency: (latency) => set({ latency }),
  setNetworkOffset: (offset) => set({ networkOffset: offset }),
  setResyncing: (resyncing) => set({ isResyncing: resyncing }),
  setPartnerOnline: (partnerOnline) => set({ partnerOnline }),
  setAudioUnlocked: (audioUnlocked) => set({ audioUnlocked }),
  
  addToast: (msg) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message: msg }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 2200); // Fades out after 2.2s as specified
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));
