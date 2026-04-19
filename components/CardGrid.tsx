'use client';
import { memo, useCallback } from 'react';
import Image from 'next/image';
import { Track } from '@/lib/tracks';
import { usePlayerStore } from '@/store/playerStore';
import { broadcastEvent } from '@/lib/roomSync';
import { FaPlay } from 'react-icons/fa';

interface CardGridProps {
  tracks: Track[];
  title: string;
}

export default function CardGrid({ tracks, title }: CardGridProps) {
  return (
    <div className="mb-10 px-6">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">{title}</h2>
         <button className="text-xs font-semibold text-purple-300 hover:text-white px-4 py-1.5 border border-purple-500/30 rounded-full hover:bg-purple-500/20 transition-colors">
           See all
         </button>
       </div>
       <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
         {tracks.map((t) => (
           <Card key={t.id} track={t} />
         ))}
       </div>
    </div>
  );
}

const Card = memo(function Card({ track }: { track: Track }) {
  const { track: currentTrack, isPlaying, roomCode } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const playSong = useCallback(() => {
     console.log("CLICK WORKING: Card Grid Item", track.title);
     if (isActive) {
        broadcastEvent(roomCode, { type: isPlaying ? 'pause' : 'play' });
     } else {
        broadcastEvent(roomCode, { type: 'song', trackId: track.id, position: 0 }, track);
     }
  }, [isActive, isPlaying, roomCode, track.id, track.title]);

  return (
    <div className="hardware-accelerated flex flex-col gap-3 group cursor-pointer p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 z-10 pointer-events-auto" onClick={playSong}>
      <div className={`relative w-full aspect-square rounded-xl overflow-hidden shadow-lg ${isActive ? 'ring-2 ring-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'ring-1 ring-white/10'}`}>
        
        <Image 
          src={`https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`} 
          alt={track.title} 
          fill
          sizes="(max-width: 768px) 50vw, 150px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive && isPlaying ? 'opacity-100 bg-black/50' : ''}`}>
           {isActive && isPlaying ? (
              <div className="flex gap-1 items-end h-6">
                 <span className="w-1.5 h-3 bg-pink-400 animate-[bounce_1s_infinite] shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                 <span className="w-1.5 h-6 bg-purple-400 animate-[bounce_1s_infinite_0.2s] shadow-[0_0_8px_rgba(192,132,252,0.8)]"></span>
                 <span className="w-1.5 h-4 bg-pink-400 animate-[bounce_1s_infinite_0.4s] shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
              </div>
           ) : (
              <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <FaPlay className="text-xl ml-1" />
              </div>
           )}
        </div>
      </div>
      
      <div className="flex flex-col px-1">
         <span className="text-sm font-bold text-gray-100 truncate leading-tight mb-0.5">{track.title}</span>
         {isActive ? (
            <span className="text-xs text-pink-400 font-semibold tracking-wide">Now playing 🎵</span>
         ) : (
            <span className="text-xs text-purple-300/70 truncate">{track.artist}</span>
         )}
      </div>
    </div>
  );
});
