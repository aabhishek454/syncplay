'use client';
import { useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { usePlayerStore } from '@/store/playerStore';

export default function YoutubePlayer() {
  const playerRef = useRef<any>(null);
  const { track, isPlaying, progress, setProgress, volume } = usePlayerStore();

  useEffect(() => {
    if (!playerRef.current || !track) return;

    // Load the video if it changed
    playerRef.current.loadVideoById(track.id);
  }, [track?.id]);

  useEffect(() => {
    if (!playerRef.current || !track) return;
    try {
      if (typeof playerRef.current.setVolume === 'function') {
         playerRef.current.setVolume(volume);
      }
      if (typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.seekTo === 'function') {
         const current = playerRef.current.getCurrentTime();
         if (Math.abs(current - progress) > 1.5) {
            playerRef.current.seekTo(progress, true);
         }
      }
      if (isPlaying) {
         if (typeof playerRef.current.playVideo === 'function') playerRef.current.playVideo();
      } else {
         if (typeof playerRef.current.pauseVideo === 'function') playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("YT Player Error:", e);
    }
  }, [isPlaying, progress, volume]); // track.id is intentionally omitted here as it triggers loadVideoById above

  const onReady: YouTubeProps['onReady'] = (e) => {
    playerRef.current = e.target;
    try {
      if (typeof e.target.setVolume === 'function') e.target.setVolume(volume);
      if (track && track.id) {
        if (typeof e.target.loadVideoById === 'function') e.target.loadVideoById(track.id);
        if (typeof e.target.seekTo === 'function') e.target.seekTo(progress, true);
        if (isPlaying && typeof e.target.playVideo === 'function') e.target.playVideo();
      }
    } catch (err) {
      console.error("YT Ready Error:", err);
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = (e) => {
    if (e.data === 1 || e.data === 2) {
      const interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
           const time = playerRef.current.getCurrentTime();
           // Update local store silently without triggering broadcast seek
           usePlayerStore.setState({ progress: time });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  };

  if (!track) return null;

  return (
    <div className="fixed top-[-9999px] left-[-9999px] w-[200px] h-[200px]">
      <YouTube
        videoId={track.id}
        opts={{
          width: '200',
          height: '200',
          playerVars: { 
            autoplay: 1, 
            controls: 0, 
            disablekb: 1, 
            modestbranding: 1, 
            playsinline: 1
          }
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
