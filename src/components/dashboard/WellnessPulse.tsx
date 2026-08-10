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
    emerald: { bg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600', bar: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-50 text-blue-600', text: 'text-blue-600', bar: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50 text-amber-600', text: 'text-amber-600', bar: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50 text-rose-600', text: 'text-rose-600', bar: 'bg-rose-500' },
  };

  const colors = colorMap[status.color as keyof typeof colorMap];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl glass-panel transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center shadow-inner`}>
            <Heart className={colors.text} size={32} />
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-xl mb-1">Wellness Pulse</h3>
            <p className={`${colors.text} font-bold text-sm flex items-center gap-1.5`}>
              <Icon size={16} />
              {status.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-4xl font-black ${colors.text}`}>{score}</div>
          <p className="text-slate-400 font-medium text-xs mt-1">out of 100</p>
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
              idx === 6 ? colors.bar : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};
