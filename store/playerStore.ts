import { create } from 'zustand';
import { Track } from '@/lib/tracks';

export type Identity = 'host' | 'guest';

export type ToastMessage = {
  id: string;
  message: string;
};

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
};

type PlayerState = {
  roomCode: string;
  identity: Identity;
  user: 'abhishek' | 'radhika' | null;
  isAuthenticated: boolean;
  track: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  latency: number;
  networkOffset: number;
  controlMode: 'HOST' | 'SHARED';
  isResyncing: boolean;
  partnerOnline: boolean;
  audioUnlocked: boolean;
  toasts: ToastMessage[];
  messages: ChatMessage[];
  currentView: 'HOME' | 'EXPLORE' | 'LIBRARY' | 'LIKED';
  searchQuery: string;
  
  setRoomCode: (code: string) => void;
  setIdentity: (identity: Identity) => void;
  setUser: (user: 'abhishek' | 'radhika' | null) => void;
  setAuthenticated: (auth: boolean) => void;
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
  setCurrentView: (view: 'HOME' | 'EXPLORE' | 'LIBRARY' | 'LIKED') => void;
  setSearchQuery: (q: string) => void;
  addToast: (msg: string) => void;
  removeToast: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  roomCode: '1609', // Hardcoded as per special request
  identity: 'host',
  user: null,
  isAuthenticated: false,
  track: null,
  isPlaying: false,
  progress: 0,
  volume: 100,
  latency: 0,
  networkOffset: 0,
  controlMode: 'SHARED',
  isResyncing: false,
  partnerOnline: false,
  audioUnlocked: false,
  toasts: [],
  messages: [],
  currentView: 'HOME',
  searchQuery: '',
  
  setRoomCode: (code) => set({ roomCode: code }),
  setIdentity: (identity) => set({ identity, audioUnlocked: identity === 'host' }),
  setUser: (user) => {
    const identity = user === 'abhishek' ? 'host' : 'guest';
    set({ 
      user, 
      isAuthenticated: !!user, 
      identity, 
      audioUnlocked: identity === 'host' 
    });
  },
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
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
  setCurrentView: (currentView) => set({ currentView }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  addToast: (msg) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message: msg }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 2200);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));
