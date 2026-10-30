import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Heart, Star, Sparkles } from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

export type BreathingProtocolId = 'vagal-478' | 'box-4444' | 'active-pause-3' | 'atma-contemplation';

interface ProtocolConfig {
  id: BreathingProtocolId;
  name: string;
  hindiName: string;
  tagline: string;
  cyclesTarget: number;
  steps: {
    phase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
    duration: number; // in seconds
    label: string;
    hindiLabel: string;
    instruction: string;
    color: string;
    scale: number;
  }[];
}

const PROTOCOLS: Record<BreathingProtocolId, ProtocolConfig> = {
  'vagal-478': {
    id: 'vagal-478',
    name: '4-7-8 Somatic Vagal Reset',
    hindiName: '४-७-८ वैगल नर्व शांतिकरण',
    tagline: 'Activates parasympathetic nervous system; eliminates acute anxiety & heart palpitations.',
    cyclesTarget: 4,
    steps: [
      { phase: 'inhale', duration: 4, label: 'Inhale through nose', hindiLabel: 'नासिका से गहरी सांस लें', instruction: 'Fill the abdomen slowly and gently', color: 'from-cyan-400 to-emerald-400', scale: 1.35 },
      { phase: 'hold-in', duration: 7, label: 'Hold breath gently', hindiLabel: 'श्वास भीतर रोकें', instruction: 'Relax shoulders; keep mind still and peaceful', color: 'from-amber-400 to-orange-400', scale: 1.35 },
      { phase: 'exhale', duration: 8, label: 'Exhale with soft whoosh', hindiLabel: 'मुंह से धीरे-धीरे छोड़ें', instruction: 'Let all muscular tension melt out through the mouth', color: 'from-indigo-400 to-violet-500', scale: 0.9 },
    ],
  },
  'box-4444': {
    id: 'box-4444',
    name: 'Box Breathing (Samavritti)',
    hindiName: 'समवृत्ति प्राणायम (४-४-४-४)',
    tagline: 'Standard focus protocol for Navy SEALs & exam students; restores cognitive composure.',
    cyclesTarget: 4,
    steps: [
      { phase: 'inhale', duration: 4, label: 'Inhale steadily', hindiLabel: 'समान गति से सांस लें', instruction: 'Draw steady air across 4 counts', color: 'from-emerald-400 to-teal-400', scale: 1.3 },
      { phase: 'hold-in', duration: 4, label: 'Hold full', hindiLabel: 'पूर्ण श्वास रोकें', instruction: 'Retain air without tensing throat', color: 'from-amber-400 to-yellow-400', scale: 1.3 },
      { phase: 'exhale', duration: 4, label: 'Exhale steadily', hindiLabel: 'समान गति से छोड़ें', instruction: 'Smoothly release every count', color: 'from-indigo-400 to-cyan-400', scale: 0.95 },
      { phase: 'hold-out', duration: 4, label: 'Hold empty', hindiLabel: 'खाली अवस्था में ठहरें', instruction: 'Rest in the natural still silence before the next breath', color: 'from-purple-400 to-fuchsia-400', scale: 0.95 },
    ],
  },
  'active-pause-3': {
    id: 'active-pause-3',
    name: '3-Second Impulse Break',
    hindiName: '३-सेकंड सक्रिय विराम',
    tagline: 'Disengages fight-or-flight triggers before reacting to anger, texts, or sudden urges.',
    cyclesTarget: 3,
    steps: [
      { phase: 'inhale', duration: 2, label: 'Pause & Witness', hindiLabel: 'ठहरें और साक्षी बनें', instruction: 'Notice the emotional wave without acting', color: 'from-rose-400 to-amber-400', scale: 1.2 },
      { phase: 'exhale', duration: 3, label: 'Drop Shoulders & Choose', hindiLabel: 'कंधे ढीले करें और सही चुनें', instruction: 'Let impulse pass; ask: What honors my real self?', color: 'from-emerald-400 to-cyan-400', scale: 0.95 },
    ],
  },
  'atma-contemplation': {
    id: 'atma-contemplation',
    name: 'Atma-Jnana Meditative Breath',
    hindiName: 'आत्मज्ञान ध्यान श्वास',
    tagline: 'Singing bowl resonance at 432 Hz for deep inner self-witnessing and quiet clarity.',
    cyclesTarget: 3,
    steps: [
      { phase: 'inhale', duration: 5, label: 'Breathing in Light (घट में प्रकाश)', hindiLabel: 'भीतर का दिव्य प्रकाश महसूस करें', instruction: 'सोई हंस तेरे घट माहि... Feel the pure life force entering', color: 'from-amber-300 to-rose-400', scale: 1.3 },
      { phase: 'hold-in', duration: 3, label: 'Resting in Pure Being (अलख पुरुष)', hindiLabel: 'शांत आत्म-भाव में स्थित रहें', instruction: 'You are whole, unhurt, and complete within', color: 'from-amber-400 to-indigo-400', scale: 1.3 },
      { phase: 'exhale', duration: 6, label: 'Releasing All Illusion (व्यर्थ चिंता विसर्जन)', hindiLabel: 'समस्त बाहरी तनाव और भ्रम छोड़ें', instruction: 'Releasing external expectations into the infinite quiet', color: 'from-indigo-400 to-violet-600', scale: 0.9 },
    ],
  },
};

interface SomaticBreathingCompanionProps {
  initialProtocol?: BreathingProtocolId;
  onClose?: () => void;
  isModal?: boolean;
}

