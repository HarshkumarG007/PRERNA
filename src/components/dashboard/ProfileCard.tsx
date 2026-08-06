import React from 'react';
import { motion } from 'framer-motion';
import { User, ChevronRight } from 'lucide-react';

interface ProfileCardProps {
  archetype: string;
  topCareer: string;
  onClick: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ archetype, topCareer, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 text-left transition-colors shadow-lg backdrop-blur-md h-full flex flex-col group"
  >
    <div className="flex items-start justify-between mb-5">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center shadow-inner group-hover:bg-violet-500/30 transition-colors">
        <User className="text-violet-400" size={28} />
      </div>
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <ChevronRight className="text-white/50 group-hover:text-white transition-colors" size={18} />
      </div>
    </div>

    <h3 className="text-white font-black text-2xl mb-1">{archetype}</h3>
    <p className="text-white/50 font-medium text-sm mb-5">Your personality archetype</p>

    <div className="p-4 bg-black/20 rounded-xl mt-auto border border-white/5">
      <p className="text-white/40 font-bold text-xs mb-1.5 uppercase tracking-wider">Top Career Match</p>
      <p className="text-emerald-400 font-black">{topCareer}</p>
    </div>
  </motion.button>
);
