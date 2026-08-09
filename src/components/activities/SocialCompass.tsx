import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation } from '../../engine/consent/sessionGate';
import { useI18n } from '../../engine/localization/i18n';
import { useAppStore } from '../../store';
import { Compass, ShieldAlert, Sparkles, User, Heart, Brain, ArrowRight } from 'lucide-react';

export interface SocialCompassProps {
  userId?: string;
}

interface Scenario {
  id: string;
  situation: string;
  choices: { id: string; text: string; traits: { agreeableness: number; extraversion: number; conscientiousness: number } }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    situation: 'A friend cancels plans with you last minute, right when you were about to leave the house.',
    choices: [
      { id: 'a', text: 'Ask if they are okay and offer support', traits: { agreeableness: 10, extraversion: 5, conscientiousness: 3 } },
      { id: 'b', text: 'Feel annoyed, but say nothing and move on', traits: { agreeableness: -3, extraversion: -5, conscientiousness: 5 } },
      { id: 'c', text: 'Immediately make other plans — adapt quickly!', traits: { agreeableness: 0, extraversion: 8, conscientiousness: 7 } },
    ]
  },
  {
    id: 's2',
    situation: 'Your group has a big disagreement about what to do for the evening. No one can agree.',
    choices: [
      { id: 'a', text: 'Try to find a compromise that works for everyone', traits: { agreeableness: 10, extraversion: 5, conscientiousness: 5 } },
      { id: 'b', text: 'Go along with whatever the majority wants to keep the peace', traits: { agreeableness: 8, extraversion: -3, conscientiousness: 2 } },
      { id: 'c', text: 'Suggest your own idea and advocate for it directly', traits: { agreeableness: -2, extraversion: 10, conscientiousness: 6 } },
    ]
  },
  {
    id: 's3',
    situation: 'A classmate you don\'t know very well seems upset and alone in a corner during a group event.',
    choices: [
      { id: 'a', text: 'Walk over and gently check in with them', traits: { agreeableness: 10, extraversion: 7, conscientiousness: 5 } },
      { id: 'b', text: 'Mention it to a mutual friend so they can help', traits: { agreeableness: 7, extraversion: 2, conscientiousness: 4 } },
      { id: 'c', text: 'Give them space and respect their privacy', traits: { agreeableness: 4, extraversion: -2, conscientiousness: 3 } },
    ]
  }
];

