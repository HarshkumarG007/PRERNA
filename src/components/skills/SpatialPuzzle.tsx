import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, XCircle, RotateCw } from 'lucide-react';

export interface SpatialPuzzleProps {
  onComplete: (result: {
    score: number;
    accuracy: number;
    speed: number;
    pattern: string;
    level: number;
  }) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface PuzzleItem {
  id: string;
  name: string;
  targetSvgPaths: string[]; // Grid blocks (x, y coords in 4x4 grid)
  options: {
    id: string;
    rotationDeg: number;
    isCorrect: boolean;
    mirrored: boolean;
  }[];
}

const PUZZLE_LEVELS: PuzzleItem[] = [
  {
    id: 'lvl-1',
    name: 'Tetris ' + 'L-Corner',
    targetSvgPaths: ['0,0', '0,1', '0,2', '1,2'],
    options: [
      { id: 'opt-1', rotationDeg: 90, isCorrect: true, mirrored: false },
      { id: 'opt-2', rotationDeg: 0, isCorrect: false, mirrored: true },
      { id: 'opt-3', rotationDeg: 180, isCorrect: false, mirrored: true },
      { id: 'opt-4', rotationDeg: 270, isCorrect: false, mirrored: true },
    ],
  },
  {
    id: 'lvl-2',
    name: 'T-Bridge Step',
    targetSvgPaths: ['1,0', '0,1', '1,1', '2,1', '1,2'],
    options: [
      { id: 'opt-1', rotationDeg: 0, isCorrect: false, mirrored: true },
      { id: 'opt-2', rotationDeg: 180, isCorrect: true, mirrored: false },
      { id: 'opt-3', rotationDeg: 90, isCorrect: false, mirrored: true },
      { id: 'opt-4', rotationDeg: 270, isCorrect: false, mirrored: true },
    ],
  },
  {
    id: 'lvl-3',
    name: 'Asymmetric Helix',
    targetSvgPaths: ['0,0', '1,0', '1,1', '1,2', '2,2', '2,3'],
    options: [
      { id: 'opt-1', rotationDeg: 90, isCorrect: false, mirrored: true },
      { id: 'opt-2', rotationDeg: 270, isCorrect: true, mirrored: false },
      { id: 'opt-3', rotationDeg: 180, isCorrect: false, mirrored: true },
      { id: 'opt-4', rotationDeg: 0, isCorrect: false, mirrored: true },
    ],
  },
  {
    id: 'lvl-4',
    name: 'Zig-Zag Anchor',
    targetSvgPaths: ['0,0', '1,0', '1,1', '2,1', '2,2'],
    options: [
      { id: 'opt-1', rotationDeg: 180, isCorrect: false, mirrored: true },
      { id: 'opt-2', rotationDeg: 0, isCorrect: false, mirrored: true },
      { id: 'opt-3', rotationDeg: 90, isCorrect: true, mirrored: false },
      { id: 'opt-4', rotationDeg: 270, isCorrect: false, mirrored: true },
    ],
  },
  {
    id: 'lvl-5',
    name: 'Complex Polyomino',
    targetSvgPaths: ['0,1', '1,0', '1,1', '1,2', '2,2', '3,2'],
    options: [
      { id: 'opt-1', rotationDeg: 270, isCorrect: false, mirrored: true },
      { id: 'opt-2', rotationDeg: 90, isCorrect: false, mirrored: true },
      { id: 'opt-3', rotationDeg: 0, isCorrect: false, mirrored: true },
      { id: 'opt-4', rotationDeg: 180, isCorrect: true, mirrored: false },
    ],
  },
];

export const SpatialPuzzle: React.FC<SpatialPuzzleProps> = ({ onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalReactionTime, setTotalReactionTime] = useState(0);
  const startTimeRef = useRef<number>(performance.now());

  const currentLevel = PUZZLE_LEVELS[levelIndex];

  useEffect(() => {
    startTimeRef.current = performance.now();
    setSelectedOption(null);
    setFeedback(null);
  }, [levelIndex]);

  const handleSelect = (optionId: string) => {
    if (feedback !== null) return; // Prevent multiple clicks during feedback
    const elapsed = performance.now() - startTimeRef.current;
    setTotalReactionTime(prev => prev + elapsed);
    setSelectedOption(optionId);

    const chosen = currentLevel.options.find(o => o.id === optionId);
    const isCorrect = chosen?.isCorrect ?? false;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (levelIndex + 1 < PUZZLE_LEVELS.length) {
        setLevelIndex(prev => prev + 1);
      } else {
        finishGame(isCorrect ? correctCount + 1 : correctCount, totalReactionTime + elapsed);
      }
    }, 1100);
  };

  const finishGame = useCallback((finalCorrect: number, finalTime: number) => {
    const totalLevels = PUZZLE_LEVELS.length;
    const accuracy = (finalCorrect / totalLevels) * 100;
    const avgSpeed = finalTime / totalLevels;

    let pattern = 'systematic';
    if (avgSpeed < 3000 && accuracy >= 80) pattern = 'intuitive'; // High-speed 3D visualizer
    else if (accuracy === 100) pattern = 'cautious'; // Highly methodical
    else if (avgSpeed < 2500 && accuracy < 60) pattern = 'exploratory';

    // Difficulty reached bonus
    const difficultyBonus = finalCorrect >= 4 ? 20 : finalCorrect >= 2 ? 10 : 0;
    const score = Math.min(100, Math.round((accuracy * 0.8) + difficultyBonus));

    onComplete({
      score,
      accuracy: Math.round(accuracy),
      speed: Math.round(avgSpeed),
      pattern,
      level: levelIndex + 1,
    });
  }, [levelIndex, onComplete]);

  // Render a 4x4 Polyomino block figure
  const renderShape = (coords: string[], rotationDeg = 0, mirrored = false) => {
    const blockSize = 18;
    return (
      <svg
        width={90}
        height={90}
        viewBox="0 0 90 90"
        className="transition-transform duration-300"
        style={{
          transform: `rotate(${rotationDeg}deg) ${mirrored ? 'scaleX(-1)' : ''}`,
          transformOrigin: '45px 45px',
        }}
      >
        <g transform="translate(9, 9)">
          {coords.map((c, i) => {
            const [x, y] = c.split(',').map(Number);
            return (
              <rect
                key={i}
                x={x * blockSize}
                y={y * blockSize}
                width={blockSize - 2}
                height={blockSize - 2}
                rx={3}
                className="fill-indigo-400 stroke-indigo-200 stroke-1 shadow-sm"
              />
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center select-none">
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 text-slate-300">
        <div className="flex items-center gap-2">
          <Compass className="text-purple-400" size={20} />
          <span className="font-bold text-sm tracking-wide uppercase">Spatial Spin — Mental Rotation</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            Puzzle {levelIndex + 1} / {PUZZLE_LEVELS.length}
          </span>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-bold">
            {currentLevel.name}
          </span>
        </div>
      </div>

      {/* Main Puzzle Card */}
      <div className="w-full bg-slate-900/90 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Target Figure
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Which one is the EXACT rotated figure?</h2>
          <p className="text-slate-400 text-xs mt-1">
            Beware of mirror reflections! Only ONE option can be rotated without flipping.
          </p>
        </div>

        {/* Target display container */}
        <div className="p-6 bg-black/40 rounded-2xl border-2 border-purple-400/30 shadow-inner mb-8 flex items-center justify-center">
          {renderShape(currentLevel.targetSvgPaths, 0, false)}
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {currentLevel.options.map((opt, idx) => {
            const isSelected = selectedOption === opt.id;
            let cardBorder = 'border-white/10 hover:border-purple-400/50 hover:bg-white/5';

            if (isSelected) {
              if (feedback === 'correct') {
                cardBorder = 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
              } else if (feedback === 'wrong') {
                cardBorder = 'border-rose-500 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
              }
            }

            return (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(opt.id)}
                disabled={feedback !== null}
                className={`flex flex-col items-center justify-center p-6 bg-black/30 border-2 rounded-2xl transition-all relative ${cardBorder}`}
              >
                <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500 font-bold uppercase">
                  Option {String.fromCharCode(65 + idx)}
                </div>

                <div className="my-2">
                  {renderShape(currentLevel.targetSvgPaths, opt.rotationDeg, opt.mirrored)}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-2">
                  <RotateCw size={12} /> {opt.rotationDeg}°
                </div>

                {isSelected && feedback === 'correct' && (
                  <CheckCircle2 size={24} className="text-emerald-400 absolute top-2 right-2 animate-bounce" />
                )}
                {isSelected && feedback === 'wrong' && (
                  <XCircle size={24} className="text-rose-400 absolute top-2 right-2" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback text */}
        <div className="h-8 mt-6 flex items-center justify-center">
          <AnimatePresence>
            {feedback === 'correct' && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 text-sm font-black flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Perfect 3D Match! Moving to next level...
              </motion.span>
            )}
            {feedback === 'wrong' && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-rose-400 text-sm font-black flex items-center gap-1.5"
              >
                <XCircle size={16} /> Mirrored Distractor! Next puzzle...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
