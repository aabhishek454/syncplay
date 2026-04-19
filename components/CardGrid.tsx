'use client';
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
         <h2 className="text-2xl font-bold">{title}</h2>
         <button className="text-sm font-medium text-gray-400 hover:text-white px-3 py-1 border border-ytBorderActive rounded-full">
           See all
         </button>
       </div>
       <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-[10px]">
         {tracks.map((t) => (
           <Card key={t.id} track={t} />
         ))}
       </div>
    </div>
  );
}

function Card({ track }: { track: Track }) {
  const { track: currentTrack, isPlaying, roomCode } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const playSong = () => {
     // If clicking the current track, perhaps toggle play/pause
     if (isActive) {
        broadcastEvent(roomCode, { type: isPlaying ? 'pause' : 'play' });
     } else {
        broadcastEvent(roomCode, { type: 'song', trackId: track.id, position: 0 });
     }
  };

  return (
    <div className="flex flex-col gap-2 group cursor-pointer" onClick={playSong}>
      <div className={`relative w-full aspect-square rounded-lg overflow-hidden bg-ytBorderActive ${isActive ? 'border-2 border-ytRed' : ''}`}>
        {/* Real Thumbnail */}
        <img 
          src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`} 
          alt={track.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Hover overlay overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isActive && isPlaying ? 'opacity-100 bg-black/60' : ''}`}>
           {isActive && isPlaying ? (
              <div className="flex gap-1 items-end h-6">
                 <span className="w-1.5 h-3 bg-white animate-[bounce_1s_infinite]"></span>
                 <span className="w-1.5 h-6 bg-white animate-[bounce_1s_infinite_0.2s]"></span>
                 <span className="w-1.5 h-4 bg-white animate-[bounce_1s_infinite_0.4s]"></span>
              </div>
           ) : (
              <FaPlay className="text-white text-3xl" />
           )}
        </div>
      </div>
      
      <div className="flex flex-col">
         <span className="text-sm font-medium text-white truncate leading-tight mb-1">{track.title}</span>
         {isActive ? (
            <span className="text-xs text-ytRed font-medium">Now playing</span>
         ) : (
            <span className="text-xs text-gray-400 truncate hover:underline">{track.artist}</span>
         )}
      </div>
    </div>
  );
}
