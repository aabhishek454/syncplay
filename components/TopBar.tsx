'use client';
import { useState, useEffect } from 'react';
import { FaPlay, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import { usePlayerStore } from '@/store/playerStore';
import { sendEvent } from '@/lib/roomSync';

export default function TopBar({ onSearch }: { onSearch: (query: string) => void }) {
  const { roomCode, identity, partnerOnline, latency, isResyncing, setResyncing } = usePlayerStore();
  const [query, setQuery] = useState('');

  const handleManualResync = () => {
    if (isResyncing) return;
    setResyncing(true);
    sendEvent({ type: 'requestSync' });
  };

  // identity: 'host' is "You", 'guest' is "Radhika" (assuming context)
  const isHost = identity === 'host';
  const youName = isHost ? 'You' : 'Radhika';
  const partnerName = isHost ? 'Radhika' : 'You';
  const youColor = isHost ? 'bg-orange-500' : 'bg-pink-500';
  const partnerColor = isHost ? 'bg-pink-500' : 'bg-orange-500';

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div className="h-[56px] bg-ytBlack border-b border-ytBorder flex items-center justify-between px-4 shrink-0">
      
      {/* LEFT: Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 bg-ytRed rounded-lg flex items-center justify-center">
           <FaPlay className="text-white ml-0.5 text-xs" />
        </div>
        <span className="text-xl font-bold tracking-tight">SyncPlay</span>
        <span className="text-xl font-light text-gray-300">music</span>
      </div>

      {/* CENTER: Search Bar */}
      <div className="flex bg-ytGray border border-ytBorderActive rounded-[20px] items-center px-4 py-1.5 w-[400px]">
        <FaSearch className="text-gray-400 mr-3 text-sm" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, albums, artists"
          className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-gray-400"
        />
      </div>

      {/* RIGHT: Status & Avatars */}
      <div className="flex items-center gap-4">
        {/* Connection Quality & Resync (Guest only) */}
        {!isHost && partnerOnline && (
           <div className="flex items-center gap-2 mr-2">
             <div className="flex items-center gap-1 bg-ytGray rounded-md px-2 py-1 text-xs">
               <span className={`w-2 h-2 rounded-full ${latency < 80 ? 'bg-green-500' : latency < 200 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
               <span className="text-gray-300 font-mono">{latency > 0 ? `${latency}ms` : '--'}</span>
             </div>
             
             <button 
               onClick={handleManualResync}
               disabled={isResyncing}
               className={`flex items-center justify-center bg-ytGray hover:bg-ytBorder hover:text-white text-gray-400 rounded-md p-1.5 transition ${isResyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
               title="Force Sync with Host"
             >
               <svg className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             </button>
           </div>
        )}

        {/* Room Code Pill */}
        <div className="border border-ytRed/50 rounded-full py-1 px-3 flex items-center justify-center">
           <span className="text-xs font-mono text-ytRed tracking-[2px]">{roomCode}</span>
        </div>

        {/* You Chip */}
        <div className="flex items-center gap-2 bg-ytGray rounded-full py-1 pr-3 pl-1">
          <div className={`w-6 h-6 rounded-full ${youColor} flex items-center justify-center text-white text-[10px] font-bold`}>
            {youName.charAt(0)}
          </div>
          <span className="text-xs font-medium">You</span>
        </div>

        {/* Partner Chip */}
        <div className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors ${partnerOnline ? 'bg-ytGray' : 'opacity-40 grayscale'}`}>
          <div className={`w-6 h-6 rounded-full ${partnerColor} relative`}>
            {partnerOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-ytBlack"></div>}
          </div>
          <span className="text-xs font-medium">{partnerName}</span>
        </div>

        <FaBell className="text-gray-400 text-xl hover:text-white cursor-pointer transition ml-2" />
        <FaUserCircle className="text-gray-400 text-2xl hover:text-white cursor-pointer transition ml-2" />
      </div>

    </div>
  );
}
