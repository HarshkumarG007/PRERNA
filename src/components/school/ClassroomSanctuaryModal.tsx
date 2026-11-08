import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Heart,
  Clock
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

interface ClassroomSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPattern = 'coherent_5_5' | 'vagal_4_7_8' | 'box_4_4_4';

interface WisdomQuote {
  hindi: string;
  english: string;
  author: string;
}

const WISDOM_QUOTES: WisdomQuote[] = [
  {
    hindi: "बुरा जो देखन मैं चला, बुरा न मिलिया कोय। जो दिल खोजा आपना, मुझसे बुरा न कोय॥",
    english: "I searched for evil in the world and found none. When I looked within my own heart, I found the only mirror that mattered.",
    author: "Sant Kabir (संत कबीर)"
  },
  {
    hindi: "चित्त जहाँ भय-शून्य हो, माथा जहाँ उन्नत हो।",
    english: "Where the mind is without fear and the head is held high; into that heaven of freedom, let our youth awake.",
    author: "Rabindranath Tagore (रवीन्द्रनाथ ठाकुर)"
  },
  {
    hindi: "धीरे-धीरे रे मना, धीरे सब कुछ होय। माली सींचे सौ घड़ा, ॠतु आए फल होय॥",
    english: "Slowly, gently, my mind—all growth arrives in its own season. Even if the gardener pours a hundred jars of water, fruit blossoms only when the time is right.",
    author: "Sant Kabir (संत कबीर)"
  },
  {
    hindi: "उठो, जागो और तब तक नहीं रुको जब तक लक्ष्य ना प्राप्त हो जाए।",
    english: "Arise, awake, and stop not until the calm equilibrium within is realized.",
    author: "Swami Vivekananda (स्वामी विवेकानन्द)"
  }
];

