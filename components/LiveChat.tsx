'use client';
import { useState, useRef, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { broadcastEvent } from '@/lib/roomSync';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

export default function LiveChat() {
  const { messages, user, roomCode } = usePlayerStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    broadcastEvent(roomCode, {
      type: 'chat',
      text: inputText.trim(),
      sender: user
    });

    setInputText('');
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden border-white/5">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs font-black uppercase tracking-widest text-white/70">Private Lounge</span>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-20">
            <FaUserCircle className="text-4xl mb-2" />
            <p className="text-xs font-bold uppercase tracking-tighter">Your private sync space.<br/>Messages are not saved.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender === user;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm font-medium ${
                  isSelf 
                    ? 'bg-pink-600/90 text-white rounded-tr-none shadow-lg' 
                    : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] mt-1 text-white/20 uppercase font-black tracking-widest">
                  {isSelf ? 'You' : msg.sender}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5">
        <div className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a sweet message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-white/20"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-pink-600 hover:bg-pink-500 transition-colors"
          >
            <FaPaperPlane className="text-xs text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
