import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, ChevronRight } from 'lucide-react';
import { useAppStore, useTodaySessions } from '../../store';

interface DailyQuestCardProps {
  onClick: () => void;
}

export const DailyQuestCard: React.FC<DailyQuestCardProps> = ({ onClick }) => {
  const todaySessions = useTodaySessions();
  
  // Check if user completed a life quest today
  const todaysQuest = todaySessions.find(s => s.type === 'life_quest');
  const isCompleted = !!todaysQuest;
  const streak = useAppStore(state => state.streak.currentStreak);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden p-6 rounded-3xl text-left transition-all shadow-lg ${
        isCompleted 
          ? 'bg-emerald-500/10 border border-emerald-500/30' 
          : 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 hover:border-violet-500/50 backdrop-blur-md'
      }`}
    >
      {/* Background Glow */}
      {!isCompleted && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/30 rounded-full blur-[40px] pointer-events-none" />
      )}

      <div className="relative">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-inner ${
          isCompleted ? 'bg-emerald-500/20' : 'bg-white/10'
        }`}>
          <Target className={isCompleted ? 'text-emerald-400' : 'text-violet-300'} size={28} />
        </div>

        <h3 className="text-white font-black text-xl mb-1.5">Life Quest</h3>
        <p className="text-white/60 font-medium text-sm mb-5">
          {isCompleted 
            ? `Completed! Score: ${todaysQuest.score}` 
            : "Discover yourself through story"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 font-bold text-sm bg-white/5 px-3 py-1.5 rounded-lg">
            <Clock size={16} />
            <span>2 min</span>
          </div>
          
          {isCompleted ? (
            <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1">✓ Done</span>
          ) : (
            <div className="flex items-center gap-1 text-white font-bold text-sm bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-1.5 rounded-xl shadow-lg shadow-violet-500/20">
              Start <ChevronRight size={18} />
            </div>
          )}
        </div>

        {/* Streak Badge */}
        {!isCompleted && streak > 0 && (
          <div className="absolute top-0 right-0 flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 rounded-bl-2xl rounded-tr-xl border-b border-l border-amber-500/20">
            <span className="text-amber-400 text-lg leading-none">🔥</span>
            <span className="text-amber-400 text-sm font-black">{streak}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};
