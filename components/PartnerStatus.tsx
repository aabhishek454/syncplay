'use client';
import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useSupabaseChannel } from '@/lib/roomSync';

export default function PartnerStatus() {
  const { partnerOnline, setPartnerOnline, code } = usePlayerStore();
  const channel = useSupabaseChannel(code ? `room:${code}` : '');

  useEffect(() => {
    if (!channel) return;
    const handle = (payload: any) => {
      if (payload.event === 'heartbeat') setPartnerOnline(true);
    };
    channel.on('broadcast', { event: 'heartbeat' }, handle);
    
    // reset online status if no heartbeat after 10s
    const checkInterval = setInterval(() => {
        setPartnerOnline(false);
    }, 10000);
    
    return () => {
        channel.off('broadcast', handle);
        clearInterval(checkInterval);
    }
  }, [channel, setPartnerOnline]);

  return (
    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
      <span className="relative flex h-3 w-3">
        {partnerOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${partnerOnline ? 'bg-green-500' : 'bg-slate-600'}`}></span>
      </span>
      <span className="text-sm font-medium text-slate-300">
        Partner {partnerOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
