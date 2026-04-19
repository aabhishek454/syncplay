'use client';
import { memo, useCallback } from 'react';
import Image from 'next/image';
import { Track } from '@/lib/tracks';
import { usePlayerStore } from '@/store/playerStore';
import { broadcastEvent } from '@/lib/roomSync';

export default function TrackQueue({ tracks }: { tracks: Track[] }) {
  return (
    <div className="mb-10 px-6">
       <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Up next</h2>
       <div className="flex flex-col gap-2">
         {tracks.slice(0, 5).map((track, i) => (
           <QueueRow key={track.id} track={track} index={i} />
         ))}
       </div>
    </div>
  );
}

const QueueRow = memo(function QueueRow({ track, index }: { track: Track; index: number }) {
  const { track: currentTrack, isPlaying, roomCode } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const playSong = useCallback(() => {
    console.log("CLICK WORKING: Queue Row Item", track.title);
    if (isActive) {
      broadcastEvent(roomCode, { type: isPlaying ? 'pause' : 'play' });
    } else {
      broadcastEvent(roomCode, { type: 'song', trackId: track.id, position: 0 });
    }
  }, [isActive, isPlaying, roomCode, track.id, track.title]);

  return (
    <div 
      className={`hardware-accelerated flex items-center gap-4 py-2 px-3 rounded-xl cursor-pointer group transition-all duration-300 z-10 pointer-events-auto ${isActive ? 'glass-panel border-purple-500/40 bg-purple-900/40' : 'hover:bg-white/5 border border-transparent'}`}
      onClick={playSong}
    >
      <div className="w-8 flex items-center justify-center shrink-0">
        {isActive && isPlaying ? (
           <div className="flex gap-1 items-end h-4">
              <span className="w-1 h-2 bg-pink-400 animate-[bounce_0.8s_infinite] shadow-[0_0_8px_rgba(244,114,182,0.6)]"></span>
              <span className="w-1 h-4 bg-purple-400 animate-[bounce_0.8s_infinite_0.2s] shadow-[0_0_8px_rgba(192,132,252,0.6)]"></span>
              <span className="w-1 h-3 bg-pink-400 animate-[bounce_0.8s_infinite_0.4s] shadow-[0_0_8px_rgba(244,114,182,0.6)]"></span>
           </div>
        ) : (
          <span className="text-sm font-medium text-gray-500 group-hover:text-purple-300 transition-colors">{index + 1}</span>
        )}
      </div>

      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-md">
        <Image 
          src={`https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`} 
          alt={track.title}
          fill
          sizes="48px"
          className="object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="flex flex-col flex-1 truncate">
         <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
           {track.title}
         </span>
         <span className="text-xs text-purple-300/70 truncate">{track.artist}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
         <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-200">
            {index % 2 === 0 ? 'Abhishek' : 'Radhika'}
         </span>
         <span className="text-sm font-medium text-gray-500 w-10 text-right">{track.duration}</span>
      </div>
    </div>
  );
});
