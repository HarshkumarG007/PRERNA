import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Brain, Heart, Compass, Sparkles, Star } from 'lucide-react';
import { QUESTIONNAIRE_ITEMS, TOTAL_QUESTIONS } from '../../engine/assessment/questionnaireData';
import { scoreQuestionnaire, deriveArchetype, buildLLMSynthesisPrompt, RawResponse } from '../../engine/assessment/scoringEngine';
import { useAppStore } from '../../store';
import { safeInvoke } from '../../utils/mockBackend';

interface SelfDiscoveryJourneyProps {
  onComplete: () => void;
}

const CATEGORY_META = {
  personality: { label: 'Personality', icon: <Brain size={16} />, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  career: { label: 'Career Compass', icon: <Compass size={16} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  emotional: { label: 'Emotional World', icon: <Heart size={16} />, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const LIKERT_LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'];

const LIKERT_COLORS = [
  'from-rose-600 to-rose-500',
  'from-orange-600 to-orange-500',
  'from-amber-600 to-amber-500',
  'from-emerald-600 to-emerald-500',
  'from-violet-600 to-fuchsia-500',
];

export const SelfDiscoveryJourney: React.FC<SelfDiscoveryJourneyProps> = ({ onComplete }) => {
  const { updateProfile } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<RawResponse[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [archetype, setArchetype] = useState<ReturnType<typeof deriveArchetype> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentItem = QUESTIONNAIRE_ITEMS[currentIndex];
  const progress = (currentIndex / TOTAL_QUESTIONS) * 100;
  const categoryMeta = CATEGORY_META[currentItem.category];

  const handleAnswer = useCallback(async (score: number) => {
    setSelectedScore(score);

    setTimeout(async () => {
      const newResponses = [...responses, { questionId: currentItem.id, score }];
      setResponses(newResponses);
      setSelectedScore(null);

      if (currentIndex < TOTAL_QUESTIONS - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All done — score and derive archetype
        setIsProcessing(true);
        const scoredProfile = scoreQuestionnaire(newResponses);
        const detectedArchetype = deriveArchetype(scoredProfile);
        setArchetype(detectedArchetype);
        
        // Generate personalized LLM report
        const prompt = buildLLMSynthesisPrompt('Teen', scoredProfile, detectedArchetype); // Teen name could be dynamic
        const llmReport = await safeInvoke<string>('generate_llm_text', { prompt });

        // Update the global profile with trait scores and report
        updateProfile({
          personality: {
            bigFive: {
              openness: scoredProfile.openness,
              conscientiousness: scoredProfile.conscientiousness,
              extraversion: scoredProfile.extraversion,
              agreeableness: scoredProfile.agreeableness,
              neuroticism: scoredProfile.neuroticism,
            },
            riasec: {
              realistic: scoredProfile.realistic,
              investigative: scoredProfile.investigative,
              artistic: scoredProfile.artistic,
              social: scoredProfile.social,
              enterprising: scoredProfile.enterprising,
              conventional: scoredProfile.conventional,
            },
            emotional: {
              resilience: scoredProfile.resilience,
              empathy: scoredProfile.empathy,
              emotionalAwareness: scoredProfile.emotionalAwareness,
              impulseControl: scoredProfile.impulseControl,
              socialIntuition: scoredProfile.socialIntuition,
            },
          },
          archetype: {
            name: detectedArchetype.name,
            description: detectedArchetype.description,
            traits: detectedArchetype.coreStrengths,
          },
          wellbeingScore: Math.round((scoredProfile.resilience + scoredProfile.empathy + (100 - scoredProfile.neuroticism)) / 3),
          strengths: detectedArchetype.coreStrengths,
          growthAreas: detectedArchetype.growthAreas,
          llmSelfDiscoveryReport: llmReport,
        });

        setIsProcessing(false);
        setIsComplete(true);
      }
    }, 400);
  }, [currentIndex, responses, currentItem, updateProfile]);

  // ── Results Screen ────────────────────────────────────────────────────────
  if (isComplete && archetype) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-4 z-50 overflow-y-auto">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative z-10 max-w-2xl w-full bg-[#0b1120]/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Top glow bar */}
          <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

          <div className="p-10 text-center space-y-8">
            {/* Archetype Badge */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}>
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/30 mx-auto flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                <span className="text-6xl">{archetype.emoji}</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="text-violet-400 font-bold uppercase tracking-widest text-sm mb-2">Your Archetype</p>
              <h1 className="text-4xl font-black text-white tracking-tight mb-3">{archetype.name}</h1>
              <p className="text-xl text-white/70 italic font-medium">"{archetype.tagline}"</p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-300 leading-relaxed text-base max-w-lg mx-auto"
            >
              {archetype.description}
            </motion.p>

            {/* Strengths */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Core Strengths</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {archetype.coreStrengths.map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Star size={12} className="text-emerald-400" /> {s}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Career Direction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4"
            >
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Career Direction</p>
              <p className="text-white/80 text-sm font-medium">{archetype.careerDirection}</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={onComplete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white text-lg shadow-2xl shadow-violet-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} /> Enter My Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Processing Screen ─────────────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-violet-500 border-t-transparent mb-6" />
        <p className="text-white font-bold text-xl">Analysing your responses...</p>
        <p className="text-slate-400 mt-2">Computing your personality archetype</p>
      </div>
    );
  }

  // ── Question Screen ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col z-50">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Progress Bar */}
      <div className="relative z-20 w-full h-1.5 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${categoryMeta.bg} ${categoryMeta.color} border ${categoryMeta.border}`}>
            {categoryMeta.icon} {categoryMeta.label}
          </div>
          <div className="hidden md:flex px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
            <Sparkles size={12} className="mr-1.5" /> Psychologically Inspired Self-Discovery
          </div>
          <button 
            onClick={onComplete}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white/40 hover:text-white/80 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            Skip for now
          </button>
        </div>
        <div className="text-right">
          <span className="text-white font-black text-lg">{currentIndex + 1}</span>
          <span className="text-white/30 font-medium text-sm"> / {TOTAL_QUESTIONS}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative z-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-10"
            >
              {/* Emoji */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="text-7xl mb-6 select-none"
                >
                  {currentItem.emoji}
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  {currentItem.text}
                </h2>
              </div>

              {/* Likert Scale Orbs */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <motion.button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                      selectedScore === score
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Score Orb */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${LIKERT_COLORS[score - 1]} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg`}>
                      {score}
                    </div>
                    {/* Label */}
                    <span className={`text-sm font-medium ${selectedScore === score ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                      {LIKERT_LABELS[score - 1]}
                    </span>
                    {/* Chevron */}
                    <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
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
