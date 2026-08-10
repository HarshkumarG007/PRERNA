import React from 'react';
import { motion } from 'framer-motion';
import { User, ChevronRight } from 'lucide-react';

interface ProfileCardProps {
  archetype: string;
  topCareer: string;
  itemBankVersion?: string;
  onClick: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ archetype, topCareer, itemBankVersion, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    className="p-6 rounded-3xl glass-panel border-slate-200 hover:border-violet-300 text-left transition-colors shadow-lg backdrop-blur-md h-full flex flex-col group"
  >
    <div className="flex items-start justify-between mb-5">
      <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shadow-inner group-hover:bg-violet-200 transition-colors">
        <User className="text-violet-600" size={28} />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
        <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors" size={18} />
      </div>
    </div>

    <h3 className="text-slate-900 font-black text-2xl mb-1">{archetype}</h3>
    <p className="text-slate-500 font-medium text-sm mb-5">Your personality archetype</p>

    <div className="p-4 bg-slate-50 rounded-xl mt-auto border border-slate-200">
      <p className="text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Top Career Match</p>
      <p className="text-emerald-600 font-black mb-2">{topCareer}</p>
      {itemBankVersion && (
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-wide border-t border-slate-200 pt-2">
          Model: {itemBankVersion}
        </p>
      )}
    </div>
  </motion.button>
);
