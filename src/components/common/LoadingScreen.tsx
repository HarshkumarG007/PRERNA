import React from 'react';
import { motion } from 'framer-motion';
import { PrernaLogo } from './PrernaLogo';
import { ShieldCheck } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070A14] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background celestial ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-600/15 via-fuchsia-600/10 to-rose-600/15 blur-[120px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-8 px-6"
      >
        <PrernaLogo variant="full" size="xl" animate={true} />

        <div className="flex flex-col items-center gap-2 max-w-sm text-center">
          <motion.p 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-slate-300 text-sm font-medium tracking-wide"
          >
            Securing your privacy sanctuary...
          </motion.p>
          
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Encrypted local storage • No third-party data tracking</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
