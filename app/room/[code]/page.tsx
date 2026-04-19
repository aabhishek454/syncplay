'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { initRoomSync } from '@/lib/roomSync';
import { usePlayerStore, Identity } from '@/store/playerStore';
import { TRACK_LIST, Track } from '@/lib/tracks';

// Components
import { FaMusic, FaHeart } from 'react-icons/fa';
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
  const { 
    identity, 
    audioUnlocked, 
    currentView,
    setRoomCode, 
    setIdentity, 
    setTrack, 
    setIsPlaying, 
    setProgress, 
    setPartnerOnline 
  } = usePlayerStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Real-time Search Fetcher (Debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  
  return (
    <div className="flex flex-col h-svh overflow-hidden bg-[#0a0510] text-gray-100 font-sans relative">
      {/* Background Decor */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-purple-900/20 to-[#0a0510] pointer-events-none z-[-10]"></div>
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-pink-600/5 blur-[120px] rounded-full pointer-events-none z-[-10]"></div>

      <TopBar onSearch={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden relative z-0">
        <div className="hidden md:flex relative z-30">
          <Sidebar />
        </div>
        
        <main className="flex-1 flex flex-col overflow-y-auto w-full pt-4 custom-scrollbar pb-36 px-4 md:px-0 relative z-10 pointer-events-auto">
           
           <div className="flex-1 w-full max-w-5xl mx-auto">
              {/* Header Info */}
              <div className="px-2 md:px-6 pt-2 pb-6">
                 <h2 className="text-xs font-bold text-purple-400/60 uppercase tracking-[0.3em] mb-2">Private Lobby • {code}</h2>
                 <div className="flex items-center gap-3">
                    <div className="glass-panel text-pink-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-pink-500/10 border-pink-500/20">
                       <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,114,182,1)]"></span>
                       Live Session
                    </div>
                 </div>
              </div>

              {searchQuery ? (
                 <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-2">
                       <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                          Results for "{searchQuery}"
                       </h2>
                       {isSearching && (
                          <div className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest">
                             <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></span>
                             Searching...
                          </div>
                       )}
                    </div>

                    {!isSearching && searchResults.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-[40px] border-white/5 bg-white/5">
                          <span className="text-4xl mb-4">😢</span>
                          <h2 className="text-xl font-bold mb-1">No songs found</h2>
                          <p className="text-gray-400 text-sm">Try searching for something else!</p>
                       </div>
                    ) : (
                       <CardGrid tracks={searchResults} title="" />
                    )}
                 </div>
              ) : (
                 <div className="animate-in fade-in duration-500">
                    {currentView === 'HOME' && (
                       <div className="flex flex-col gap-10 md:gap-14">
                          <div className="mt-2 text-center md:text-left">
                             <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tighter">Your Special <br/> Soundtrack</h1>
                             <p className="text-gray-400 max-w-lg text-sm md:text-base font-medium">Curated songs for Abhishek & Radhika. Every beat is a memory, every lyric is a feeling.</p>
                          </div>
                          
                          <div className="mt-2">
                             <CardGrid tracks={TRACK_LIST.slice(0, 5)} title="Made for You Two 💖" />
                          </div>
                          
                          <div className="mt-2">
                             <TrackQueue tracks={TRACK_LIST.slice(5, 10)} />
                          </div>
                       </div>
                    )}
                    
                    {currentView === 'EXPLORE' && (
                       <div className="flex flex-col gap-6">
                          <div className="flex items-center justify-between mb-2">
                             <h2 className="text-2xl font-bold tracking-tight">Explore the Collection</h2>
                             <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{TRACK_LIST.length} Songs Available</span>
                          </div>
                          <CardGrid tracks={TRACK_LIST} title="All Songs" />
                       </div>
                    )}

                    {currentView === 'LIBRARY' && (
                       <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-[40px] border-purple-500/20 bg-purple-900/10">
                          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                             <FaMusic className="text-3xl text-purple-400" />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">Your Shared Library</h2>
                          <p className="text-gray-400 max-w-xs mx-auto text-sm">A collection of every song you've ever listened to together. Coming soon!</p>
                       </div>
                    )}

                    {currentView === 'LIKED' && (
                       <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-[40px] border-pink-500/20 bg-pink-900/10">
                          <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6">
                             <FaHeart className="text-3xl text-pink-400 animate-pulse" />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">Favorite Moments</h2>
                          <p className="text-gray-400 max-w-xs mx-auto text-sm">Songs that touch your hearts. Click the heart on any song to add it here!</p>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </main>
      </div>

      <div className="mt-2 text-center text-[10px] font-black text-white/10 tracking-[0.5em] pb-10 uppercase pointer-events-none">
        SyncPlay • Exclusive Love Edition
      </div>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-[100px] left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
         <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-10 shadow-2xl pointer-events-auto shadow-purple-900/50">
           <div className="flex flex-col items-center gap-1 cursor-pointer text-pink-400">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             <span className="text-[9px] font-black uppercase tracking-widest">Listen</span>
           </div>
           <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-500 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
             <span className="text-[9px] font-black uppercase tracking-widest">Chat</span>
           </div>
         </div>
      </div>

      <PlayerBar />
      <SyncToast />
      <YoutubePlayer />
      
      {/* Step 2: Strict Unmount logic - Overlay must be destroyed completely after click */}
      {!audioUnlocked && identity === 'guest' ? <AudioUnlockOverlay /> : null}
    </div>
  );
}
