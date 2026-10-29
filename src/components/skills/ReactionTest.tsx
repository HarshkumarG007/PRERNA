import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export interface ReactionTestProps {
  onComplete: (result: {
    score: number;
    accuracy: number;
    speed: number;
    pattern: string;
    level: number;
  }) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

type TestState = 'intro' | 'waiting' | 'ready' | 'nogo' | 'early' | 'feedback' | 'complete';

interface TrialResult {
  trial: number;
  reactionTime: number; // in ms
  isGoTrial: boolean;
  success: boolean;
}

export const ReactionTest: React.FC<ReactionTestProps> = ({ onComplete, difficulty = 'medium' }) => {
  const [level, setLevel] = useState(difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1);
  const [gameState, setGameState] = useState<TestState>('intro');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalTrials = difficulty === 'hard' ? 7 : difficulty === 'medium' ? 5 : 4;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const startNextTrial = useCallback((trialIndex: number) => {
    clearTimer();
    setGameState('waiting');
    setLastReactionTime(null);

    // Variable delay between 1200ms and 3800ms
    const delay = Math.floor(Math.random() * 2600) + 1200;

    // At level 2+, 25% chance of a No-Go distractor signal
    const isNoGo = level >= 2 && Math.random() < 0.25;

    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      if (isNoGo) {
        setGameState('nogo');
        // No-Go signal stays for 1000ms. If user doesn't click, it's a success!
        timerRef.current = setTimeout(() => {
          handleNoGoSuccess(trialIndex);
        }, 1100);
      } else {
        setGameState('ready');
      }
    }, delay);
  }, [level]);

  const handleNoGoSuccess = (trialIndex: number) => {
    setResults(prev => [
      ...prev,
      { trial: trialIndex, reactionTime: 0, isGoTrial: false, success: true }
    ]);
    advanceOrComplete(trialIndex);
  };

  const advanceOrComplete = (completedTrialIndex: number) => {
    if (completedTrialIndex + 1 < totalTrials) {
      setCurrentTrial(completedTrialIndex + 1);
      if (completedTrialIndex + 1 >= Math.floor(totalTrials / 2) && level === 1) {
        setLevel(2);
      }
      setTimeout(() => {
        startNextTrial(completedTrialIndex + 1);
      }, 1000);
    } else {
      finishGame();
    }
  };

  const handleClick = () => {
    const now = performance.now();

    if (gameState === 'intro') {
      setCurrentTrial(0);
      setResults([]);
      startNextTrial(0);
      return;
    }

    if (gameState === 'waiting') {
      // False start! Early click
      clearTimer();
      setGameState('early');
      setResults(prev => [
        ...prev,
        { trial: currentTrial, reactionTime: 9999, isGoTrial: true, success: false }
      ]);
      return;
    }

    if (gameState === 'nogo') {
      // False alarm on No-Go!
      clearTimer();
      setGameState('early');
      setResults(prev => [
        ...prev,
        { trial: currentTrial, reactionTime: 9999, isGoTrial: false, success: false }
      ]);
      return;
    }

    if (gameState === 'ready') {
      // Valid hit!
      clearTimer();
      const rt = Math.round(now - startTimeRef.current);
      setLastReactionTime(rt);
      setGameState('feedback');

      setResults(prev => [
        ...prev,
        { trial: currentTrial, reactionTime: rt, isGoTrial: true, success: true }
      ]);

      setTimeout(() => {
        advanceOrComplete(currentTrial);
      }, 1200);
    }
  };

  const finishGame = () => {
    setGameState('complete');
  };

  const handleFinalSubmit = () => {
    const validGoHits = results.filter(r => r.isGoTrial && r.success && r.reactionTime < 5000);
    const avgSpeed = validGoHits.length > 0
      ? validGoHits.reduce((acc, r) => acc + r.reactionTime, 0) / validGoHits.length
      : 800;

    const successfulTrials = results.filter(r => r.success).length;
    const accuracy = results.length > 0 ? (successfulTrials / results.length) * 100 : 0;

    // Determine strategy pattern
    let pattern = 'systematic';
    if (avgSpeed < 320 && accuracy > 80) pattern = 'intuitive'; // Lightning reflexes
    else if (accuracy === 100) pattern = 'cautious'; // Perfect inhibitory control
    else if (avgSpeed < 300 && accuracy < 75) pattern = 'exploratory'; // Risk-taking impulse

    // Calibrate 0-100 score
    // 200ms -> 100, 450ms -> 75, 700ms -> 50
    const speedScore = Math.max(10, Math.min(100, 100 - (avgSpeed - 200) / 7));
    const finalScore = Math.round((speedScore * 0.7) + (accuracy * 0.3));

    onComplete({
      score: finalScore,
      accuracy: Math.round(accuracy),
      speed: Math.round(avgSpeed),
      pattern,
      level,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      <div className="w-full flex justify-between items-center mb-6 text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="text-amber-400" size={20} />
          <span className="font-bold text-sm tracking-wide uppercase">Quick Draw — Reflex & Focus</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            Trial {Math.min(currentTrial + 1, totalTrials)} / {totalTrials}
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
            Level {level}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div
            key="intro"
            data-testid="reaction-intro-box"
            role="button"
            tabIndex={0}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-slate-900 border border-slate-700 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500/50 transition-all shadow-2xl relative overflow-hidden group"
            onClick={handleClick}
          >
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Test Your Reflexes</h2>
            <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
              When the screen turns <strong className="text-emerald-400">EMERALD GREEN</strong>, tap or click as fast as humanly possible. If you click too early, it counts as a false start!
            </p>
            <span className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20">
              Click Anywhere to Begin
            </span>
          </motion.div>
        )}

        {gameState === 'waiting' && (
          <motion.div
            key="waiting"
            data-testid="reaction-waiting-box"
            role="button"
            tabIndex={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-amber-950/40 border-2 border-amber-500/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_0_50px_rgba(245,158,11,0.15)]"
            onClick={handleClick}
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 animate-ping mb-4" />
            <h3 className="text-3xl font-black text-amber-300 tracking-tight">Wait for GREEN...</h3>
            <p className="text-amber-200/70 text-sm mt-2">Hold your impulse. Steady...</p>
          </motion.div>
        )}

        {gameState === 'ready' && (
          <motion.div
            key="ready"
            data-testid="reaction-ready-box"
            role="button"
            tabIndex={0}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-emerald-500 border-4 border-emerald-300 p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_0_80px_rgba(16,185,129,0.6)]"
            onClick={handleClick}
          >
            <h2 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter animate-bounce">
              CLICK NOW!
            </h2>
            <p className="text-emerald-950 font-extrabold text-sm mt-3 uppercase tracking-widest">
              ⚡ MAXIMUM SPEED!
            </p>
          </motion.div>
        )}

        {gameState === 'nogo' && (
          <motion.div
            key="nogo"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-purple-950/80 border-4 border-purple-500 p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_0_60px_rgba(168,85,247,0.4)]"
            onClick={handleClick}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
              <AlertCircle size={36} />
            </div>
            <h2 className="text-4xl font-black text-purple-200">HOLD! DO NOT CLICK</h2>
            <p className="text-purple-300/80 text-sm mt-2">Cognitive inhibition check — resist the reflex!</p>
          </motion.div>
        )}

        {gameState === 'early' && (
          <motion.div
            key="early"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-rose-950/70 border-2 border-rose-500 p-8 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertCircle size={36} />
            </div>
            <h3 className="text-3xl font-black text-rose-300">Too Early!</h3>
            <p className="text-rose-200/80 text-sm mt-2 max-w-xs">
              You clicked before the green signal. Resetting trial...
            </p>
            <button
              onClick={() => startNextTrial(currentTrial)}
              className="mt-6 px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl font-bold border border-rose-500/40 text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} /> Try This Trial Again
            </button>
          </motion.div>
        )}

        {gameState === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-slate-900 border border-emerald-500/40 p-8 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <CheckCircle2 size={48} className="text-emerald-400 mb-3" />
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Reaction Speed</span>
            <div className="text-5xl font-black text-white mt-1 font-mono tracking-tight">
              {lastReactionTime} <span className="text-2xl text-emerald-400">ms</span>
            </div>
            <p className="text-slate-400 text-xs mt-3">
              {lastReactionTime && lastReactionTime < 280 ? '⚡ Phenomenal, Olympic-class speed!' :
               lastReactionTime && lastReactionTime < 380 ? '🎯 Sharp, well-above average reflex!' :
               '👍 Good reaction. Keeping focus.'}
            </p>
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-slate-900 border border-slate-700 p-8 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-3xl font-black text-white">Reflex Trials Complete</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              Your processing speed and cognitive inhibition data have been captured.
            </p>
            <button
              onClick={handleFinalSubmit}
              className="mt-6 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black rounded-xl text-base shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
            >
              Save Results & Proceed
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
