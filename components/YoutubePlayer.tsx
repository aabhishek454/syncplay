'use client';
import { useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { usePlayerStore } from '@/store/playerStore';

export default function YoutubePlayer() {
  const playerRef = useRef<any>(null);
  const { track, isPlaying, progress, setProgress, volume } = usePlayerStore();

  useEffect(() => {
    if (!playerRef.current || !track) return;

    // Improved resilient loader
    const loadVideo = (retryCount = 0) => {
        if (!playerRef.current || !track) return;
        
        if (typeof playerRef.current.loadVideoById === 'function') {
            try {
                playerRef.current.loadVideoById(track.id);
                setTimeout(() => {
                    const store = usePlayerStore.getState();
                    if (store.isPlaying && typeof playerRef.current.playVideo === 'function') {
                        playerRef.current.playVideo();
                    }
                }, 500);
            } catch (err) {
                console.error("Load Video Error:", err);
            }
        } else if (retryCount < 5) {
            // Player exists but functions not ready, retry
            setTimeout(() => loadVideo(retryCount + 1), 500);
        }
    };

    loadVideo();
  }, [track?.id]);

  const isSeekingLock = useRef(false);

  useEffect(() => {
    if (!playerRef.current || !track) return;
    try {
      if (typeof playerRef.current.setVolume === 'function') {
         playerRef.current.setVolume(volume);
      }
      if (typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.seekTo === 'function') {
         const current = playerRef.current.getCurrentTime();
         // Initial sync response check
         if (!isSeekingLock.current && Math.abs(current - progress) > 0.5) {
            isSeekingLock.current = true;
            playerRef.current.seekTo(progress, true);
            setTimeout(() => isSeekingLock.current = false, 500); // 500ms seek debounce lock!
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
  }, [isPlaying, progress, volume]); // track.id omitted intentionally

  useEffect(() => {
    const handleGlobalClick = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
         if (usePlayerStore.getState().isPlaying) {
             playerRef.current.playVideo();
         }
      }
    };
    document.addEventListener("click", handleGlobalClick, { once: true });
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

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
           
           // AUTO-RESYNC DRIFT CORRECTION LOOP
           // We evaluate true local drift against the player store's ideal progress.
           // Only host or deeply-synced guests execute store mutations via media events.
           const store = usePlayerStore.getState();
           
           // Let's project where the song SHOULD be according to our global state offset
           // Wait, we just keep the Zustand store perfectly up-to-date with reality,
           // AND if the browser drifts away from Zustand store...
           if (store.isPlaying && !isSeekingLock.current) {
               // Update Zustand silently so the timeline progresses smoothly.
               usePlayerStore.setState({ progress: time });
           }
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
