'use client';
import { usePlayerStore } from '@/store/playerStore';
import { sendEvent } from '@/lib/roomSync';

export default function AudioUnlockOverlay() {
  const { identity, audioUnlocked, setAudioUnlocked } = usePlayerStore();
  
  // Only show to guests who haven't unlocked audio yet
  if (identity === 'host' || audioUnlocked) return null;

  const handleUnlock = () => {
    setAudioUnlocked(true);
    sendEvent({ type: 'requestSync' });
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#0a0510]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden"
      style={{ pointerEvents: 'auto' }}
    >
       <button 
         onClick={handleUnlock}
         className="flex flex-col items-center gap-6 bg-gradient-to-br from-purple-600 to-pink-500 text-white px-10 py-8 rounded-[40px] shadow-[0_20px_50px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95 transition-all relative group overflow-hidden"
       >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-6xl animate-bounce mb-2">🎧</span>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black tracking-tight uppercase">Tap to Start</span>
            <span className="text-sm font-bold text-white/70 tracking-[0.3em] uppercase mt-2">Listen Together</span>
          </div>
       </button>
    </div>
  );
}
