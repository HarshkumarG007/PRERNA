import React, { useState, useEffect } from 'react';

const EXERCISES = [
  {
    id: 'breathe',
    title: 'Box Breathing',
    description: 'Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4.',
    duration: 60, // seconds
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Find 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.',
    duration: 120, // seconds
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'muscle',
    title: 'Progressive Relaxation',
    description: 'Tense and slowly release each muscle group, starting from your toes.',
    duration: 180, // seconds
    color: 'from-purple-400 to-fuchsia-500',
  }
];

export const CopingSkills: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: number;
    if (activeExercise && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setActiveExercise(null);
    }
    return () => clearInterval(timer);
  }, [activeExercise, timeLeft]);

  const startExercise = (id: string, duration: number) => {
    setActiveExercise(id);
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-2xl w-full backdrop-blur-xl m-4 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Regulate & Ground</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        
        {activeExercise ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-pulse">
            <h3 className="text-4xl font-semibold text-center">
              {EXERCISES.find(e => e.id === activeExercise)?.title}
            </h3>
            <p className="text-xl text-white/80 text-center max-w-md">
              {EXERCISES.find(e => e.id === activeExercise)?.description}
            </p>
            <div className="text-6xl font-bold tracking-widest text-indigo-300">
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setActiveExercise(null)}
              className="mt-8 px-6 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
            >
              Stop Exercise
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => startExercise(ex.id, ex.duration)}
                className={`flex flex-col items-start p-6 rounded-2xl bg-gradient-to-br ${ex.color} bg-opacity-20 hover:scale-105 transition-transform duration-300 border border-white/20 shadow-lg text-left focus:outline-none`}
              >
                <h3 className="text-xl font-bold mb-2 drop-shadow-md">{ex.title}</h3>
                <p className="text-sm text-white/90 drop-shadow-sm mb-4 leading-relaxed">{ex.description}</p>
                <div className="mt-auto inline-flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full text-xs font-medium">
                  <span>⏱</span>
                  <span>{formatTime(ex.duration)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
