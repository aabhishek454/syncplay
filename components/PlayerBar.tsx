'use client';
import { usePlayerStore } from '@/store/playerStore';
import { broadcastEvent } from '@/lib/roomSync';
import { TRACK_LIST } from '@/lib/tracks';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaVolumeUp, FaListUl, FaExpand } from 'react-icons/fa';

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

  const currentIndex = track ? TRACK_LIST.findIndex(t => t.id === track.id) : -1;

  const playNext = () => {
     if (currentIndex === -1) return;
     const nextSong = TRACK_LIST[(currentIndex + 1) % TRACK_LIST.length];
     broadcastEvent(roomCode, { type: 'song', trackId: nextSong.id, position: 0 });
  };

  const playPrev = () => {
     if (currentIndex === -1) return;
     const prevSong = TRACK_LIST[(currentIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length];
     broadcastEvent(roomCode, { type: 'song', trackId: prevSong.id, position: 0 });
  };

  const parseDuration = (dur: string) => {
    if (!dur) return 100;
    const [m, s] = dur.split(':').map(Number);
    return m * 60 + (s || 0);
  };
  const durationSec = track ? parseDuration(track.duration) : 100;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-[96px] glass-panel border-t border-white/5 sticky bottom-0 flex items-center justify-between px-6 z-50 w-full shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
       
       {/* Left: Track Info */}
       <div className="w-[30%] flex items-center gap-4 min-w-0">
          {track ? (
            <>
              <div className="relative group">
                <img src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`} className="w-14 h-14 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-105" alt="" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-black italic tracking-tight truncate">{track.title}</span>
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest truncate">{track.artist}</span>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors ml-2">
                <FaHeart className="text-pink-500 text-sm animate-pulse" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 opacity-20">
               <div className="w-14 h-14 bg-white/5 rounded-2xl"></div>
               <span className="text-xs font-black uppercase tracking-widestit">Silence is Golden</span>
            </div>
          )}
       </div>

       {/* Center: Controls & Scrubber */}
       <div className="flex-1 max-w-[600px] flex flex-col items-center">
           <div className="flex items-center gap-8 mb-2">
             <button onClick={playPrev} className="text-white/40 hover:text-white transition-colors">
                <FaStepBackward className="text-lg" />
             </button>
             <button 
                onClick={togglePlay} 
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg ml-1" />}
             </button>
             <button onClick={playNext} className="text-white/40 hover:text-white transition-colors">
                <FaStepForward className="text-lg" />
             </button>
          </div>

          <div className="flex items-center gap-4 w-full group">
             <span className="text-[10px] font-black text-white/30 w-10 text-right font-mono">{formatTime(progress)}</span>
             <div className="relative flex-1 h-6 flex items-center">
                <input 
                  type="range"
                  min={0}
                  max={durationSec}
                  value={progress || 0}
                  onChange={handleSeek}
                  className="player-slider w-full"
                />
             </div>
             <span className="text-[10px] font-black text-white/30 w-10 text-left font-mono">{track ? track.duration : '0:00'}</span>
          </div>
       </div>

       {/* Right: Actions */}
       <div className="w-[30%] flex justify-end items-center gap-6">
          <div className="flex items-center gap-3">
             <FaVolumeUp className="text-white/20 text-xs" />
             <input 
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolume}
                className="volume-slider w-24"
             />
          </div>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <FaListUl className="text-white/40 text-xs" />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <FaExpand className="text-white/40 text-xs" />
          </button>
       </div>
    </div>
  );
}
