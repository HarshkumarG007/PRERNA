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
      className="relative overflow-hidden p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-300 text-left glass-panel transition-colors"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/30 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mb-5 shadow-sm">
          <Zap size={28} />
        </div>

        <h3 className="text-slate-900 font-black text-xl mb-1.5">Skill Arena</h3>
        <p className="text-slate-500 font-medium text-sm mb-5">Train your cognitive abilities</p>

        {/* Progress */}
        <div className="mb-5 bg-white/50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-500 uppercase tracking-wider">Weekly Progress</span>
            <span className="text-emerald-600">{gamesPlayed}/{totalGames}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              style={{ width: `${(gamesPlayed / totalGames) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Trophy className="text-amber-500" size={16} />
            <span className="text-slate-700 font-bold text-sm">850 pts</span>
          </div>
          <div className="flex items-center gap-1 text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 transition-colors px-4 py-1.5 rounded-xl shadow-md shadow-emerald-600/20">
            Play <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </motion.button>
  );
};
