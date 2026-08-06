import React from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WellnessPulseProps {
  score: number;
}

export const WellnessPulse: React.FC<WellnessPulseProps> = ({ score }) => {
  const getStatus = () => {
    if (score >= 80) return { label: 'Thriving', color: 'emerald', icon: TrendingUp };
    if (score >= 60) return { label: 'Doing Well', color: 'blue', icon: Minus };
    if (score >= 40) return { label: 'Managing', color: 'amber', icon: TrendingDown };
    return { label: 'Needs Care', color: 'rose', icon: TrendingDown };
  };

  const status = getStatus();
  const Icon = status.icon;

  // We need to handle Tailwind arbitrary color classes correctly in a real app,
  // but for the sake of the demo we'll map them explicitly to ensure they're compiled by tailwind
  const colorMap = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-400' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-400' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-400' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', bar: 'bg-rose-400' },
  };

  const colors = colorMap[status.color as keyof typeof colorMap];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center shadow-inner`}>
            <Heart className={colors.text} size={32} />
          </div>
          <div>
            <h3 className="text-white font-black text-xl mb-1">Wellness Pulse</h3>
            <p className={`${colors.text} font-bold text-sm flex items-center gap-1.5`}>
              <Icon size={16} />
              {status.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-4xl font-black ${colors.text}`}>{score}</div>
          <p className="text-white/40 font-medium text-xs mt-1">out of 100</p>
        </div>
      </div>

      {/* Mini chart visualization */}
      <div className="mt-6 flex items-end gap-1.5 h-16">
        {[65, 70, 68, 72, 75, 73, score].map((val, idx) => (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            animate={{ height: `${(val / 100) * 100}%` }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
            className={`flex-1 rounded-t-sm ${
              idx === 6 ? colors.bar : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};
