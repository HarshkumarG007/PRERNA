import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight } from 'lucide-react';

interface InsightsCardProps {
  strengths: string[];
  insights: string[];
  onClick?: () => void;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ strengths, insights, onClick }) => (
  <motion.button 
    onClick={onClick}
    disabled={!onClick}
    whileHover={onClick ? { scale: 1.02 } : {}}
    className={`p-6 rounded-3xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md text-left h-full flex flex-col group ${onClick ? 'cursor-pointer hover:border-white/30 transition-colors' : 'cursor-default'}`}
  >
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="text-amber-400" size={22} />
        </div>
        <h3 className="text-white font-black text-xl">Key Insights</h3>
      </div>
      {onClick && (
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronRight className="text-white/50 group-hover:text-white transition-colors" size={18} />
        </div>
      )}
    </div>

    <div className="space-y-4 mb-6">
      {insights.map((insight, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-start gap-3 bg-black/20 p-3 rounded-xl border border-white/5"
        >
          <span className="text-amber-400 mt-0.5 text-lg leading-none">•</span>
          <p className="text-white/80 font-medium text-sm leading-relaxed">{insight}</p>
        </motion.div>
      ))}
    </div>

    <div className="mt-auto pt-5 border-t border-white/10">
      <p className="text-white/40 font-bold text-xs mb-3 uppercase tracking-wider">Superpowers</p>
      <div className="flex flex-wrap gap-2">
        {strengths.map((strength) => (
          <span key={strength} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/20">
            {strength}
          </span>
        ))}
      </div>
    </div>
  </motion.button>
);
