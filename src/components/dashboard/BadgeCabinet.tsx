import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, Heart, Compass, Brain, Sparkles, Zap } from 'lucide-react';
import { UnifiedProfile } from '../../store';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.FC<any>;
  color: string;
  isUnlocked: boolean;
}

interface BadgeCabinetProps {
  profile: UnifiedProfile | null;
}

export const BadgeCabinet: React.FC<BadgeCabinetProps> = ({ profile }) => {
  if (!profile) return null;

  // Determine badges based on profile scores
  const badges: Badge[] = [
    {
      id: 'empath',
      name: 'The Empath',
      description: 'Awarded for demonstrating high Agreeableness and Emotional Empathy.',
      icon: Heart,
      color: 'pink',
      isUnlocked: profile.personality.bigFive.agreeableness > 70 || profile.personality.emotional.empathy > 70
    },
    {
      id: 'visionary',
      name: 'The Visionary',
      description: 'Awarded for high Openness to experience and creativity.',
      icon: Sparkles,
      color: 'indigo',
      isUnlocked: profile.personality.bigFive.openness > 75
    },
    {
      id: 'strategist',
      name: 'The Strategist',
      description: 'Awarded for strong Investigative and Conscientiousness traits.',
      icon: Brain,
      color: 'violet',
      isUnlocked: profile.personality.bigFive.conscientiousness > 75 || profile.personality.riasec.investigative > 70
    },
    {
      id: 'explorer',
      name: 'The Explorer',
      description: 'Awarded for embarking on your journey of self-discovery.',
      icon: Compass,
      color: 'emerald',
      isUnlocked: true // Always unlocked once they have a profile
    },
    {
      id: 'dynamo',
      name: 'The Dynamo',
      description: 'Awarded for high Extraversion and Enterprising drive.',
      icon: Zap,
      color: 'amber',
      isUnlocked: profile.personality.bigFive.extraversion > 75 || profile.personality.riasec.enterprising > 70
    },
    {
      id: 'resilient',
      name: 'The Anchor',
      description: 'Awarded for demonstrating strong Resilience and emotional stability.',
      icon: Shield,
      color: 'slate',
      isUnlocked: profile.personality.emotional.resilience > 70 || profile.personality.bigFive.neuroticism < 40
    }
  ];

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
      <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Star className="text-amber-400" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">Trophy Cabinet</h3>
          <p className="text-sm text-slate-400 font-medium">Badges unlocked on your journey</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className={`relative group flex flex-col items-center p-6 rounded-3xl border transition-all ${
              badge.isUnlocked 
                ? `bg-white/5 border-${badge.color}-500/30 hover:border-${badge.color}-500/60 shadow-lg hover:bg-white/10 cursor-pointer` 
                : 'bg-black/20 border-white/5 grayscale opacity-50 cursor-not-allowed'
            }`}
          >
            {badge.isUnlocked && (
              <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 to-${badge.color}-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity`} />
            )}
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              badge.isUnlocked 
                ? `bg-${badge.color}-500/20 border border-${badge.color}-500/50 shadow-[0_0_20px_rgba(var(--tw-color-${badge.color}-500),0.3)]` 
                : 'bg-white/5 border-white/10'
            }`}>
              <badge.icon size={32} className={badge.isUnlocked ? `text-${badge.color}-400` : 'text-slate-500'} />
            </div>
            
            <h4 className="text-white font-bold text-sm mb-1 text-center">{badge.name}</h4>
            
            {/* Tooltip on hover */}
            {badge.isUnlocked && (
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 text-slate-300 text-xs p-3 rounded-xl shadow-2xl pointer-events-none z-10 text-center">
                {badge.description}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-b border-r border-slate-700 transform rotate-45" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
