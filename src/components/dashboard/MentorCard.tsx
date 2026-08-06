import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';

interface MentorCardProps {
  onClick: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ onClick }) => {
  const hasUnread = true;
  const lastMessage = "How are you feeling about your career options?";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-pink-500/30 hover:border-pink-500/50 text-left shadow-lg backdrop-blur-md flex flex-col h-full"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/30 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
            <MessageCircle className="text-pink-300" size={28} />
          </div>
          {hasUnread && (
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border-2 border-[#2a1738]"></span>
            </span>
          )}
        </div>

        <h3 className="text-white font-black text-xl mb-1.5">AI Mentor</h3>
        <p className="text-white/60 font-medium text-sm mb-4">Always here to listen</p>

        <div className="p-4 bg-black/20 rounded-xl border border-white/5 mb-4 flex-grow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
          <p className="text-white/80 font-medium text-sm italic pl-2">"{lastMessage}"</p>
        </div>

        <div className="flex justify-end">
            <div className="flex items-center justify-center gap-1.5 text-pink-950 font-bold text-sm bg-pink-400 hover:bg-pink-300 transition-colors px-4 py-1.5 rounded-xl shadow-lg shadow-pink-500/20 w-full sm:w-auto">
            <Sparkles size={16} />
            <span>Chat Now</span>
            </div>
        </div>
      </div>
    </motion.button>
  );
};
