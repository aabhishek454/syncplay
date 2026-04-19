'use client';
import { FaHome, FaGlobe, FaMusic, FaHeart } from 'react-icons/fa';
import { usePlayerStore } from '@/store/playerStore';

export default function Sidebar() {
  const { currentView, setCurrentView } = usePlayerStore();

  const handleViewChange = (view: 'HOME' | 'EXPLORE' | 'LIBRARY' | 'LIKED') => {
    console.log(`[NAV] Switching View to: ${view}`);
    setCurrentView(view);
  };

  return (
    <div className="w-[220px] bg-[#0a0510]/60 backdrop-blur-md border-r border-[#1a1a1a] flex flex-col pt-3 pb-8 shrink-0 overflow-y-auto hidden md:flex relative z-30 pointer-events-auto">
      
      {/* Primary Nav */}
      <div className="flex flex-col px-3 gap-1">
        <NavItem 
           icon={<FaHome />} 
           label="Home" 
           active={currentView === 'HOME'} 
           onClick={() => handleViewChange('HOME')} 
        />
        <NavItem 
           icon={<FaGlobe />} 
           label="Explore" 
           active={currentView === 'EXPLORE'} 
           onClick={() => handleViewChange('EXPLORE')} 
        />
        <NavItem 
           icon={<FaMusic />} 
           label="Library" 
           active={currentView === 'LIBRARY'} 
           onClick={() => handleViewChange('LIBRARY')} 
        />
        <NavItem 
           icon={<FaHeart />} 
           label="Liked" 
           active={currentView === 'LIKED'} 
           onClick={() => handleViewChange('LIKED')} 
        />
      </div>

      <div className="mx-6 my-4 border-t border-[#1a1a1a]"></div>

      {/* Playlists */}
      <div className="flex flex-col px-3">
        <span className="text-[12px] text-gray-400 font-semibold mb-2 px-3">PLAYLISTS</span>
        
        <Playlist thumbColor="bg-pink-500" name="For Radhika" count="SyncPlay Special" />
        <Playlist thumbColor="bg-blue-500" name="Late Night Vibes" count="124 songs" />
        <Playlist thumbColor="bg-purple-600" name="Top 100 Hip Hop" count="100 songs" />
      </div>

    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 py-3 px-3 rounded-xl cursor-pointer transition-all group ${
        active ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
    >
       <div className={`text-xl transition-transform group-hover:scale-110 ${active ? 'text-purple-400' : 'group-hover:text-pink-400'}`}>
          {icon}
       </div>
       <span className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </div>
  );
}

function Playlist({ thumbColor, name, count }: { thumbColor: string, name: string, count: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-xl cursor-pointer group">
       <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${thumbColor} shadow-md`}>
          <FaMusic className="text-white/80 text-xs" />
       </div>
       <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-white truncate">{name}</span>
          <span className="text-[11px] text-gray-400 truncate">{count}</span>
       </div>
    </div>
  );
}
