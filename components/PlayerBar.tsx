'use client';
import { usePlayerStore } from '@/store/playerStore';
import { broadcastEvent } from '@/lib/roomSync';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRedo, FaHeart, FaVolumeUp, FaListUl } from 'react-icons/fa';

export default function PlayerBar() {
  const { track, isPlaying, progress, volume, setVolume, roomCode } = usePlayerStore();

  const togglePlay = () => {
    if (!track) return;
    broadcastEvent(roomCode, { type: isPlaying ? 'pause' : 'play' });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!track) return;
    const val = Number(e.target.value);
    broadcastEvent(roomCode, { type: 'seek', position: val });
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  // Convert duration like "3:22" to seconds for the progress max
  const parseDuration = (dur: string) => {
    if (!dur) return 100;
    const [m, s] = dur.split(':').map(Number);
    return m * 60 + s;
  };
  const durationSec = track ? parseDuration(track.duration) : 100;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-[84px] bg-ytBlack border-t border-ytBorder sticky flex flex-col md:flex-row items-center justify-between px-4 shrink-0 bottom-0 select-none z-50 overflow-hidden w-full">
       
       {/* Left: Album/Info */}
       <div className="md:w-[250px] w-full flex items-center justify-between md:justify-start gap-4 h-full hidden md:flex shrink-0">
          {track ? (
            <>
              <img src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`} className="w-12 h-12 object-cover rounded" alt="" />
              <div className="flex flex-col truncate">
                <span className="text-[14px] text-white font-medium hover:underline cursor-pointer truncate">{track.title}</span>
                <span className="text-[12px] text-[#aaaaaa] hover:underline cursor-pointer truncate">{track.artist}</span>
              </div>
              <FaHeart className="text-gray-400 hover:text-white cursor-pointer transition ml-auto md:ml-4 text-sm" />
            </>
          ) : (
            <span className="text-sm text-gray-500">Nothing playing</span>
          )}
       </div>

       {/* Center: Controls */}
       <div className="flex flex-col items-center flex-1 max-w-[700px] w-full h-full justify-center md:px-8">
          <div className="flex items-center gap-6 mb-1">
             <FaRandom className="text-gray-400 hover:text-white cursor-pointer text-sm" />
             <FaStepBackward className="text-gray-200 hover:text-white cursor-pointer text-lg" />
             <div onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shrink-0">
                {isPlaying ? <FaPause className="text-black text-sm" /> : <FaPlay className="text-black text-sm ml-1" />}
             </div>
             <FaStepForward className="text-gray-200 hover:text-white cursor-pointer text-lg" />
             <FaRedo className="text-gray-400 hover:text-white cursor-pointer text-sm" />
          </div>

          <div className="flex items-center gap-3 w-full text-[11px] text-[#aaaaaa] font-medium">
             <span className="w-8 text-right">{formatTime(progress)}</span>
             <input 
               type="range"
               min={0}
               max={durationSec}
               value={progress || 0}
               onChange={handleSeek}
               className="flex-1 h-[3px] accent-ytRed bg-gray-600 rounded-full cursor-pointer hover:h-[4px] transition-all"
             />
             <span className="w-8 text-left">{track ? track.duration : '0:00'}</span>
          </div>
       </div>

       {/* Right: Volume & Extra */}
       <div className="md:w-[250px] w-full justify-end items-center gap-4 hidden md:flex shrink-0 pr-2">
          <FaListUl className="text-gray-400 hover:text-white cursor-pointer text-sm" />
          <div className="flex items-center gap-2 group">
             <FaVolumeUp className="text-gray-400 hover:text-white cursor-pointer text-sm" />
             <input 
               type="range"
               min={0}
               max={100}
               value={volume}
               onChange={handleVolume}
               className="w-20 h-[3px] accent-white bg-gray-600 rounded-full cursor-pointer opacity-80 group-hover:opacity-100"
             />
          </div>
       </div>
    </div>
  );
}
