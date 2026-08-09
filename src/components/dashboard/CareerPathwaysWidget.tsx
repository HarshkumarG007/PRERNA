import React from 'react';
import { useAppStore } from '../../store';
import { classifyCareerPathways } from '../../ai/careerClassifier';
import { Compass, Briefcase, Zap, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const CareerPathwaysWidget: React.FC = () => {
  const { profile } = useAppStore();

  // If no trait data, we can't classify
  if (!profile?.personality?.bigFive || !profile?.personality?.riasec) {
    return (
      <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-3xl p-8 border border-white/5 relative overflow-hidden text-center h-full flex flex-col justify-center items-center space-y-4 shadow-xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
            <Compass size={32} />
         </div>
         <h3 className="text-xl font-bold text-white tracking-wide">Pathways Unmapped</h3>
         <p className="text-slate-400 max-w-sm">
           Complete Life Quests and the Skill Arena to gather enough data for the engine to map your potential career pathways.
         </p>
      </div>
    );
  }

  const pathways = classifyCareerPathways(profile.personality.bigFive, profile.personality.riasec);
  // Sort by match score
  const topPathways = [...pathways].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'startup': return <Zap size={24} className="text-yellow-400" />;
      case 'government': return <Globe size={24} className="text-emerald-400" />;
      case 'corporate': return <Briefcase size={24} className="text-blue-400" />;
      case 'creative': return <Award size={24} className="text-fuchsia-400" />;
      default: return <Compass size={24} className="text-cyan-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'startup': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'government': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300';
      case 'corporate': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'creative': return 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300';
      default: return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300';
    }
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Compass size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">AI Pathway Matrix</h2>
          <p className="text-slate-400 text-sm font-medium">Mapped from your core traits</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 relative z-10 overflow-y-auto custom-scrollbar pr-2">
        {topPathways.map((path, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={path.category} 
            className="group bg-black/40 hover:bg-white/5 p-5 rounded-2xl border border-white/5 transition-colors cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${getCategoryColor(path.category).split(' ')[0]} blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(path.category)}`}>
                  {getCategoryIcon(path.category)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{path.title}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{path.category}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{path.matchScore}%</span>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Match</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {path.description}
            </p>

            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${path.matchScore}%` }}
                 transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                 className={`h-full ${getCategoryColor(path.category).split(' ')[0].replace('/20', '')}`}
               />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