export const ClassroomSanctuaryModal: React.FC<ClassroomSanctuaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pattern, setPattern] = useState<BreathingPattern>('coherent_5_5');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  
  // Phase state for animation
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold_empty'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const breathAnimRef = useRef<any>(null);

  // Initialize seconds on duration change
  useEffect(() => {
    setSecondsRemaining(durationMinutes * 60);
  }, [durationMinutes]);

  // Main countdown timer
  useEffect(() => {
    if (!isOpen || !isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsActive(false);
          somaticAudio.playStarBeaconChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isActive]);

  // Breathing loop animation
  useEffect(() => {
    if (!isOpen || !isActive) {
      if (breathAnimRef.current) clearInterval(breathAnimRef.current);
      return;
    }

    let cycleDuration = 10; // default 5-5
    let inhaleTime = 5;
    let holdTime = 0;
    let exhaleTime = 5;
    let holdEmptyTime = 0;

    if (pattern === 'vagal_4_7_8') {
      inhaleTime = 4;
      holdTime = 7;
      exhaleTime = 8;
      cycleDuration = 19;
    } else if (pattern === 'box_4_4_4') {
      inhaleTime = 4;
      holdTime = 4;
      exhaleTime = 4;
      holdEmptyTime = 4;
      cycleDuration = 16;
    }

    let elapsedMs = 0;
    const intervalMs = 100;

    breathAnimRef.current = setInterval(() => {
      elapsedMs = (elapsedMs + intervalMs) % (cycleDuration * 1000);
      const elapsedSec = elapsedMs / 1000;

      if (elapsedSec < inhaleTime) {
        setPhase('inhale');
        setPhaseProgress(elapsedSec / inhaleTime);
      } else if (elapsedSec < inhaleTime + holdTime) {
        setPhase('hold');
        setPhaseProgress((elapsedSec - inhaleTime) / (holdTime || 1));
      } else if (elapsedSec < inhaleTime + holdTime + exhaleTime) {
        setPhase('exhale');
        setPhaseProgress((elapsedSec - inhaleTime - holdTime) / exhaleTime);
      } else {
        setPhase('hold_empty');
        setPhaseProgress((elapsedSec - inhaleTime - holdTime - exhaleTime) / (holdEmptyTime || 1));
      }
    }, intervalMs);

    return () => {
      if (breathAnimRef.current) clearInterval(breathAnimRef.current);
    };
  }, [isOpen, isActive, pattern]);

  // Rotate quotes every 45 seconds during active session
  useEffect(() => {
    if (!isActive) return;
    const quoteInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % WISDOM_QUOTES.length);
    }, 45000);
    return () => clearInterval(quoteInterval);
  }, [isActive]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handleToggleActive = () => {
    if (!isActive) {
      somaticAudio.playStarBeaconChime();
    } else {
      somaticAudio.playSoftChime();
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    somaticAudio.playSoftChime();
    setIsActive(false);
    setSecondsRemaining(durationMinutes * 60);
    setPhase('inhale');
    setPhaseProgress(0);
  };

  if (!isOpen) return null;

  const quote = WISDOM_QUOTES[quoteIndex];
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Orb scale calculation: 1.0 (empty) to 1.75 (full)
  let orbScale = 1.0;
  if (phase === 'inhale') {
    orbScale = 1.0 + phaseProgress * 0.75;
  } else if (phase === 'hold') {
    orbScale = 1.75;
  } else if (phase === 'exhale') {
    orbScale = 1.75 - phaseProgress * 0.75;
  } else if (phase === 'hold_empty') {
    orbScale = 1.0;
  }

  const phaseInstruction = 
    phase === 'inhale' ? 'Breathe In Peace • श्वास भीतर' :
    phase === 'hold' ? 'Gently Hold • कुम्भक (स्थिर)' :
    phase === 'exhale' ? 'Slowly Release Tension • श्वास बाहर' :
    'Rest Empty • विश्राम';

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden"
    >
      {/* Top Smartboard Control Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              PRERNA Smartboard Sanctuary • कक्षा शांति सेतु
            </div>
            <h2 className="text-sm sm:text-base font-black">
              Classroom Collective Somatic Reset
            </h2>
          </div>
        </div>

        {/* Center Patterns Selection */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => { setPattern('coherent_5_5'); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pattern === 'coherent_5_5' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Coherent (5s - 5s)
          </button>
          <button
            onClick={() => { setPattern('vagal_4_7_8'); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pattern === 'vagal_4_7_8' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vagal Exam Calm (4s - 7s - 8s)
          </button>
          <button
            onClick={() => { setPattern('box_4_4_4'); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pattern === 'box_4_4_4' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Box Focus (4s - 4s - 4s - 4s)
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-300"
            title={audioEnabled ? 'Mute 432 Hz Tone' : 'Enable 432 Hz Tone'}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-300"
            title="Toggle Smartboard Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 transition-colors"
            title="Exit Classroom Mode"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Sanctuary Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        
        {/* Soft Ambient Glow in Background */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000"
          style={{
            background: phase === 'inhale' ? 'rgba(99, 102, 241, 0.25)' :
                        phase === 'hold' ? 'rgba(245, 158, 11, 0.22)' :
                        phase === 'exhale' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(148, 163, 184, 0.15)',
            transform: `scale(${orbScale})`
          }}
        />

        {/* Central Breathing Orb */}
        <div className="relative flex items-center justify-center my-6">
          <div 
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-white/30 flex items-center justify-center transition-transform duration-200 ease-out shadow-2xl"
            style={{
              transform: `scale(${orbScale})`,
              borderColor: phase === 'inhale' ? '#818cf8' :
                           phase === 'hold' ? '#fbbf24' :
                           phase === 'exhale' ? '#34d399' : '#94a3b8',
              backgroundColor: phase === 'inhale' ? 'rgba(99, 102, 241, 0.15)' :
                               phase === 'hold' ? 'rgba(245, 158, 11, 0.15)' :
                               phase === 'exhale' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.08)'
            }}
          >
            <div className="text-center p-4">
              <Heart 
                size={28} 
                className={`mx-auto mb-2 transition-colors duration-300 ${
                  phase === 'inhale' ? 'text-indigo-400' :
                  phase === 'hold' ? 'text-amber-400' :
                  phase === 'exhale' ? 'text-emerald-400' : 'text-slate-400'
                }`} 
              />
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300">
                {phase}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Instruction Text */}
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-4 drop-shadow-md">
          {isActive ? phaseInstruction : 'Ready for Classroom Equilibrium'}
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-2 mt-3 text-sm font-mono text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
          <Clock size={14} />
          <span>{formattedTime}</span>
          <span className="text-slate-600">•</span>
          <span>{durationMinutes} Minute Homeroom Pause</span>
        </div>

        {/* Reflection Wisdom Card */}
        <div className="max-w-2xl mt-8 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
          <div className="text-base sm:text-lg font-serif italic text-amber-200 leading-relaxed">
            "{quote.hindi}"
          </div>
          <div className="text-xs text-slate-300 font-sans leading-relaxed">
            "{quote.english}"
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pt-1">
            — {quote.author}
          </div>
        </div>

      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        
        {/* Preset Duration Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold hidden sm:inline">Duration:</span>
          {[3, 5, 10].map(mins => (
            <button
              key={mins}
              onClick={() => { setDurationMinutes(mins); handleReset(); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                durationMinutes === mins ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            onClick={handleToggleActive}
            className={`px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            <span>{isActive ? 'Pause Sanctuary' : 'Start Classroom Grounding'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Zero Login Notice */}
        <div className="text-[11px] text-slate-400 hidden lg:block">
          Zero student devices required • Designed for classroom interactive smartboards
        </div>

      </div>
    </div>
  );
};

