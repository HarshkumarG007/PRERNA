import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation } from '../../engine/consent/sessionGate';
import { checkForCrisisIndicators } from '../../engine/crisis/escalationRouter';
import { ResourceSurface } from '../crisis/ResourceSurface';
import { TrustedAdultConnector } from '../crisis/TrustedAdultConnector';
import { useI18n } from '../../engine/localization/i18n';
import { useAppStore } from '../../store';
import { Heart, Wind, AlertTriangle, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { useMotionValue, useTransform } from 'framer-motion';

interface MoodMirrorProps {
  userId?: string;
}

type Sentiment = 'positive' | 'neutral' | 'severe_distress' | null;

const MOOD_ZONES = [
  { label: 'Stormy', desc: 'Overwhelmed or extremely anxious', icon: CloudLightning, sentiment: 'severe_distress', score: 0, color: 'text-slate-400', bg: 'bg-slate-500/20' },
  { label: 'Cloudy', desc: 'A bit off or struggling', icon: CloudRain, sentiment: 'neutral', score: 25, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  { label: 'Okay', desc: 'Neutral, surviving, or tired', icon: Wind, sentiment: 'neutral', score: 50, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { label: 'Calm', desc: 'Peaceful, relaxed, or content', icon: Heart, sentiment: 'positive', score: 75, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { label: 'Radiant', desc: 'Energetic, happy, or thriving', icon: Sun, sentiment: 'positive', score: 100, color: 'text-amber-400', bg: 'bg-amber-500/20' },
];

export const MoodMirror: React.FC<MoodMirrorProps> = ({ userId }) => {
  const { language } = useI18n();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [loggedMood, setLoggedMood] = useState<Sentiment>(null);
  const [currentZoneIndex, setCurrentZoneIndex] = useState<number>(2); // Start at "Okay"
  
  // Motion values for smooth interpolation
  const sliderX = useMotionValue(2);
  
  // Map 0-4 to background gradients
  const backgroundGradient = useTransform(
    sliderX,
    [0, 1, 2, 3, 4],
    [
      "linear-gradient(to bottom right, rgba(71,85,105,0.4), rgba(49,46,129,0.5))", // Stormy
      "linear-gradient(to bottom right, rgba(79,70,229,0.3), rgba(126,34,206,0.3))", // Cloudy
      "linear-gradient(to bottom right, rgba(6,182,212,0.3), rgba(59,130,246,0.3))", // Okay
      "linear-gradient(to bottom right, rgba(16,185,129,0.3), rgba(13,148,136,0.3))", // Calm
      "linear-gradient(to bottom right, rgba(245,158,11,0.3), rgba(234,88,12,0.3))"   // Radiant
    ]
  );
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

  const confirmMood = async () => {
    const zone = MOOD_ZONES[currentZoneIndex];
    await handleLogMood(zone.sentiment as Sentiment, zone.score);
  };

  const handleLogMood = async (sentiment: Sentiment, score: number) => {
    if (!sentiment) return;
    
    setLoggedMood(sentiment);
    
    if (sentiment === 'severe_distress') {
      setIsBreathing(true);
      setTimeout(() => setIsBreathing(false), 6000);
    }

    await recordSession({
      type: 'mood_mirror',
      completedAt: new Date().toISOString(),
      score: score,
      metadata: { sentiment, detailedScore: score }
    });
    
    await checkForCrisisIndicators({
      userId: userId || 'guest',
      content: `Logged mood score: ${score} (${sentiment})`,
      sentiment: sentiment as any
    });
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
      
      {/* Dynamic Ambient Background using Framer Motion interpolation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ background: backgroundGradient }}
          className="absolute inset-0 transition-opacity duration-1000 opacity-80" 
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

              <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-12 mt-8">
                
                {/* Central Dynamic Icon & Text */}
                <motion.div 
                  key={currentZoneIndex}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-300 ${MOOD_ZONES[currentZoneIndex].bg} border border-white/10`}>
                    {React.createElement(MOOD_ZONES[currentZoneIndex].icon, { 
                      size: 64, 
                      className: MOOD_ZONES[currentZoneIndex].color 
                    })}
                  </div>
                  <div>
                    <h3 className={`text-3xl font-black mb-2 transition-colors ${MOOD_ZONES[currentZoneIndex].color}`}>
                      {MOOD_ZONES[currentZoneIndex].label}
                    </h3>
                    <p className="text-white/60 font-medium text-lg">{MOOD_ZONES[currentZoneIndex].desc}</p>
                  </div>
                </motion.div>

                {/* The Slider */}
                <div className="w-full px-4">
                  <div className="relative w-full h-16 flex items-center">
                    {/* Track */}
                    <div className="absolute inset-x-0 h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-slate-400 via-cyan-400 to-amber-400 opacity-30" 
                      />
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="4" 
                      step="0.01"
                      value={sliderX.get()}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        sliderX.set(val);
                        setCurrentZoneIndex(Math.round(val));
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    
                    {/* Visual Thumb */}
                    <motion.div 
                      className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] pointer-events-none z-10 flex items-center justify-center"
                      style={{ 
                        left: `calc(${(sliderX.get() / 4) * 100}% - 16px)`,
                      }}
                      animate={{ left: `calc(${(sliderX.get() / 4) * 100}% - 16px)` }}
                      transition={{ type: 'tween', duration: 0 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-900" />
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-between w-full px-2 mt-2 text-xs font-bold text-white/30 uppercase tracking-widest">
                    <span>Stormy</span>
                    <span>Radiant</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmMood}
                  className="mt-8 py-4 px-12 rounded-2xl shadow-xl font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                >
                  Confirm Check-In
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
