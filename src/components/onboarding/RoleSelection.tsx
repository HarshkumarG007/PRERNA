import React from 'react';
import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';

interface RoleSelectionProps {
  onSelectTeen: () => void;
  onSelectParent: () => void;
  onSelectEducator: () => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectTeen, onSelectParent, onSelectEducator }) => {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#020617] overflow-hidden">
      {/* Teen Side (Dark gamified) */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex-1 relative group cursor-pointer border-b md:border-b-0 md:border-r border-white/10"
        onClick={onSelectTeen}
      >
        <div className="absolute inset-0 bg-violet-600/10 group-hover:bg-violet-600/20 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        
        <div className="h-full flex flex-col items-center justify-center p-12 text-center relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-violet-500/20 flex items-center justify-center border border-violet-500/30 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <User size={48} className="text-violet-400" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">I'm a Teen</h2>
          <p className="text-violet-200/70 font-medium max-w-sm text-lg">
            Create your private, secure profile. 100% data sovereignty.
          </p>
        </div>
      </motion.div>

      {/* Parent Side (Frost Glass) */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, delay: 0.1 }}
        className="flex-1 relative group cursor-pointer bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden"
        onClick={onSelectParent}
      >
        <div className="absolute inset-0 bg-cyan-200/20 group-hover:bg-cyan-300/30 transition-colors duration-500 blur-3xl" />
        
        <div className="h-full flex flex-col items-center justify-center p-12 text-center relative z-10">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl shadow-cyan-200/50 mb-8 group-hover:scale-110 transition-transform duration-500 border border-slate-100">
            <Users size={48} className="text-indigo-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">I'm a Parent</h2>
          <p className="text-slate-500 font-medium max-w-sm text-lg">
            Link with your teen to view insights and support their journey.
          </p>
        </div>
      </motion.div>

      {/* Educator Side (Enterprise / Professional) */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, delay: 0.2 }}
        className="flex-1 relative group cursor-pointer bg-white overflow-hidden"
        onClick={onSelectEducator}
      >
        <div className="absolute inset-0 bg-slate-50 group-hover:bg-slate-100 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-text-pattern.png')] opacity-10" />
        
        <div className="h-full flex flex-col items-center justify-center p-12 text-center relative z-10">
          <div className="w-24 h-24 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M4 19.5v-15A2.5 2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">I'm an Educator</h2>
          <p className="text-slate-500 font-medium max-w-sm text-lg">
            Access anonymized cohort data and systemic wellbeing alerts.
          </p>
        </div>
      </motion.div>

      {/* Center Divider / Logo */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-100">
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 tracking-tighter">PR</span>
        </div>
      </div>
    </div>
  );
};
