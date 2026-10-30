import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, GraduationCap, Compass } from 'lucide-react';
import { PrernaLogo } from '../common/PrernaLogo';

interface RoleSelectionProps {
  onSelectTeen: () => void;
  onSelectAdult?: () => void;
  onSelectParent: () => void;
  onSelectEducator: () => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ 
  onSelectTeen, 
  onSelectAdult, 
  onSelectParent, 
  onSelectEducator 
}) => {
  return (
    <div className="fixed inset-0 flex flex-col md:grid md:grid-cols-4 bg-[#020617] overflow-y-auto md:overflow-hidden">
      {/* Top Floating Brand Badge */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <PrernaLogo variant="badge" size="sm" animate={true} />
      </div>

      {/* 1. Teen Side (Violet gamified) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 relative group cursor-pointer border-b md:border-b-0 md:border-r border-white/10 min-h-[220px] md:min-h-full"
        onClick={onSelectTeen}
      >
        <div className="absolute inset-0 bg-violet-600/10 group-hover:bg-violet-600/20 transition-colors duration-500" />
        <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-violet-500/20 flex items-center justify-center border border-violet-500/30 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
            <User size={36} className="text-violet-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">I'm a Teen</h2>
          <p className="text-violet-200/70 font-medium text-xs sm:text-sm max-w-xs">
            Personal self-discovery sanctuary, quests & zero-judgment AI guidance.
          </p>
        </div>
      </motion.div>

      {/* 2. Adult Side (Deep Indigo / Golden Wisdom) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 relative group cursor-pointer border-b md:border-b-0 md:border-r border-white/10 min-h-[220px] md:min-h-full bg-slate-950/60"
        onClick={onSelectAdult || onSelectTeen}
      >
        <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-colors duration-500" />
        <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_35px_rgba(99,102,241,0.25)]">
            <Compass size={36} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">I'm an Adult</h2>
          <p className="text-indigo-200/70 font-medium text-xs sm:text-sm max-w-xs">
            Swadharma, life transcendence, physical vitality & private relationships.
          </p>
        </div>
      </motion.div>

      {/* 3. Parent Side (Frost Glass) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 relative group cursor-pointer bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 min-h-[220px] md:min-h-full"
        onClick={onSelectParent}
      >
        <div className="absolute inset-0 bg-cyan-200/20 group-hover:bg-cyan-300/30 transition-colors duration-500" />
        <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-lg shadow-cyan-200/50 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100">
            <Users size={36} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight">I'm a Parent</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-xs">
            Link with your teen to view insights and support their journey.
          </p>
        </div>
      </motion.div>

      {/* 4. Educator Side (Clean Slate Professional) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex-1 relative group cursor-pointer bg-white min-h-[220px] md:min-h-full"
        onClick={onSelectEducator}
      >
        <div className="absolute inset-0 bg-slate-50 group-hover:bg-slate-100 transition-colors duration-500" />
        <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
            <GraduationCap size={36} className="text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">I'm an Educator</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-xs">
            Anonymized cohort analytics and systemic wellbeing alerts.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
