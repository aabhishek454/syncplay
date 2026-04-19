'use client';
import { FaHome, FaGlobe, FaMusic, FaHeart, FaStar } from 'react-icons/fa';
import { usePlayerStore } from '@/store/playerStore';

export default function Sidebar() {
  const { currentView, setCurrentView, setSearchQuery } = usePlayerStore();

  const handlePlaylistClick = (name: string, query: string) => {
    console.log(`[PLAYLIST] Searching for: ${query}`);
    setSearchQuery(query);
    setCurrentView('EXPLORE'); // Switch to search/explore view to show results
  };

  return (
    <div className="w-[260px] glass-panel border-r border-white/5 flex flex-col pt-6 pb-8 shrink-0 overflow-y-auto hidden md:flex relative z-30 group/sidebar">
      
      {/* Brand/User Logo Area */}
      <div className="px-6 mb-8">
        <h1 className="text-xl font-black italic bg-gradient-to-r from-white to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
          Sync<span className="text-pink-500">Love</span> <FaHeart className="text-xs animate-pulse text-pink-500" />
        </h1>
      </div>

      {/* Primary Nav */}
      <div className="flex flex-col px-4 gap-1">
        <NavItem 
           icon={<FaHome />} 
           label="Lounge" 
           active={currentView === 'HOME'} 
           onClick={() => setCurrentView('HOME')} 
        />
        <NavItem 
           icon={<FaGlobe />} 
           label="Discover" 
           active={currentView === 'EXPLORE'} 
           onClick={() => setCurrentView('EXPLORE')} 
        />
        <NavItem 
           icon={<FaMusic />} 
           label="Our Library" 
           active={currentView === 'LIBRARY'} 
           onClick={() => setCurrentView('LIBRARY')} 
        />
        <NavItem 
           icon={<FaStar />} 
           label="Favorites" 
           active={currentView === 'LIKED'} 
           onClick={() => setCurrentView('LIKED')} 
        />
      </div>

      <div className="mx-6 my-6 border-t border-white/5"></div>

      {/* Playlists */}
      <div className="flex flex-col px-4 space-y-1">
        <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-3 px-3">Curated for Us</span>
        
        <Playlist 
          icon={<FaHeart className="text-pink-400" />} 
          name="For Radhika 💖" 
          description="Romantic Specials"
          onClick={() => handlePlaylistClick("For Radhika", "romantic love songs for wife")}
        />
        <Playlist 
          icon={<FaStar className="text-yellow-400" />} 
          name="Abhishek's Picks" 
          description="Lofi & Beats"
          onClick={() => handlePlaylistClick("Abhishek's Picks", "lofi hip hop radio study sleep")}
        />
        <Playlist 
          icon={<FaMusic className="text-purple-400" />} 
          name="Our Roadtrip" 
          description="Bollywood Hits"
          onClick={() => handlePlaylistClick("Our Roadtrip", "bollywood romantic road trip songs")}
        />
        <Playlist 
          icon={<FaGlobe className="text-blue-400" />} 
          name="Late Night" 
          description="Mellow Vibes"
          onClick={() => handlePlaylistClick("Late Night", "late night mellow mood songs")}
        />
      </div>

      {/* Bottom Status */}
      <div className="mt-auto px-6 pt-4">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sync Active</span>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 py-3 px-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
        active 
          ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
          : 'text-white/40 hover:bg-white/5 hover:text-white/80'
      }`}
    >
       <div className={`text-lg transition-transform duration-500 group-hover:scale-110 ${active ? 'text-pink-500' : 'group-hover:text-pink-400'}`}>
          {icon}
       </div>
       <span className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </div>
  );
}

function Playlist({ icon, name, description, onClick }: { icon: React.ReactNode, name: string, description: string, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-2xl cursor-pointer group transition-all"
    >
       <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-white/5 border border-white/5 shadow-inner transition-transform group-hover:scale-105">
          {icon}
       </div>
       <div className="flex flex-col truncate">
          <span className="text-sm font-bold text-white/90 truncate group-hover:text-white">{name}</span>
          <span className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{description}</span>
       </div>
    </div>
  );
}
