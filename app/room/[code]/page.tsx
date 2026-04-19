'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { initRoomSync } from '@/lib/roomSync';
import { usePlayerStore } from '@/store/playerStore';
import { TRACK_LIST, Track } from '@/lib/tracks';

// Components
import Sidebar from '@/components/Sidebar';
import CardGrid from '@/components/CardGrid';
import TrackQueue from '@/components/TrackQueue';
import PlayerBar from '@/components/PlayerBar';
import SyncToast from '@/components/SyncToast';
import YoutubePlayer from '@/components/YoutubePlayer';
import AudioUnlockOverlay from '@/components/AudioUnlockOverlay';
import LoveGate from '@/components/LoveGate';
import LiveChat from '@/components/LiveChat';
import { FaSearch, FaVolumeUp, FaSyncAlt, FaHeart } from 'react-icons/fa';

export default function RoomPage() {
  const { code } = useParams() as { code: string };
  const { 
    identity, 
    audioUnlocked, 
    currentView,
    isAuthenticated,
    user,
    searchQuery: storeSearchQuery,
    setRoomCode, 
    setIdentity, 
    setPartnerOnline,
    setSearchQuery: setStoreSearchQuery
  } = usePlayerStore();
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync Local Search with Store Search (for playlist clicks)
  useEffect(() => {
    if (storeSearchQuery) {
      setLocalSearchQuery(storeSearchQuery);
      handleSearch(storeSearchQuery);
    }
  }, [storeSearchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data.songs || (Array.isArray(data) ? data : []);
      
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        const local = TRACK_LIST.filter(t => 
           t.title.toLowerCase().includes(query.toLowerCase()) || 
           t.artist.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(local);
      }
    } catch (err) {
      console.error("Search fetch failed:", err);
      const local = TRACK_LIST.filter(t => 
         t.title.toLowerCase().includes(query.toLowerCase()) || 
         t.artist.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(local);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!code) return;

    setRoomCode(code);

    let preservedUser = localStorage.getItem('syncplay_user');
    if (preservedUser) {
      usePlayerStore.getState().setUser(preservedUser as any);
    }

    let unsubscribe: (() => void) | undefined;
    
    initRoomSync(code).then(res => {
        unsubscribe = res.unsubscribe;
    });

    return () => {
      if (unsubscribe) unsubscribe();
      setPartnerOnline(false);
    };
  }, [code]);

  if (!isAuthenticated) {
    return <LoveGate />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0D0812] text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-600/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Column 1: Sidebar */}
        <Sidebar />
        
        {/* Column 2: Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-black/20">
          {/* Internal Header / Search Bar */}
          <div className="p-6 md:p-8 flex items-center justify-between">
            <div className="relative w-full max-w-xl">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text"
                value={localSearchQuery}
                onChange={(e) => {
                  setLocalSearchQuery(e.target.value);
                  setStoreSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'ENTER' && handleSearch(localSearchQuery)}
                placeholder="Search for our favorite songs..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-pink-500/50 transition-all font-medium placeholder:text-white/10"
              />
            </div>
            
            <div className="hidden md:flex items-center gap-4 ml-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Listening with</span>
                <span className="text-sm font-bold italic">{user === 'abhishek' ? 'Radhika 💖' : 'Abhishek ❤️'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0D0812] flex items-center justify-center font-black text-xs">
                  {user === 'abhishek' ? 'A' : 'R'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-32 custom-scrollbar">
            {localSearchQuery ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic">Search Results</h2>
                  {isSearching && <FaSyncAlt className="animate-spin text-pink-500" />}
                </div>
                {searchResults.length === 0 && !isSearching ? (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-xl font-bold">No songs found in the universe...</p>
                  </div>
                ) : (
                  <CardGrid tracks={searchResults} title="" />
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                {currentView === 'HOME' && (
                  <>
                    <div className="mb-12">
                      <h1 className="text-5xl md:text-7xl font-black italic mb-4 tracking-tighter">
                        Hello, <span className="text-pink-500">{user === 'abhishek' ? 'Abhi' : 'Radhu'}</span>
                      </h1>
                      <p className="text-white/40 font-medium max-w-lg">Welcome to our private music lounge. Everything is synced in real-time, just for us.</p>
                    </div>
                    <CardGrid tracks={TRACK_LIST.slice(0, 4)} title="Recently Shared 💝" />
                    <div className="mt-12">
                      <TrackQueue tracks={TRACK_LIST.slice(4, 10)} />
                    </div>
                  </>
                )}
                
                {currentView === 'EXPLORE' && (
                  <CardGrid tracks={TRACK_LIST} title="All Songs" />
                )}

                {(currentView === 'LIBRARY' || currentView === 'LIKED') && (
                  <div className="py-20 text-center glass-panel rounded-[40px] border-white/5 mx-auto max-w-lg">
                    <FaHeart className="mx-auto text-4xl text-pink-500/20 mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">Our Private Vault</h3>
                    <p className="text-white/20 text-sm">We're still curating this section. Stay tuned!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Column 3: Chat */}
        <aside className="w-[350px] shrink-0 p-6 hidden lg:flex flex-col relative z-20">
          <LiveChat />
        </aside>
      </div>

      <PlayerBar />
      <SyncToast />
      <YoutubePlayer />
      
      {!audioUnlocked && <AudioUnlockOverlay />}
    </div>
  );
}
