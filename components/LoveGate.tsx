'use client';
import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { FaHeart, FaLock } from 'react-icons/fa';

export default function LoveGate() {
  const { setUser } = usePlayerStore();
  const [selectedUser, setSelectedUser] = useState<'abhishek' | 'radhika' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  // Floating petals effect
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      size: Math.random() * 15 + 10 + 'px',
      duration: Math.random() * 8 + 6 + 's',
      delay: Math.random() * 5 + 's',
    }));
    setPetals(newPetals);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select who you are first ❤️');
      return;
    }
    if (password === '1609') {
      setIsExiting(true);
      setTimeout(() => {
        localStorage.setItem('syncplay_user', selectedUser);
        setUser(selectedUser);
      }, 800);
    } else {
      setError('Wrong code, love birds! ❌');
      setPassword('');
    }
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center transition-all duration-1000 ${
      isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[#0D0812] overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"></div>
        
        {petals.map(p => (
          <div 
            key={p.id}
            className="petal"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: Math.random() > 0.5 ? '#E8447A' : '#FF8FAB',
              borderRadius: '50% 0 50% 50%',
              animationDuration: p.duration,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      <div className="glass-panel w-full max-w-md mx-4 p-10 rounded-[40px] border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4 animate-float">
            <FaHeart className="text-pink-500 text-3xl" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent italic mb-2">
            Abhi & Radhu
          </h1>
          <p className="text-gray-400 text-sm font-medium">Identify yourself to enter our space</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <UserCard 
              name="Abhishek" 
              active={selectedUser === 'abhishek'} 
              onClick={() => { setSelectedUser('abhishek'); setError(''); }} 
            />
            <UserCard 
              name="Radhika" 
              active={selectedUser === 'radhika'} 
              onClick={() => { setSelectedUser('radhika'); setError(''); }} 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FaLock className="text-white/20" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Love Code"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-center focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-white/10 font-bold tracking-[0.2em]"
            />
          </div>

          {error && (
            <p className="text-pink-500 text-xs text-center font-bold animate-bounce uppercase tracking-widest">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full btn-premium py-4 font-black uppercase tracking-[0.2em] transform transition-active active:scale-95"
          >
            Unlock Love
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-white/10 font-black uppercase tracking-[0.5em]">
          Forever & Always
        </div>
      </div>
    </div>
  );
}

function UserCard({ name, active, onClick }: { name: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer transition-all duration-500 border ${
        active 
          ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_20px_rgba(232,68,122,0.3)]' 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className={`text-sm font-black transition-all ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
        {name}
      </div>
      {active && (
        <div className="absolute top-1 right-2 animate-pulse">
          <FaHeart className="text-[10px] text-pink-500" />
        </div>
      )}
    </div>
  );
}