export const SomaticBreathingCompanion: React.FC<SomaticBreathingCompanionProps> = ({
  initialProtocol = 'vagal-478',
  onClose,
  isModal = false,
}) => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<BreathingProtocolId>(initialProtocol);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PROTOCOLS[initialProtocol].steps[0].duration);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const protocol = PROTOCOLS[selectedProtocolId];
  const currentStep = protocol.steps[stepIndex] || protocol.steps[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playStepAudio = useCallback((step: typeof currentStep) => {
    if (!soundEnabled) return;
    if (step.phase === 'inhale') {
      somaticAudio.playInhaleTone(step.duration);
    } else if (step.phase === 'hold-in') {
      somaticAudio.playHoldTone(step.duration);
    } else if (step.phase === 'exhale') {
      somaticAudio.playExhaleTone(step.duration);
    } else {
      somaticAudio.playSingingBowl(432, 2.5);
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    somaticAudio.setMuted(!nextState);
  };

  const handleReset = () => {
    setIsActive(false);
    setStepIndex(0);
    setSecondsRemaining(protocol.steps[0].duration);
    setCompletedCycles(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSelectProtocol = (id: BreathingProtocolId) => {
    setSelectedProtocolId(id);
    setIsActive(false);
    setStepIndex(0);
    setSecondsRemaining(PROTOCOLS[id].steps[0].duration);
    setCompletedCycles(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Timer loop
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Transition to next step
          const nextIndex = (stepIndex + 1) % protocol.steps.length;
          if (nextIndex === 0) {
            setCompletedCycles((c) => c + 1);
          }
          setStepIndex(nextIndex);
          const nextStep = protocol.steps[nextIndex];
          playStepAudio(nextStep);
          return nextStep.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, stepIndex, protocol, playStepAudio]);

  const handleStart = () => {
    setIsActive(true);
    playStepAudio(currentStep);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  return (
    <div className={`relative ${isModal ? 'p-6 md:p-8 bg-[#070b18] text-white rounded-3xl border border-indigo-500/30 shadow-2xl max-w-2xl w-full mx-auto' : 'p-6 md:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-slate-800'}`}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Heart size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                Somatic Vagal Regulation • 432 Hz
              </span>
              <span className="text-xs text-slate-400">Zero Cloud • Audio Wave</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {protocol.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${soundEnabled ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-white/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}
            title={soundEnabled ? 'Mute soothing audio guidance' : 'Enable 432 Hz soothing audio tones'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Protocol Selection Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {(Object.keys(PROTOCOLS) as BreathingProtocolId[]).map((key) => {
          const item = PROTOCOLS[key];
          const isSelected = item.id === selectedProtocolId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectProtocol(item.id)}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-black truncate">{item.name.split(' ')[0]} {item.name.split(' ')[1]}</div>
              <div className={`text-[10px] font-medium truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                {item.hindiName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Breathing Stage: The Luminous Resonant Orb */}
      <div className="relative py-12 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[340px]">
        {/* Soft Ambient Background Aura */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-950 to-slate-900 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Breathing Circle / Orb Animation */}
        <div className="relative z-10 flex items-center justify-center mb-6">
          <motion.div
            animate={{
              scale: isActive ? currentStep.scale : 1,
            }}
            transition={{
              duration: currentStep.duration,
              ease: currentStep.phase === 'inhale' ? 'easeOut' : currentStep.phase === 'exhale' ? 'easeInOut' : 'linear',
            }}
            className={`w-44 h-44 rounded-full bg-gradient-to-br ${currentStep.color} p-1 shadow-2xl flex items-center justify-center transition-colors duration-1000`}
            style={{
              boxShadow: `0 0 ${isActive ? '60px' : '20px'} rgba(99, 102, 241, 0.4)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
              <span className="text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
                {secondsRemaining}s
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 mt-1">
                {currentStep.phase === 'inhale' ? 'IN' : currentStep.phase === 'exhale' ? 'OUT' : 'HOLD'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Current Instruction Text */}
        <div className="relative z-10 text-center px-6 space-y-1">
          <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {currentStep.label}
          </h4>
          <p className="text-sm font-serif italic text-amber-200">
            {currentStep.hindiLabel}
          </p>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto pt-1">
            {currentStep.instruction}
          </p>
        </div>

        {/* Cycle Progress Dots */}
        <div className="relative z-10 flex items-center gap-2 mt-6">
          {Array.from({ length: protocol.cyclesTarget }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx < completedCycles
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : idx === completedCycles && isActive
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-white/20'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-slate-400 ml-2">
            Cycle {Math.min(completedCycles + (isActive ? 1 : 0), protocol.cyclesTarget)} / {protocol.cyclesTarget}
          </span>
        </div>

        {/* Post-Regulation Generosity Hook */}
        {completedCycles >= protocol.cyclesTarget && (
          <div className="relative z-10 mt-6 mx-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-indigo-500/20 border border-amber-400/40 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>Somatic Grounding Complete • शांत मन</span>
            </div>
            <p className="text-xs text-slate-200">
              Your autonomic nervous system is restored to quiet equilibrium. If this session brought you peace, consider lighting a beacon for another seeking teenager.
            </p>
            <button
              onClick={() => {
                somaticAudio.playStarBeaconChime();
                window.open('https://github.com/HarshkumarG007/PRERNA', '_blank', 'noopener,noreferrer');
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Star size={13} className="fill-slate-950" />
              <span>Light a Star on GitHub ⭐</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-4 mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>

        <div className="flex items-center gap-3">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-black text-sm text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play size={16} fill="white" />
              <span>Begin Exercise</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-black text-sm text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Pause size={16} fill="black" />
              <span>Pause</span>
            </button>
          )}
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-bold text-slate-400 block">432 Hz Harmonic</span>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Pure Offline Tone</span>
        </div>
      </div>

    </div>
  );
};
