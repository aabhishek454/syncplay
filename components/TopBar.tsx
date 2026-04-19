'use client';
import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { sendEvent } from '@/lib/roomSync';
import { FaHeart, FaMusic } from 'react-icons/fa';

export default function TopBar({ onSearch }: { onSearch?: (query: string) => void }) {
  const { roomCode, identity, partnerOnline, latency, isResyncing, setResyncing, controlMode, setControlMode } = usePlayerStore();
  const [query, setQuery] = useState('');

  const isHost = identity === 'host';
  const youName = isHost ? 'Abhishek' : 'Radhika';
  const partnerName = isHost ? 'Radhika' : 'Abhishek';

  useEffect(() => {
    if (onSearch) onSearch(query);
  }, [query, onSearch]);

  const handleManualResync = () => {
    if (isResyncing) return;
    setResyncing(true);
    sendEvent({ type: 'requestSync' });
  };
  
  const toggleMode = () => {
     if (!isHost) return;
     const newMode = controlMode === 'HOST' ? 'SHARED' : 'HOST';
     setControlMode(newMode);
     sendEvent({ type: 'modeChange', mode: newMode } as any);
  };

  return (
    <div className="h-[70px] bg-[#0a0510]/80 backdrop-blur-xl border-b border-purple-900/50 flex items-center justify-between px-6 shrink-0 relative z-50 shadow-[0_10px_30px_rgba(124,58,237,0.1)] pointer-events-auto">
      
      {/* Floating Hearts Background (CSS implemented natively via pseudo elements or background pattern) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mixing-screen mix-blend-screen"></div>

      {/* LEFT: Love Theme Logo */}
      <div className="flex items-center gap-3 cursor-pointer z-10 w-1/3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/10">
           <FaHeart className="text-white text-lg animate-pulse" />
        </div>
        <div className="flex flex-col">
           <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Abhishek ❤️ Radhika</span>
           <span className="text-xs font-medium text-purple-300/80 uppercase tracking-widest flex items-center gap-1">
             <FaMusic className="text-[10px]" /> Listening Together
           </span>
        </div>
      </div>

      {/* CENTER-LEFT: Search Bar */}
      <div className="hidden md:flex ml-4 flex-1 max-w-[250px] relative z-10">
         <div className="flex w-full bg-purple-900/20 border border-purple-500/30 rounded-full items-center px-4 py-1.5 focus-within:border-pink-500/50 transition-colors">
            <svg className="w-3.5 h-3.5 text-purple-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs..."
              className="bg-transparent border-none outline-none text-white text-xs placeholder-purple-300/50 w-full"
            />
         </div>
      </div>

      {/* CENTER: Mode Toggle */}
      <div className="flex justify-center z-10 w-1/3">
         <button 
           onClick={toggleMode}
           className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${controlMode === 'HOST' ? 'bg-purple-900/40 border-purple-500/50 text-purple-200' : 'bg-pink-900/40 border-pink-500/50 text-pink-200'} ${isHost ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'} backdrop-blur-md`}
         >
            {controlMode === 'HOST' ? (
               <><span className="text-sm">👑</span><span className="text-xs font-bold tracking-widest uppercase">Host Control</span></>
            ) : (
               <><span className="text-sm">🤝</span><span className="text-xs font-bold tracking-widest uppercase">Shared Control</span></>
            )}
         </button>
      </div>

      {/* RIGHT: Status & Quick Actions */}
      <div className="flex items-center gap-4 z-10 w-1/3 justify-end">
        
        {/* Connection Quality & Resync */}
        {!isHost && partnerOnline && (
           <div className="flex items-center gap-2 bg-black/40 rounded-xl px-2 py-1 border border-white/5 backdrop-blur-md">
             <div className="flex items-center gap-1.5 text-xs">
               <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${latency < 80 ? 'bg-green-400 text-green-400' : latency < 200 ? 'bg-yellow-400 text-yellow-400' : 'bg-red-400 text-red-400'}`}></span>
               <span className="text-gray-300 font-mono pl-0.5">{latency > 0 ? `${latency}ms` : '--'}</span>
             </div>
             
             <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
             
             <button 
               onClick={handleManualResync}
               disabled={isResyncing}
               className={`flex items-center justify-center text-purple-300 hover:text-white transition-all ${isResyncing ? 'opacity-50 animate-spin' : 'hover:scale-110 active:scale-95'}`}
               title="Force Sync with Host"
             >
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
           </div>
        )}

        {/* Room Status Chip */}
        <div className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1.5 transition-all duration-500 border ${partnerOnline ? 'bg-white/5 border-purple-500/30' : 'bg-transparent border-white/10 opacity-60 grayscale'}`}>
          <div className="relative">
             <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold shadow-md`}>
                {partnerOnline ? partnerName.charAt(0) : '?'}
             </div>
             {partnerOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0510]"></div>}
          </div>
          <span className="text-xs font-semibold text-gray-200 pr-1">{partnerOnline ? partnerName : 'Waiting...'}</span>
        </div>
        
      </div>
    </div>
  );
}
