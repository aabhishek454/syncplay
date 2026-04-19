'use client';
import { usePlayerStore } from '@/store/playerStore';
import { useSupabaseChannel } from '@/lib/roomSync';

export default function Controls() {
  const {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    seekPosition,
    setSeekPosition,
    code,
  } = usePlayerStore();

  const channel = useSupabaseChannel(code ? `room:${code}` : '');

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    channel?.send({
      type: 'broadcast',
      event: 'playback',
      payload: { isPlaying: newState, seekPosition },
    });
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pos = Number(e.target.value);
    setSeekPosition(pos);
    channel?.send({
      type: 'broadcast',
      event: 'seek',
      payload: { seekPosition: pos },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
      <button
        onClick={togglePlay}
        className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-500 hover:scale-105 transition shadow-lg shadow-blue-500/30 flex-shrink-0"
      >
        {isPlaying ? (
           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
           <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
             <span>{Math.floor(seekPosition / 60)}:{(Math.floor(seekPosition % 60)).toString().padStart(2, '0')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={600} 
            step={1}
            value={seekPosition || 0}
            onChange={onSeek}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto text-slate-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" /></svg>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={onVolumeChange}
            className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-300"
          />
      </div>
    </div>
  );
}
