'use client';
import { usePlayerStore } from '@/store/playerStore';

export default function SyncToast() {
  const toasts = usePlayerStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-[100px] right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="bg-black/90 border border-gray-800 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right fade-in duration-300"
        >
          <span className="text-ytRed font-bold mr-2">•</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
