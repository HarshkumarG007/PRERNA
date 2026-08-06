import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakTrackerProps {
  days: number;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ days }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
      >
        <Flame className="text-amber-400" size={20} />
      </motion.div>
      <div>
        <span className="text-amber-400 font-bold">{days}</span>
        <span className="text-amber-400/70 text-sm ml-1">day streak</span>
      </div>
    </motion.div>
  );
};
