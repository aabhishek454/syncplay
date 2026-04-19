'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { initRoomSync } from '@/lib/roomSync';
import { usePlayerStore, Identity } from '@/store/playerStore';
import { TRACK_LIST } from '@/lib/tracks';

// Components
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import ChipsBar from '@/components/ChipsBar';
import CardGrid from '@/components/CardGrid';
import TrackQueue from '@/components/TrackQueue';
import PlayerBar from '@/components/PlayerBar';
import SyncToast from '@/components/SyncToast';
import YoutubePlayer from '@/components/YoutubePlayer';
import AudioUnlockOverlay from '@/components/AudioUnlockOverlay';

export default function RoomPage() {
  const router = useRouter();
  const { code } = useParams() as { code: string };
  const { setRoomCode, setIdentity, setTrack, setIsPlaying, setProgress, setPartnerOnline } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!code) return;

    // Load identity from localStorage
    const savedIdentity = localStorage.getItem(`syncplay_identity_${code}`);
    if (savedIdentity === 'host' || savedIdentity === 'guest') {
      setIdentity(savedIdentity as Identity);
    } else {
      setIdentity('guest');
    }

    setRoomCode(code);

    let unsubscribe: (() => void) | undefined;
    
    // Using PeerJS now, we fetch state from host via requestSync event sent inside roomSync.ts open handler.
    initRoomSync(code).then(res => {
        unsubscribe = res.unsubscribe;
    });

    return () => {
      if (unsubscribe) unsubscribe();
      setPartnerOnline(false);
    };
  }, [code]);

  const setInProgressElapsed = (pos: number, timestamp: string, isNowPlaying: boolean) => {
    setIsPlaying(isNowPlaying);
    if (!isNowPlaying) {
      setProgress(pos);
      return;
    }
    const elapsed = (Date.now() - new Date(timestamp).getTime()) / 1000;
    setProgress(pos + elapsed);
  };

  const filteredTracks = TRACK_LIST.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-svh overflow-hidden bg-[#0a0510] text-gray-100 font-sans relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-purple-900/30 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <TopBar onSearch={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        
        <main className="flex-1 flex flex-col overflow-y-auto w-full pt-4 custom-scrollbar pb-36 px-4 md:px-0 relative z-10 pointer-events-auto">
           
           <div className="flex-1 w-full max-w-5xl mx-auto">
              {/* Header Info */}
              <div className="px-2 md:px-6 pt-2 pb-6">
                 <h2 className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-2 opacity-80">Private Room • {code}</h2>
                 <div className="flex items-center gap-3">
                    <div className="glass-panel text-pink-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-pink-500/10 border-pink-500/30">
                       <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                       Secured Connection
                    </div>
                 </div>
              </div>

              {searchQuery ? (
                 <div className="mt-4">
                    <CardGrid tracks={filteredTracks} title="Search Results" />
                 </div>
              ) : (
                 <div className="flex flex-col gap-8 md:gap-12">
                   <div className="mt-2">
                     <CardGrid tracks={TRACK_LIST.slice(0, 5)} title="Made for You Two 💖" />
                   </div>
                   
                   <div className="mt-2">
                     <TrackQueue tracks={TRACK_LIST.slice(5, 10)} />
                   </div>
                   
                   <div className="mt-2 text-center text-sm font-medium text-gray-500 pb-10">
                     Play something special for your partner
                   </div>
                 </div>
              )}
           </div>
        </main>
      </div>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-[90px] left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
         <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl pointer-events-auto shadow-purple-900/40">
           <div className="flex flex-col items-center gap-1 cursor-pointer text-pink-400">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             <span className="text-[10px] font-bold uppercase tracking-wider">Listen</span>
           </div>
           <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
             <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
           </div>
         </div>
      </div>

      <PlayerBar />
      <SyncToast />
      <YoutubePlayer />
      <AudioUnlockOverlay />

    </div>
  );
}
