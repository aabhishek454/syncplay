'use client';
import { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useSupabaseChannel } from '@/lib/roomSync';

export default function SongSearch() {
  const [url, setUrl] = useState('');
  const { code, setSong } = usePlayerStore();
  const channel = useSupabaseChannel(code ? `room:${code}` : '');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return alert('Invalid YouTube URL');
    
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else {
        videoId = url.split('v=')[1]?.split('&')[0];
    }
    if (!videoId) return alert('Could not extract video ID');

    const title = `YouTube Video ${videoId}`;
    setSong({ songUrl: url, songTitle: title, isPlaying: true, seekPosition: 0 }); // Autoplay when loaded

    channel?.send({
      type: 'broadcast',
      event: 'songChange',
      payload: { songUrl: url, songTitle: title },
    });
    
    setUrl('');
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-3 w-full">
      <input
        type="text"
        placeholder="Paste YouTube URL here..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-500 transition shadow-inner"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 hover:scale-105 transition shadow-lg shadow-purple-500/20"
      >
        Play
      </button>
    </form>
  );
}
