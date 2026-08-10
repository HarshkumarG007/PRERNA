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
      className={`relative overflow-hidden p-6 rounded-3xl text-left transition-all glass-panel ${
        isCompleted 
          ? 'bg-emerald-50/80 border-emerald-200' 
          : 'bg-violet-50/80 border-violet-200 hover:border-violet-300'
      }`}
    >
      {/* Background Glow */}
      {!isCompleted && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/30 rounded-full blur-[40px] pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${
          isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-violet-600'
        }`}>
          <Target size={28} />
        </div>

        <h3 className="text-slate-900 font-black text-xl mb-1.5">Life Quest</h3>
        <p className="text-slate-500 font-medium text-sm mb-5">
          {isCompleted 
            ? `Completed! Score: ${todaysQuest.score}` 
            : "Discover yourself through story"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock size={16} />
            <span>2 min</span>
          </div>
          
          {isCompleted ? (
            <span className="text-emerald-600 font-bold text-sm bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-200">✓ Done</span>
          ) : (
            <div className="flex items-center gap-1 text-white font-bold text-sm bg-violet-600 hover:bg-violet-700 transition-colors px-4 py-1.5 rounded-xl shadow-md shadow-violet-600/20">
              Start <ChevronRight size={18} />
            </div>
          )}
        </div>

        {/* Streak Badge */}
        {!isCompleted && streak > 0 && (
          <div className="absolute top-0 right-0 flex items-center gap-1 px-3 py-1.5 bg-amber-100 rounded-bl-2xl rounded-tr-xl border-b border-l border-amber-200">
            <span className="text-amber-500 text-lg leading-none">🔥</span>
            <span className="text-amber-600 text-sm font-black">{streak}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};
