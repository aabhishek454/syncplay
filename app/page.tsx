'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaHeart, FaPlay } from 'react-icons/fa';

export default function LandingPage() {
  const router = useRouter();
  const [petals, setPetals] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${6 + Math.random() * 6}s`,
      size: `${10 + Math.random() * 15}px`,
    }));
    setPetals(newPetals);
  }, []);

  const enterOurWorld = () => {
    router.push('/room/1609');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            fontSize: petal.size,
            color: Math.random() > 0.5 ? '#E8447A' : '#FF8FAB',
          }}
        >
          <FaHeart />
        </div>
      ))}

      {/* Main Content */}
      <div className="z-10 text-center px-4 max-w-2xl animate-float">
        <div className="glass-panel p-12 rounded-[40px] glow-pink border-white/10 relative overflow-hidden backdrop-blur-3xl">
          {/* Decorative Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E8447A] to-transparent opacity-50"></div>
          
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-[#E8447A] opacity-20 rounded-full"></div>
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative">
                <FaHeart className="text-[#E8447A] text-4xl animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter glow-text">
            Abhishek <span className="text-[#E8447A]">❤️</span> Radhika
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 font-light mb-12 tracking-wide">
            Our private space for shared rhythms and endless melodies.
          </p>

          <button
            onClick={enterOurWorld}
            className="group relative px-12 py-5 bg-[#E8447A] rounded-full font-bold text-xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(232,68,122,0.4)] active:scale-95 flex items-center gap-3 mx-auto"
          >
            <span className="relative z-10">Step Into Our World</span>
            <FaPlay className="text-sm group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-white/30 text-sm font-medium tracking-[0.3em] uppercase">
          Established September 16
        </p>
      </div>

      {/* Background radial gradients for depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#E8447A]/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#2D0A2E]/30 blur-[150px] rounded-full"></div>
    </main>
  );
}

