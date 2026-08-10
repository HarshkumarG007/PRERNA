import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

const EXERCISES = [
  {
    id: 'box_breathing',
    title: 'Box Breathing',
    category: 'Breathing',
    description: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Resets the autonomic nervous system.',
    duration: 60,
    color: 'from-blue-500 to-indigo-600',
    icon: '🌬️',
  },
  {
    id: '4_7_8_breathing',
    title: '4-7-8 Breathing',
    category: 'Breathing',
    description: 'Inhale for 4s, hold for 7s, exhale slowly for 8s. Natural tranquilizer for the nervous system.',
    duration: 120,
    color: 'from-cyan-400 to-blue-500',
    icon: '🫁',
  },
  {
    id: 'grounding_54321',
    title: '5-4-3-2-1 Grounding',
    category: 'Grounding',
    description: 'Find 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste. Brings you back to the present.',
    duration: 120,
    color: 'from-emerald-400 to-teal-600',
    icon: '🌳',
  },
  {
    id: 'muscle_relaxation',
    title: 'Progressive Relaxation',
    category: 'Grounding',
    description: 'Tense and slowly release each muscle group, starting from your toes up to your head.',
    duration: 180,
    color: 'from-purple-500 to-fuchsia-600',
    icon: '🧘',
  },
  {
    id: 'cognitive_reframing',
    title: 'Cognitive Reframing',
    category: 'Cognitive',
    description: 'Identify a negative thought, challenge its accuracy, and replace it with a balanced perspective.',
    duration: 180,
    color: 'from-amber-400 to-orange-500',
    icon: '🧠',
  }
];

import { DisclosureGate } from '../consent/DisclosureGate';

export const CopingSkills: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <DisclosureGate activityType="coping_skills" onDecline={onClose}>
      <CopingSkillsInner onClose={onClose} />
    </DisclosureGate>
  );
};

const CopingSkillsInner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const user = useAppStore(state => state.user);

  useEffect(() => {
    let timer: number;
    if (activeExercise && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeExercise) {
      handleCompletion(activeExercise);
    }
    return () => clearInterval(timer);
  }, [activeExercise, timeLeft]);

  const handleCompletion = async (exerciseId: string) => {
    // Log completion
    if (user) {
      try {
        await invoke('log_interaction', {
          interaction: {
            interaction_type: 'coping_skill_completed',
            metadata: JSON.stringify({ exercise: exerciseId }),
            emotional_signal: 0.8, // positive emotional signal for completing a coping exercise
          }
        });
      } catch (e) {
        console.error("Failed to log coping skill completion:", e);
      }
    }
    setActiveExercise(null);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/10 border border-white/20 p-6 md:p-10 rounded-3xl shadow-2xl max-w-4xl w-full backdrop-blur-xl text-white overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-200 to-cyan-300 bg-clip-text text-transparent">
              Regulate & Ground
            </h2>
            <p className="text-white/70 font-medium mt-2">Take a moment to reset your nervous system.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 bg-white/5"
          >
            ✕
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          {activeExercise ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 space-y-8"
            >
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl animate-pulse bg-white/10 shadow-inner">
                {EXERCISES.find(e => e.id === activeExercise)?.icon}
              </div>
              <h3 className="text-4xl font-black text-center">
                {EXERCISES.find(e => e.id === activeExercise)?.title}
              </h3>
              <p className="text-xl text-white/80 text-center max-w-lg font-medium leading-relaxed">
                {EXERCISES.find(e => e.id === activeExercise)?.description}
              </p>
              
              <div className="text-7xl font-black tracking-widest bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-lg">
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setActiveExercise(null)}
                  className="px-8 py-3 rounded-xl border border-white/30 text-white/80 hover:bg-white/10 hover:text-white transition-all font-bold"
                >
                  End Early
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {EXERCISES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => startExercise(ex.id, ex.duration)}
                  className={`flex flex-col items-start p-6 rounded-2xl bg-gradient-to-br ${ex.color} bg-opacity-20 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-white/20 shadow-xl shadow-black/20 text-left focus:outline-none group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:scale-110 transition-transform">
                    {ex.icon}
                  </div>
                  
                  <span className="px-3 py-1 bg-black/20 rounded-full text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm">
                    {ex.category}
                  </span>
                  
                  <h3 className="text-2xl font-black mb-2 drop-shadow-md z-10">{ex.title}</h3>
                  <p className="text-sm text-white/90 drop-shadow-sm mb-6 leading-relaxed font-medium z-10">
                    {ex.description}
                  </p>
                  
                  <div className="mt-auto inline-flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold z-10">
                    <span>⏱</span>
                    <span>{formatTime(ex.duration)}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
