'use client';

const genres = [
  'All', 'Mixed for you', 'Pop', 'Bollywood', 'Hip-hop', 'Lo-fi', 'Indie', 'Electronic', 'K-pop', 'Rock', 'Classical', 'Jazz', 'R&B'
];

export default function ChipsBar() {
  return (
    <div className="h-[46px] bg-ytDark border-b border-[#1a1a1a] shrink-0 sticky top-0 z-10 w-full overflow-x-auto no-scrollbar flex items-center px-6 gap-3">
       {genres.map((g, i) => (
         <div 
            key={g} 
            className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
              i === 0 ? 'bg-white text-black' : 'bg-[#1e1e1e] text-white hover:bg-white/20'
            }`}
         >
            {g}
         </div>
       ))}
    </div>
  );
}
