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
  partnerOnline: boolean;
  toasts: ToastMessage[];
  
  setRoomCode: (code: string) => void;
  setIdentity: (identity: Identity) => void;
  setTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  setPartnerOnline: (online: boolean) => void;
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
  partnerOnline: false,
  toasts: [],
  
  setRoomCode: (code) => set({ roomCode: code }),
  setIdentity: (identity) => set({ identity }),
  setTrack: (track) => set({ track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  setPartnerOnline: (partnerOnline) => set({ partnerOnline }),
  
  addToast: (msg) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message: msg }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 2200); // Fades out after 2.2s as specified
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));
