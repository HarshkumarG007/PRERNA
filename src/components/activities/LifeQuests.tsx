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
import { useAppStore } from '../../store';
import { useI18n } from '../../engine/localization/i18n';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';
import { ShieldAlert, BookOpen, ChevronRight, Sparkles, Lightbulb, Map } from 'lucide-react';

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
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const { recordSession } = useAppStore();
  const { language } = useI18n();

  const disclosure = CURRENT_DISCLOSURES.life_quests;

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
  }, [isSessionActive, userId]);

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId: userId || 'guest',
        sessionType: 'life_quests',
        disclosureShownId: disclosure.id,
      };
      validateSessionCreation(config);
      setIsSessionActive(true);
    } catch (err: any) {
      setSessionError(err.message);
    }
  };

  const handleChoice = useCallback(async (choiceIndex: number) => {
    if (!engine) return;
    
    const currentScene = scenes[currentSceneIndex];
    const choice = currentScene.choices[choiceIndex];
    const reactionTime = Date.now() - startTimeRef.current;
    
    engine.recordResponse(currentScene, choice, reactionTime);
    
    if (choice.narrativeConsequence) {
      setNarrative(choice.narrativeConsequence);
      await new Promise(r => setTimeout(r, 2000));
    }
    
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      startTimeRef.current = Date.now();
      setNarrative('');
    } else {
      const finalProfile = engine.calculateProfile();
      setProfile(finalProfile);
      setShowResults(true);
      
      await recordSession({
        type: 'life_quest',
        completedAt: new Date().toISOString(),
        score: finalProfile.bigFive.openness,
        metadata: {
          raw_choices: engine.exportData(),
          derived_traits: finalProfile,
        }
      });
    }
  }, [engine, scenes, currentSceneIndex, recordSession]);

  const onExit = () => {
    navigate('/dashboard');
  };

  if (!disclosureAccepted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 relative overflow-hidden bg-[#020617] border border-white/10 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen size={40} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Life Quests</h2>
            <p className="text-indigo-200 mt-2 font-medium">Embark on interactive stories to discover your strengths.</p>
          </div>

          <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm text-left backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={18} className="text-indigo-400" />
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Before we begin</p>
            </div>
            <p className="text-white/80 leading-relaxed font-medium">{disclosure.text[language as keyof typeof disclosure.text]}</p>
          </div>

          <button
            onClick={() => setDisclosureAccepted(true)}
            className="w-full py-4 rounded-xl shadow-lg shadow-indigo-500/20 text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            I Understand, Let's Play
          </button>
        </div>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartSession}
          className="py-5 px-10 rounded-full shadow-2xl shadow-indigo-500/30 text-xl font-black text-white bg-gradient-to-r from-indigo-500 to-purple-600 border border-white/20"
        >
          Start a New Quest ✨
        </motion.button>
        {sessionError && (
          <p className="text-red-500 text-sm font-bold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl inline-block backdrop-blur-md mt-4">
            {sessionError}
          </p>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
        />
      </div>
    );
  }

  if (showResults && profile) {
    return <QuestResults profile={profile} onExit={onExit} />;
  }

  const currentScene = scenes[currentSceneIndex];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -right-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <Map size={20} />
             </div>
             <span className="font-bold text-white tracking-widest uppercase text-sm">Chapter {currentSceneIndex + 1}</span>
           </div>
           <div className="text-white/40 font-bold text-sm">{currentSceneIndex + 1} / {scenes.length}</div>
        </div>

        {/* Main Scene Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="mb-10 text-center">
                <span className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 font-bold text-xs uppercase tracking-widest mb-6">
                  {currentScene.context}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight drop-shadow-sm">
                  {currentScene.title}
                </h2>
                <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed">
                  {currentScene.description}
                </p>
              </div>

              {/* Choices */}
              <div className="space-y-4 relative">
                {/* Floating Narrative Feedback Overlay */}
                <AnimatePresence>
                  {narrative && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                    >
                       <div className="bg-indigo-900/90 backdrop-blur-xl border border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] p-6 rounded-2xl text-center max-w-md w-full mx-4">
                         <p className="text-indigo-100 font-bold text-lg leading-relaxed italic">{narrative}</p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {currentScene.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    onClick={() => handleChoice(index)}
                    disabled={!!narrative}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-6 bg-black/40 backdrop-blur-md border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 rounded-2xl transition-all group disabled:opacity-50 flex items-center gap-5"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-indigo-500/20 border border-white/10 group-hover:border-indigo-500/50 flex items-center justify-center text-white/50 group-hover:text-indigo-400 font-bold transition-colors">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-white/90 group-hover:text-white font-semibold text-lg flex-1">
                      {choice.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={onExit}
            className="text-white/30 hover:text-white/60 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            Save progress & exit <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Results Component
const QuestResults: React.FC<{ profile: TraitProfile; onExit: () => void }> = ({ 
  profile, 
  onExit 
}) => {
  const dominantTraits = [
    { name: 'Openness', value: profile.bigFive.openness, color: 'bg-indigo-500' },
    { name: 'Conscientiousness', value: profile.bigFive.conscientiousness, color: 'bg-blue-500' },
    { name: 'Extraversion', value: profile.bigFive.extraversion, color: 'bg-purple-500' },
    { name: 'Agreeableness', value: profile.bigFive.agreeableness, color: 'bg-pink-500' },
    { name: 'Resilience', value: profile.emotional.resilience, color: 'bg-emerald-500' },
  ].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
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
            className="absolute inset-0 border border-indigo-500/30 rounded-full border-dashed"
          />
          <Sparkles size={64} className="text-indigo-400" />
        </div>
        
        <h2 className="text-xl font-bold text-white/60 mb-2 uppercase tracking-widest">Quest Complete</h2>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-10 drop-shadow-sm">
          Your Top Strengths
        </h1>
        
        <div className="grid grid-cols-1 gap-6 mb-10 text-left">
          {dominantTraits.map((trait, idx) => (
            <motion.div 
              key={trait.name} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="bg-black/40 rounded-2xl p-5 border border-white/5"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-white/70 uppercase tracking-wider">{trait.name}</span>
                <span className="text-xl font-black text-white">{Math.round(trait.value)}<span className="text-sm text-white/30">%</span></span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.value}%` }}
                  transition={{ duration: 1, delay: 0.6 + (idx * 0.2), ease: "easeOut" }}
                  className={`h-full ${trait.color}`}
                >
                   <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8 text-left">
           <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
             <Lightbulb size={16} /> Insight
           </div>
           <p className="text-indigo-200 font-medium leading-relaxed text-sm">
             Based on your choices, you show strong {dominantTraits[0].name.toLowerCase()} and {dominantTraits[1].name.toLowerCase()}. This suggests you might thrive in environments that value {getCareerHint(dominantTraits[0].name)}.
           </p>
        </div>

        <button
          onClick={onExit}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all active:scale-95"
        >
          Continue Your Journey
        </button>
      </motion.div>
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
