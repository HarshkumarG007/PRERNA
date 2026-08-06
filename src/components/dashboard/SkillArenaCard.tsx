import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, ChevronRight } from 'lucide-react';

interface SkillArenaCardProps {
  onClick: () => void;
}

export const SkillArenaCard: React.FC<SkillArenaCardProps> = ({ onClick }) => {
  const gamesPlayed = 2;
  const totalGames = 5;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-left shadow-lg backdrop-blur-md"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/30 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5 shadow-inner">
          <Zap className="text-emerald-300" size={28} />
        </div>

        <h3 className="text-white font-black text-xl mb-1.5">Skill Arena</h3>
        <p className="text-white/60 font-medium text-sm mb-5">Train your cognitive abilities</p>

        {/* Progress */}
        <div className="mb-5 bg-black/20 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-white/50 uppercase tracking-wider">Weekly Progress</span>
            <span className="text-emerald-400">{gamesPlayed}/{totalGames}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              style={{ width: `${(gamesPlayed / totalGames) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Trophy className="text-amber-400" size={16} />
            <span className="text-white/70 font-bold text-sm">850 pts</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-950 font-bold text-sm bg-emerald-400 hover:bg-emerald-300 transition-colors px-4 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">
            Play <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </motion.button>
  );
};
