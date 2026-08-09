import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation } from '../../engine/consent/sessionGate';
import { checkForCrisisIndicators } from '../../engine/crisis/escalationRouter';
import { ResourceSurface } from '../crisis/ResourceSurface';
import { TrustedAdultConnector } from '../crisis/TrustedAdultConnector';
import { useI18n } from '../../engine/localization/i18n';
import { useAppStore } from '../../store';
import { Heart, Wind, AlertTriangle, Sun, CloudRain } from 'lucide-react';

interface MoodMirrorProps {
  userId?: string;
}

type Sentiment = 'positive' | 'neutral' | 'severe_distress' | null;

export const MoodMirror: React.FC<MoodMirrorProps> = ({ userId }) => {
  const { language } = useI18n();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [loggedMood, setLoggedMood] = useState<Sentiment>(null);
  const [hoveredMood, setHoveredMood] = useState<Sentiment>(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const { recordSession } = useAppStore();

  const disclosure = CURRENT_DISCLOSURES.mood_mirror;

  const handleStartSession = () => {
    try {
      validateSessionCreation({ userId: userId || 'guest', sessionType: 'mood_mirror', disclosureShownId: disclosure.id });
      setIsSessionActive(true);
    } catch (err: any) {
      setSessionError(err.message);
    }
  };

  const handleLogMood = async (sentiment: Sentiment) => {
    if (!sentiment) return;
    
    setLoggedMood(sentiment);
    
    if (sentiment === 'severe_distress') {
      setIsBreathing(true);
      // Let the breathing exercise run for 6 seconds
      setTimeout(() => setIsBreathing(false), 6000);
    }

    await recordSession({
      type: 'mood_mirror',
      completedAt: new Date().toISOString(),
      score: sentiment === 'positive' ? 100 : sentiment === 'neutral' ? 50 : 0,
      metadata: { sentiment }
    });
    
    await checkForCrisisIndicators({
      userId: userId || 'guest',
      content: `Logged sentiment: ${sentiment}`,
      sentiment: sentiment as any
    });
  };

  // Determine dynamic background colors
  const getAmbientColors = () => {
    const activeSentiment = hoveredMood || loggedMood;
    switch (activeSentiment) {
      case 'positive': return 'from-amber-500/20 to-orange-500/20';
      case 'neutral': return 'from-cyan-500/20 to-blue-500/20';
      case 'severe_distress': return 'from-slate-600/30 to-indigo-800/30';
      default: return 'from-violet-500/10 to-fuchsia-500/10';
    }
  };

  if (!disclosureAccepted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 relative overflow-hidden bg-[#020617] border border-white/10 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Heart size={40} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Mood Mirror</h2>
            <p className="text-rose-200 mt-2 font-medium">Check in with yourself safely and securely.</p>
          </div>

          <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm text-left backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-rose-400" />
              <p className="text-sm font-bold text-rose-400 uppercase tracking-widest">Before we begin</p>
            </div>
            <p className="text-white/80 leading-relaxed font-medium">{disclosure.text[language as keyof typeof disclosure.text]}</p>
          </div>

          <button
            onClick={() => setDisclosureAccepted(true)}
            className="w-full py-4 rounded-xl shadow-lg shadow-rose-500/20 text-white font-bold bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            I Understand, Let's Check In
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
          className="py-5 px-10 rounded-full shadow-2xl shadow-violet-500/30 text-xl font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border border-white/20"
        >
          Check In Today ✨
        </motion.button>
        {sessionError && (
          <p className="text-red-500 text-sm font-bold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl inline-block backdrop-blur-md">
            {sessionError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative transition-colors duration-1000">
      
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
          className={`absolute inset-0 bg-gradient-to-br ${getAmbientColors()} opacity-70 transition-colors duration-1000`} 
        />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
        
        <AnimatePresence mode="wait">
          {!loggedMood ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center space-y-12"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">How are you feeling?</h2>
                <p className="text-white/50 font-medium text-lg">Take a breath. There's no right or wrong answer.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                {/* Positive */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredMood('positive')}
                  onHoverEnd={() => setHoveredMood(null)}
                  onClick={() => handleLogMood('positive')}
                  className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-400/50 backdrop-blur-md overflow-hidden transition-all text-center flex flex-col items-center gap-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/0 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Sun size={40} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">Good</h3>
                    <p className="text-white/40 text-sm font-medium">Energetic, calm, or happy</p>
                  </div>
                </motion.button>

                {/* Neutral */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredMood('neutral')}
                  onHoverEnd={() => setHoveredMood(null)}
                  onClick={() => handleLogMood('neutral')}
                  className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-400/50 backdrop-blur-md overflow-hidden transition-all text-center flex flex-col items-center gap-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/0 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 rounded-full bg-cyan-400/20 flex items-center justify-center">
                    <Wind size={40} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">Okay</h3>
                    <p className="text-white/40 text-sm font-medium">Neutral, surviving, or tired</p>
                  </div>
                </motion.button>

                {/* Distress */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredMood('severe_distress')}
                  onHoverEnd={() => setHoveredMood(null)}
                  onClick={() => handleLogMood('severe_distress')}
                  className="relative group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-slate-400/50 backdrop-blur-md overflow-hidden transition-all text-center flex flex-col items-center gap-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-400/0 to-slate-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 rounded-full bg-slate-500/20 flex items-center justify-center">
                    <CloudRain size={40} className="text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">Struggling</h3>
                    <p className="text-white/40 text-sm font-medium">Overwhelmed, anxious, or down</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logged"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full"
            >
              <AnimatePresence mode="wait">
                {isBreathing ? (
                  <motion.div
                    key="breathing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center space-y-12"
                  >
                    <h2 className="text-3xl font-black text-white/80 tracking-tight">Let's take a breath...</h2>
                    
                    <div className="relative flex items-center justify-center w-64 h-64">
                      <motion.div 
                        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.1, 0.3] }} 
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="absolute inset-0 bg-slate-300 rounded-full"
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }} 
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="absolute inset-4 bg-slate-400 rounded-full"
                      />
                      <div className="relative z-10 w-24 h-24 rounded-full bg-slate-200/20 backdrop-blur-sm border border-slate-200/30 flex items-center justify-center shadow-2xl">
                        <Wind size={32} className="text-slate-200" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full space-y-8"
                  >
                    <div className="text-center space-y-3 mb-10">
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                        <Heart size={28} className="text-emerald-400" />
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight">Mood Logged</h2>
                      <p className="text-white/50 text-lg">Thank you for checking in today.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                      <ResourceSurface />
                    </div>

                    {loggedMood === 'severe_distress' && (
                      <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-600/50 shadow-2xl">
                        <TrustedAdultConnector />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
