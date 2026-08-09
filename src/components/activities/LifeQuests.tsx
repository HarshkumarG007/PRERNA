import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TransparentAssessmentEngine, 
  GameSession, 
  Scene, 
  TraitProfile 
} from '../../assessment/engine';
import { generateLifeQuest } from '../../assessment/scenarios/lifeQuests';
import { useDatabase } from '../../hooks/useDatabase';
import { useI18n } from '../../engine/localization/i18n';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';

export interface LifeQuestsProps {
  userId?: string;
}

export const LifeQuests: React.FC<LifeQuestsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [engine, setEngine] = useState<TransparentAssessmentEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<TraitProfile | null>(null);
  const [narrative, setNarrative] = useState<string>('');
  
  const startTimeRef = useRef<number>(0);
  const { saveSession } = useDatabase();
  const { language } = useI18n();

  const disclosure = CURRENT_DISCLOSURES.life_quests;

  // Initialize quest
  useEffect(() => {
    if (isSessionActive) {
      const questScenes = generateLifeQuest();
      setScenes(questScenes);
      
      const session: GameSession = {
        sessionId: crypto.randomUUID(),
        userId: userId || 'guest',
        questType: 'life_quest',
        scenes: questScenes,
        responses: [],
        startTime: new Date(),
      };
      
      setEngine(new TransparentAssessmentEngine(session));
      setIsLoading(false);
      startTimeRef.current = Date.now();
    }
  }, [isSessionActive]);

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId: userId || 'guest',
        sessionType: 'life_quest',
        disclosureShownId: disclosure.id,
      };
      
      // Enforces Global Rule 0.1-2
      validateSessionCreation(config);
      
      setIsSessionActive(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChoice = useCallback(async (choiceIndex: number) => {
    if (!engine) return;
    
    const currentScene = scenes[currentSceneIndex];
    const choice = currentScene.choices[choiceIndex];
    const reactionTime = Date.now() - startTimeRef.current;
    
    // Record the response
    engine.recordResponse(currentScene, choice, reactionTime);
    
    // Show narrative consequence
    if (choice.narrativeConsequence) {
      setNarrative(choice.narrativeConsequence);
      await new Promise(r => setTimeout(r, 1500)); // Brief pause
    }
    
    // Move to next scene or complete
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      startTimeRef.current = Date.now();
      setNarrative('');
    } else {
      // Complete quest
      const finalProfile = engine.calculateProfile();
      setProfile(finalProfile);
      setShowResults(true);
      
      // Save to database
      await saveSession({
        user_id: userId || 'guest',
        session_type: 'life_quest',
        raw_choices: engine.exportData(),
        derived_traits: JSON.stringify(finalProfile),
      });
      
    }
  }, [engine, scenes, currentSceneIndex, saveSession]);

  const onExit = () => {
    navigate('/dashboard');
  };

  if (!disclosureAccepted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 glass-panel space-y-6 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <h2 className="text-3xl font-black text-indigo-900 relative z-10">Life Quests</h2>
        <div className="mt-4 bg-white/60 p-6 rounded-xl border border-indigo-50 shadow-sm relative z-10">
          <p className="text-xs uppercase tracking-widest font-bold text-indigo-500 mb-2">Before you play</p>
          <p className="text-slate-700 leading-relaxed font-medium">{disclosure.text[language as keyof typeof disclosure.text]}</p>
        </div>
        <button
          onClick={() => setDisclosureAccepted(true)}
          className="mt-6 w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-300 relative z-10"
        >
          I Understand, Let's Play!
        </button>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-fade-in-up">
        <button
          onClick={handleStartSession}
          className="py-4 px-8 rounded-2xl shadow-xl shadow-purple-200 text-lg font-black text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 transition-all duration-300 active:scale-95"
        >
          Start a New Quest
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (showResults && profile) {
    return <QuestResults profile={profile} onExit={onExit} />;
  }

  const currentScene = scenes[currentSceneIndex];

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 md:p-8">
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between text-slate-500 font-bold text-xs mb-2 tracking-widest uppercase">
          <span>Your Journey</span>
          <span>{currentSceneIndex + 1} / {scenes.length}</span>
        </div>
        <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSceneIndex + 1) / scenes.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl mx-auto"
        >
          {/* Scene Context */}
          <div className="glass-panel p-6 md:p-8 mb-6">
            <span className="inline-block px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 font-bold text-xs uppercase tracking-wider mb-4">
              {currentScene.context}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 tracking-tight">
              {currentScene.title}
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              {currentScene.description}
            </p>
          </div>

          {/* Narrative Feedback */}
          <AnimatePresence>
            {narrative && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 shadow-sm"
              >
                <p className="text-emerald-800 font-medium italic">{narrative}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choices */}
          <div className="space-y-4">
            {currentScene.choices.map((choice, index) => (
              <motion.button
                key={choice.id}
                onClick={() => handleChoice(index)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left p-6 bg-white/50 backdrop-blur-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 font-bold transition-colors">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-slate-700 group-hover:text-slate-900 font-medium text-lg transition-colors">
                    {choice.text}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Exit Option */}
          <div className="text-center mt-8">
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium underline transition-colors"
            >
              Save progress and exit
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Results Component
const QuestResults: React.FC<{ profile: TraitProfile; onExit: () => void }> = ({ 
  profile, 
  onExit 
}) => {
  const dominantTraits = [
    { name: 'Openness', value: profile.bigFive.openness, icon: '🎨' },
    { name: 'Conscientiousness', value: profile.bigFive.conscientiousness, icon: '📋' },
    { name: 'Extraversion', value: profile.bigFive.extraversion, icon: '🎭' },
    { name: 'Agreeableness', value: profile.bigFive.agreeableness, icon: '🤝' },
    { name: 'Resilience', value: profile.emotional.resilience, icon: '💪' },
  ].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 glass-panel space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Quest Complete! 🎉</h2>
        <p className="text-slate-600 font-medium mt-2">Here's what we discovered about you...</p>
      </div>

      {/* Top Traits */}
      <div className="space-y-6">
        <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs">
          Your Top Strengths
        </h3>
        {dominantTraits.map((trait, index) => (
          <motion.div
            key={trait.name}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-slate-100"
          >
            <span className="text-2xl">{trait.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between text-slate-700 font-bold mb-2">
                <span>{trait.name}</span>
                <span className="text-indigo-600">{Math.round(trait.value)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.value}%` }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.8 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Career Insight */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 shadow-inner">
        <h3 className="text-indigo-900 font-black mb-2 flex items-center gap-2">
          <span>💡</span> Insight
        </h3>
        <p className="text-indigo-800 font-medium leading-relaxed">
          Based on your choices, you show strong {dominantTraits[0].name.toLowerCase()} 
          {' '}and {dominantTraits[1].name.toLowerCase()}. This suggests you might thrive in 
          environments that value {getCareerHint(dominantTraits[0].name)}.
        </p>
      </div>

      <button
        onClick={onExit}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
      >
        Continue Your Journey
      </button>
    </div>
  );
};

function getCareerHint(trait: string): string {
  const hints: Record<string, string> = {
    'Openness': 'creativity, innovation, and exploring new ideas',
    'Conscientiousness': 'organization, reliability, and attention to detail',
    'Extraversion': 'leadership, social interaction, and team dynamics',
    'Agreeableness': 'collaboration, empathy, and helping others',
    'Resilience': 'handling pressure, adapting to challenges, and perseverance',
  };
  return hints[trait] || 'your unique strengths';
}
