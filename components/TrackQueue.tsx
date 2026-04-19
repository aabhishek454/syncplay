'use client';
import { Track } from '@/lib/tracks';
import { usePlayerStore } from '@/store/playerStore';
import { broadcastEvent } from '@/lib/roomSync';

export default function TrackQueue({ tracks }: { tracks: Track[] }) {
  return (
    <div className="mb-10 px-6">
       <h2 className="text-2xl font-bold mb-4">Up next</h2>
       <div className="flex flex-col">
         {tracks.slice(0, 5).map((track, i) => (
           <QueueRow key={track.id} track={track} index={i} />
         ))}
       </div>
    </div>
  );
}

function QueueRow({ track, index }: { track: Track; index: number }) {
  const { track: currentTrack, isPlaying, roomCode } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const playSong = () => {
    if (isActive) {
      broadcastEvent(roomCode, { type: isPlaying ? 'pause' : 'play' });
    } else {
      broadcastEvent(roomCode, { type: 'song', trackId: track.id, position: 0 });
    }
  };

  return (
    <div 
      className="flex items-center gap-4 py-2 px-2 hover:bg-ytHover rounded-md cursor-pointer group border-b border-ytBorderActive/50 last:border-0"
      onClick={playSong}
    >
      <div className="w-6 flex items-center justify-center shrink-0">
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
             <span className="w-1 h-2 bg-ytRed animate-[bounce_0.8s_infinite]"></span>
             <span className="w-1 h-4 bg-ytRed animate-[bounce_0.8s_infinite_0.2s]"></span>
             <span className="w-1 h-3 bg-ytRed animate-[bounce_0.8s_infinite_0.4s]"></span>
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-500 group-hover:text-white">{index + 1}</span>
        )}
      </div>

      <img src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`} className="w-10 h-10 object-cover rounded" alt="" />
      
      <div className="flex flex-col flex-1 truncate">
         <span className={`text-sm font-medium truncate ${isActive ? 'text-ytRed bg-ytRed/10 w-max px-1 rounded' : 'text-white'}`}>
           {track.title}
         </span>
         <span className="text-xs text-gray-400 truncate">{track.artist}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
         <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300">
            {index % 2 === 0 ? 'You' : 'Radhika'}
         </span>
         <span className="text-sm text-gray-400 w-10 text-right">{track.duration}</span>
      </div>
    </div>
  );
}
