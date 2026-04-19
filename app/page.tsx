'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPlay } from 'react-icons/fa';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SP-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function LandingPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    const code = generateCode();
    
    // Set identity as host
    localStorage.setItem(`syncplay_identity_${code}`, 'host');
    setCreatedCode(code);
    setLoading(false);
  };

  const joinRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    
    setLoading(true);

    localStorage.setItem(`syncplay_identity_${code}`, 'guest');
    router.push(`/room/${code}`);
  };

  return (
    <main className="flex flex-col items-center justify-center flex-1 bg-ytDark p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ytRed/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="z-10 flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-ytRed rounded-xl flex items-center justify-center">
           <FaPlay className="text-white ml-1 text-xl" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">SyncPlay</h1>
      </div>
      
      <p className="text-gray-400 text-xl font-light mb-12 text-center max-w-md">
        Listen together. In perfect sync.
      </p>

      {!createdCode ? (
        <div className="flex flex-col w-full max-w-sm gap-8">
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition text-lg disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute border-t border-ytBorder w-full"></div>
            <span className="bg-ytDark px-4 text-sm text-gray-500 relative z-10 font-medium tracking-widest uppercase">OR</span>
          </div>

          <form onSubmit={joinRoom} className="flex flex-col gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter room code (SP-XXXX)"
              className="w-full bg-ytGray border border-ytBorderActive rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-ytRed transition uppercase text-center tracking-widest"
            />
            <button
              type="submit"
              disabled={loading || !joinCode}
              className="w-full py-4 bg-ytBorderActive text-white font-medium rounded-full hover:bg-gray-700 transition disabled:opacity-50"
            >
              Join Room
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-ytGray border border-ytBorderActive p-8 rounded-2xl flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-300">
           <div className="p-4 bg-ytRed/10 rounded-full">
              <FaPlay className="text-ytRed text-3xl ml-1" />
           </div>
           <div>
             <h2 className="text-2xl font-bold mb-2">Room Created!</h2>
             <p className="text-gray-400">Share this code with Radhika:</p>
           </div>
           
           <div className="bg-ytDark border border-ytBorderActive px-6 py-4 rounded-xl w-full">
              <span className="text-3xl font-mono tracking-widest font-bold text-ytRed">{createdCode}</span>
           </div>
           
           <button
             onClick={() => router.push(`/room/${createdCode}`)}
             className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition mt-2"
           >
             Enter Room
           </button>
        </div>
      )}
    </main>
  );
}
