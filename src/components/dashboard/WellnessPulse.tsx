import React from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, Minus, Wind, Printer } from 'lucide-react';

interface WellnessPulseProps {
  score: number;
  onBreathe?: () => void;
  onExportBlueprint?: () => void;
  className?: string;
}

export const WellnessPulse: React.FC<WellnessPulseProps> = ({ 
  score, 
  onBreathe, 
  onExportBlueprint,
  className = '' 
}) => {
  const getStatus = () => {
    if (score >= 80) return { label: 'Thriving', color: 'emerald', icon: TrendingUp, desc: 'Optimal cognitive and emotional rhythm.' };
    if (score >= 60) return { label: 'Doing Well', color: 'blue', icon: Minus, desc: 'Balanced emotional regulation and clarity.' };
    if (score >= 40) return { label: 'Managing', color: 'amber', icon: TrendingDown, desc: 'Normal adolescent stressors detected. Grounding recommended.' };
    return { label: 'Needs Care', color: 'rose', icon: TrendingDown, desc: 'Gentle support and mindful pause advised.' };
  };

  const status = getStatus();
  const Icon = status.icon;

  const colorMap = {
    emerald: { bg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600', bar: 'bg-emerald-500', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-50 text-blue-600', text: 'text-blue-600', bar: 'bg-blue-500', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-50 text-amber-600', text: 'text-amber-600', bar: 'bg-amber-500', border: 'border-amber-200' },
    rose: { bg: 'bg-rose-50 text-rose-600', text: 'text-rose-600', bar: 'bg-rose-500', border: 'border-rose-200' },
  };

  const colors = colorMap[status.color as keyof typeof colorMap];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'Now'];
  const trendValues = [65, 70, 68, 72, 75, 73, score];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center shadow-inner flex-shrink-0`}>
              <Heart className={colors.text} size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 font-black text-base md:text-lg tracking-tight">Wellness Pulse</h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Live</span>
              </div>
              <p className={`${colors.text} font-bold text-xs flex items-center gap-1 mt-0.5`}>
                <Icon size={14} />
                <span>{status.label}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-3xl md:text-4xl font-black tracking-tight ${colors.text}`}>{score}</span>
              <span className="text-slate-400 font-semibold text-xs">/100</span>
            </div>
            <p className="text-slate-400 font-medium text-[10px] mt-0.5">Bi-weekly baseline</p>
          </div>
        </div>

        {/* Status description */}
        <p className="text-slate-500 text-xs mt-3 leading-relaxed">
          {status.desc}
        </p>

        {/* 7-day sparkline chart with day labels */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
            <span>7-Day Reflection Trend</span>
            <span className="text-slate-500">Avg {Math.round(trendValues.reduce((a, b) => a + b, 0) / trendValues.length)}%</span>
          </div>
          <div className="flex items-end gap-2 h-12">
            {trendValues.map((val, idx) => {
              const isToday = idx === trendValues.length - 1;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(15, (val / 100) * 100)}%` }}
                    transition={{ delay: idx * 0.05, duration: 0.4, type: 'spring' }}
                    className={`w-full rounded-t-sm transition-all ${
                      isToday 
                        ? `${colors.bar} shadow-sm shadow-blue-500/20` 
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`${days[idx]}: ${val}%`}
                  />
                  <span className={`text-[10px] font-bold ${isToday ? colors.text : 'text-slate-400'}`}>
                    {days[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Grounding Action Buttons */}
      {(onBreathe || onExportBlueprint) && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          {onBreathe && (
            <button
              onClick={onBreathe}
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Wind size={14} className="text-emerald-600" />
              <span>432 Hz Breathe</span>
            </button>
          )}
          {onExportBlueprint && (
            <button
              onClick={onExportBlueprint}
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={14} className="text-indigo-600" />
              <span>Life Blueprint</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
