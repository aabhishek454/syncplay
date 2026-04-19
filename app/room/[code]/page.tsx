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

    // Using PeerJS now, we fetch state from host via requestSync event sent inside roomSync.ts open handler.
    const { unsubscribe } = initRoomSync(code);

    return () => {
      unsubscribe();
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
    <div className="flex flex-col h-screen overflow-hidden bg-ytDark text-white font-sans">
      
      <TopBar onSearch={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-y-auto relative w-full pt-0 custom-scrollbar">
           <ChipsBar />
           
           <div className="flex-1 w-full pb-32">
              {/* Header Info */}
              <div className="px-6 pt-6 pb-2">
                 <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Room {code}</h2>
                 <div className="flex items-center gap-3">
                    <div className="border border-green-500/50 bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                       Both listening
                    </div>
                 </div>
              </div>

              {searchQuery ? (
                 <div className="mt-6">
                    <CardGrid tracks={filteredTracks} title="Search Results" />
                 </div>
              ) : (
                 <>
                   <div className="mt-8">
                     <CardGrid tracks={TRACK_LIST.slice(0, 5)} title="Recommended" />
                   </div>
                   
                   <div className="mt-2">
                     <TrackQueue tracks={TRACK_LIST.slice(5, 10)} />
                   </div>
                   
                   <div className="mt-2">
                     <CardGrid tracks={TRACK_LIST.reverse().slice(0, 5)} title="Recently played" />
                   </div>
                 </>
              )}
           </div>
        </main>
      </div>

      <PlayerBar />
      <SyncToast />
      <YoutubePlayer />

    </div>
  );
}
