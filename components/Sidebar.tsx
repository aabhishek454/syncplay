'use client';
import { FaHome, FaGlobe, FaMusic, FaHeart } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="w-[220px] bg-ytBlack border-r border-[#1a1a1a] flex flex-col pt-3 pb-8 shrink-0 overflow-y-auto hidden md:flex">
      
      {/* Primary Nav */}
      <div className="flex flex-col px-3">
        <div className="flex items-center gap-4 py-3 px-3 bg-ytHover rounded-xl cursor-pointer">
           <FaHome className="text-xl" />
           <span className="text-sm font-medium">Home</span>
        </div>
        <div className="flex items-center gap-4 py-3 px-3 hover:bg-ytHover rounded-xl cursor-pointer text-gray-300">
           <FaGlobe className="text-xl" />
           <span className="text-sm font-medium">Explore</span>
        </div>
        <div className="flex items-center gap-4 py-3 px-3 hover:bg-ytHover rounded-xl cursor-pointer text-gray-300">
           <FaMusic className="text-xl" />
           <span className="text-sm font-medium">Library</span>
        </div>
        <div className="flex items-center gap-4 py-3 px-3 hover:bg-ytHover rounded-xl cursor-pointer text-gray-300">
           <FaHeart className="text-xl" />
           <span className="text-sm font-medium">Liked</span>
        </div>
      </div>

      <div className="mx-6 my-4 border-t border-[#1a1a1a]"></div>

      {/* Playlists */}
      <div className="flex flex-col px-3">
        <span className="text-[12px] text-gray-400 font-semibold mb-2 px-3">PLAYLISTS</span>
        
        <Playlist thumbColor="bg-pink-500" name="For Radhika" count="SyncPlay Special" />
        <Playlist thumbColor="bg-blue-500" name="Late Night Vibes" count="124 songs" />
        <Playlist thumbColor="bg-purple-600" name="Top 100 Hip Hop" count="100 songs" />
        <Playlist thumbColor="bg-orange-500" name="Arijit Singh Best" count="45 songs" />
        <Playlist thumbColor="bg-green-500" name="Study Lo-fi" count="89 songs" />
      </div>

    </div>
  );
}

function Playlist({ thumbColor, name, count }: { thumbColor: string, name: string, count: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-ytHover rounded-xl cursor-pointer group">
       <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${thumbColor}`}>
          <FaMusic className="text-white/80 text-xs" />
       </div>
       <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-white truncate">{name}</span>
          <span className="text-[11px] text-gray-400 truncate">{count}</span>
       </div>
    </div>
  );
}
