import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy } from 'lucide-react';

interface PatternMatchProps {
  onComplete: (result: {
    score: number;
    accuracy: number;
    speed: number;
    pattern: string;
    level: number;
  }) => void;
}

type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';
type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

interface PatternItem {
  shape: Shape;
  color: Color;
}

export const PatternMatch: React.FC<PatternMatchProps> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [userPattern, setUserPattern] = useState<PatternItem[]>([]);
  const [phase, setPhase] = useState<'show' | 'input' | 'feedback'>('show');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  
  const shapes: Shape[] = ['circle', 'square', 'triangle', 'diamond', 'star'];
  const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'purple'];
  
  const colorClasses: Record<Color, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const generatePattern = useCallback((length: number): PatternItem[] => {
    return Array.from({ length }, () => ({
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [shapes, colors]);

  const completeGame = useCallback(() => {
    const accuracy = attempts > 0 ? (correctAttempts / attempts) * 100 : 0;
    const avgSpeed = attempts > 0 ? totalTime / attempts : 0;
    
    // Detect strategy pattern
    let strategy = 'systematic';
    if (avgSpeed < 2000) strategy = 'intuitive';
    else if (level > 5) strategy = 'exploratory';
    else if (accuracy > 90) strategy = 'cautious';
    
    onComplete({
      score,
      accuracy,
      speed: avgSpeed,
      pattern: strategy,
      level,
    });
  }, [attempts, correctAttempts, totalTime, level, score, onComplete]);

  const startLevel = useCallback(() => {
    const newPattern = generatePattern(3 + level);
    setPattern(newPattern);
    setUserPattern([]);
    setPhase('show');
    
    // Show pattern then hide
    setTimeout(() => {
      setPhase('input');
      setStartTime(Date.now());
    }, 2000 + level * 500);
  }, [level, generatePattern]);

  useEffect(() => {
    startLevel();
  }, [startLevel]);

  const handleShapeClick = (shape: Shape, color: Color) => {
    if (phase !== 'input') return;
    
    const newUserPattern = [...userPattern, { shape, color }];
    setUserPattern(newUserPattern);
    
    // Check if pattern complete
    if (newUserPattern.length === pattern.length) {
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      setTotalTime(prev => prev + timeTaken);
      setAttempts(prev => prev + 1);
      
      const isCorrect = newUserPattern.every((item, idx) => 
        item.shape === pattern[idx].shape && item.color === pattern[idx].color
      );
      
      setPhase('feedback');
      
      if (isCorrect) {
        setScore(prev => prev + level * 100);
        setCorrectAttempts(prev => prev + 1);
        setTimeout(() => {
          setLevel(prev => prev + 1);
          startLevel();
        }, 1000);
      } else {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives === 0) {
            completeGame();
          } else {
            setTimeout(() => {
              startLevel();
            }, 1500);
          }
          return newLives;
        });
      }
    }
  };

  const renderShape = (item: PatternItem, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12 md:w-16 md:h-16',
      lg: 'w-16 h-16 md:w-20 md:h-20',
    };
    
    // Using simple divs with border radius for shapes to keep it tailwind-friendly
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-lg',
      triangle: 'clip-triangle', // We'll add this to index.css or use a trick
      diamond: 'rotate-45 rounded-lg',
      star: 'clip-star',
    };
    
    return (
      <div
        className={`${sizeClasses[size]} ${colorClasses[item.color]} ${shapeClasses[item.shape]} 
          flex items-center justify-center shadow-lg border-2 border-white/20`}
      >
        {item.shape === 'star' && <span className="text-white text-xl">★</span>}
        {item.shape === 'triangle' && <span className="text-white text-xl">▲</span>}
      </div>
    );
  };

  if (lives === 0) {
    return (
      <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-4"
        >
          🎯
        </motion.div>
        <h3 className="text-2xl font-bold mb-2 text-white">Game Over!</h3>
        <p className="text-white/70">Final Score: {score}</p>
        <button 
          onClick={completeGame}
          className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
        >
          See Results
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
          <Brain className="text-indigo-400" />
          <span className="font-bold text-white tracking-wide">LEVEL {level}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full border border-yellow-500/30">
            <Trophy size={18} />
            <span className="font-bold">{score}</span>
          </div>
          <div className="flex gap-1.5 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg transition-opacity ${i < lives ? 'text-red-500 opacity-100' : 'text-red-500 opacity-20'}`}
              >
                ♥
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Display Area */}
      <div className="bg-black/20 rounded-2xl p-8 mb-8 min-h-[250px] flex items-center justify-center border border-white/5 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'show' && (
            <motion.div
              key="pattern"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 md:gap-6 flex-wrap justify-center relative z-10"
            >
              {pattern.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: idx * 0.15 }}
                >
                  {renderShape(item, 'lg')}
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center w-full z-10"
            >
              <p className="text-white/60 mb-6 font-bold tracking-widest uppercase text-sm animate-pulse">Recreate the pattern</p>
              <div className="flex gap-3 md:gap-5 flex-wrap justify-center min-h-[80px]">
                {userPattern.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring" }}
                  >
                    {renderShape(item, 'md')}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {phase === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center z-10"
            >
              {userPattern.length === pattern.length && 
               userPattern.every((item, idx) => 
                 item.shape === pattern[idx].shape && item.color === pattern[idx].color
               ) ? (
                <motion.div 
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] border-4 border-white/20"
                >
                  <span className="text-6xl text-white font-bold">✓</span>
                </motion.div>
              ) : (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)] border-4 border-white/20"
                >
                  <span className="text-6xl text-white font-bold">✗</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Grid (Color x Shape Matrix) */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 p-4 bg-black/10 rounded-2xl border border-white/5">
        {shapes.map((shape) => (
          colors.map((color) => (
            <motion.button
              key={`${shape}-${color}`}
              whileHover={{ scale: phase === 'input' ? 1.1 : 1, zIndex: 10 }}
              whileTap={{ scale: phase === 'input' ? 0.9 : 1 }}
              onClick={() => handleShapeClick(shape, color)}
              disabled={phase !== 'input'}
              className={`p-2 md:p-3 rounded-xl transition-all flex items-center justify-center ${
                phase === 'input' ? 'hover:bg-white/10 cursor-pointer shadow-sm hover:shadow-lg' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              {renderShape({ shape, color }, 'sm')}
            </motion.button>
          ))
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={completeGame}
          className="text-sm font-bold tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors"
        >
          End Game & See Results
        </button>
      </div>
    </div>
  );
};