export const SocialCompass: React.FC<SocialCompassProps> = ({ userId }) => {
  const { language } = useI18n();
  const { recordSession } = useAppStore();
  const [accepted, setAccepted] = useState(false);
  const [active, setActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [traitTotals, setTraitTotals] = useState({ agreeableness: 50, extraversion: 50, conscientiousness: 50 });
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disclosure = CURRENT_DISCLOSURES.social_compass;
  const currentScenario = SCENARIOS[currentIdx];

  const handleChoice = async (choice: Scenario['choices'][0]) => {
    const newAnswers = { ...answers, [currentScenario.id]: choice.id };
    const newTraits = {
      agreeableness: Math.min(100, Math.max(0, traitTotals.agreeableness + choice.traits.agreeableness)),
      extraversion: Math.min(100, Math.max(0, traitTotals.extraversion + choice.traits.extraversion)),
      conscientiousness: Math.min(100, Math.max(0, traitTotals.conscientiousness + choice.traits.conscientiousness)),
    };
    setAnswers(newAnswers);
    setTraitTotals(newTraits);

    if (currentIdx < SCENARIOS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // All done — save session
      await recordSession({
        type: 'life_quest', // closest type available in union
        completedAt: new Date().toISOString(),
        score: Math.round((newTraits.agreeableness + newTraits.extraversion + newTraits.conscientiousness) / 3),
        metadata: { module: 'social_compass', choices: newAnswers, traits: newTraits }
      });
      setCompleted(true);
    }
  };

  if (completed) {
    const label = traitTotals.agreeableness > 65 ? 'Harmony Seeker' :
                  traitTotals.extraversion > 65 ? 'Social Energizer' : 'Reflective Observer';
                  
    const getIcon = () => {
      if (label === 'Harmony Seeker') return <Heart size={64} className="text-rose-400" />;
      if (label === 'Social Energizer') return <Sparkles size={64} className="text-amber-400" />;
      return <Brain size={64} className="text-blue-400" />;
    };

    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl p-8 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 text-center shadow-2xl"
        >
          <div className="inline-flex items-center justify-center p-6 bg-white/5 rounded-full border border-white/10 shadow-inner mb-6 relative">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-orange-500/30 rounded-full border-dashed"
            />
            {getIcon()}
          </div>
          
          <h2 className="text-xl font-bold text-white/60 mb-2 uppercase tracking-widest">Your Social Style</h2>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-10 drop-shadow-sm">
            {label}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
            {[
              { label: 'Agreeableness', value: traitTotals.agreeableness, color: 'bg-emerald-500' },
              { label: 'Openness', value: traitTotals.extraversion, color: 'bg-amber-500' },
              { label: 'Conscientiousness', value: traitTotals.conscientiousness, color: 'bg-blue-500' }
            ].map((t, idx) => (
              <motion.div 
                key={t.label} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="bg-black/40 rounded-2xl p-5 border border-white/5"
              >
                <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{t.label}</div>
                <div className="flex items-end justify-between mb-3">
                  <div className="text-3xl font-black text-white">{t.value}<span className="text-sm text-white/30">%</span></div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${t.value}%` }}
                    transition={{ duration: 1, delay: 0.6 + (idx * 0.2), ease: "easeOut" }}
                    className={`h-full ${t.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-white/40 font-medium text-sm flex items-center justify-center gap-2">
            <Sparkles size={16} /> Results securely saved to your private profile
          </p>
        </motion.div>
      </div>
    );
  }

  if (!accepted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 relative overflow-hidden bg-[#020617] border border-white/10 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Compass size={40} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Social Compass</h2>
            <p className="text-white/60 mt-2 font-medium">Explore how you navigate the social world.</p>
          </div>

          <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm text-left backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={18} className="text-amber-400" />
              <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Before we begin</p>
            </div>
            <p className="text-white/80 leading-relaxed font-medium">{disclosure.text[language as keyof typeof disclosure.text] || disclosure.text['en']}</p>
          </div>

          <button
            onClick={() => setAccepted(true)}
            className="w-full py-4 rounded-xl shadow-lg shadow-orange-500/20 text-white font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            I Understand, Let's Play
          </button>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            try {
              validateSessionCreation({ userId: userId || 'guest', sessionType: 'social_compass', disclosureShownId: disclosure.id });
              setActive(true);
            } catch (err: any) {
              setError(err.message);
            }
          }}
          className="py-5 px-10 rounded-full shadow-2xl shadow-orange-500/30 text-xl font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 border border-white/20"
        >
          Start Scenario ✨
        </motion.button>
        {error && (
          <p className="text-red-500 text-sm font-bold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl inline-block backdrop-blur-md mt-4">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-8 md:p-12">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-12 max-w-2xl mx-auto w-full">
          {SCENARIOS.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
              i < currentIdx ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' 
              : i === currentIdx ? 'bg-orange-300' 
              : 'bg-white/10'
            }`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentScenario.id}
              initial={{ opacity: 0, x: 50, rotateY: -10 }} 
              animate={{ opacity: 1, x: 0, rotateY: 0 }} 
              exit={{ opacity: 0, x: -50, rotateY: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white/5 p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <User size={20} />
                </div>
                <div className="text-sm font-bold text-orange-400 uppercase tracking-widest">
                  Scenario {currentIdx + 1}
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white mb-10 leading-tight">
                {currentScenario.situation}
              </h2>
              
              <div className="space-y-4">
                {currentScenario.choices.map((choice, i) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    onClick={() => handleChoice(choice)}
                    className="w-full group relative text-left p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/10 hover:border-orange-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-center justify-between"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-white/90 font-semibold text-lg relative z-10 pr-6">
                      {choice.text}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/0 group-hover:text-orange-400 group-hover:bg-orange-400/20 transition-all relative z-10">
                      <ArrowRight size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
