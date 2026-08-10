import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatternMatch } from './PatternMatch';
import { WordBridge } from './WordBridge';
import { SkillArenaEngine, CognitiveProfile, GameResult } from '../../assessment/skills/engine';
import { useDatabase } from '../../hooks/useDatabase';
import { ArrowLeft, Gamepad2, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';

import { DisclosureGate } from '../consent/DisclosureGate';

type GameType = 'pattern' | 'word' | 'spatial' | 'reaction' | 'creative';

export const SkillArena: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  return (
    <DisclosureGate activityType="skill_arena" onDecline={onExit}>
      <SkillArenaInner onExit={onExit} />
    </DisclosureGate>
  );
};

const SkillArenaInner: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [engine] = useState(() => new SkillArenaEngine());
  const [completedGames, setCompletedGames] = useState<Set<GameType>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const { saveSession } = useDatabase();

  const games = [
    { id: 'pattern' as GameType, name: 'Pattern Match', icon: '🧩', desc: 'Visual memory & logic', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/30' },
    { id: 'word' as GameType, name: 'Word Bridge', icon: '🔗', desc: 'Language & connections', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
    { id: 'spatial' as GameType, name: 'Spatial Spin', icon: '🎯', desc: 'Mental rotation (Coming Soon)', color: 'from-purple-500 to-pink-600', shadow: 'shadow-pink-500/30' },
    { id: 'reaction' as GameType, name: 'Quick Draw', icon: '⚡', desc: 'Speed & reflexes (Coming Soon)', color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/30' },
    { id: 'creative' as GameType, name: 'Idea Chain', icon: '💡', desc: 'Divergent thinking (Coming Soon)', color: 'from-yellow-500 to-amber-600', shadow: 'shadow-yellow-500/30' },
  ];

  const handleGameComplete = async (gameId: string, result: Omit<GameResult, 'gameId' | 'timestamp' | 'difficultyReached' | 'strategyPattern'> & { pattern: string; level: number }) => {
    engine.recordResult(gameId, {
      ...result,
      gameId,
      timestamp: new Date(),
      difficultyReached: result.level,
      strategyPattern: result.pattern,
    });
    
    const newCompleted = new Set([...completedGames, gameId as GameType]);
    setCompletedGames(newCompleted);
    setActiveGame(null);
    
    if (newCompleted.size >= 2) {
      const cognitiveProfile = engine.calculateCognitiveProfile();
      setProfile(cognitiveProfile);
      setShowResults(true);
      
      await saveSession({
        session_type: 'skill_arena',
        raw_choices: engine.exportData(),
        derived_traits: JSON.stringify(cognitiveProfile),
        disclosure_version: '1.0',
        disclosure_shown_at: Date.now(),
      });
    }
  };

  if (showResults && profile) {
    return <SkillResults profile={profile} onClose={onExit} />;
  }

  // Active Game Fullscreen Wrapper
  if (activeGame) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Dynamic Game Backgrounds */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           {activeGame === 'pattern' && (
             <>
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
             </>
           )}
           {activeGame === 'word' && (
             <>
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px]" />
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[120px]" />
             </>
           )}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="p-6">
            <button
              onClick={() => setActiveGame(null)}
              className="text-white/50 hover:text-white font-bold tracking-widest uppercase text-sm transition-colors flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 w-fit"
            >
              <ArrowLeft size={16} /> Exit Game
            </button>
          </div>
          
          <div className="flex-1 p-4 flex items-center justify-center">
             {activeGame === 'pattern' && <PatternMatch onComplete={(r) => handleGameComplete('pattern', r)} />}
             {activeGame === 'word' && <WordBridge onComplete={(r) => handleGameComplete('word', r)} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto custom-scrollbar">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -left-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-white/20 relative">
               <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm" />
               <Gamepad2 size={40} className="text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Skill Arena
              </h1>
              <p className="text-cyan-200 font-medium text-lg flex items-center gap-2">
                <BrainCircuit size={20} /> Discover your cognitive strengths
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-2"
          >
            Leave Arena
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, i) => {
            const isPlayable = game.id === 'pattern' || game.id === 'word';
            const isCompleted = completedGames.has(game.id);

            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={isPlayable && !isCompleted ? { scale: 1.03, y: -5 } : {}}
                whileTap={isPlayable && !isCompleted ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (isPlayable && !isCompleted) setActiveGame(game.id);
                }}
                className={`relative p-8 rounded-[2rem] text-left overflow-hidden group border transition-all duration-300 ${
                  isPlayable 
                    ? `bg-[#0f172a]/60 backdrop-blur-xl border-white/10 hover:border-white/30 cursor-pointer shadow-xl hover:shadow-2xl hover:${game.shadow}` 
                    : 'bg-black/20 backdrop-blur-sm border-white/5 cursor-not-allowed opacity-60 grayscale'
                } ${isCompleted ? 'opacity-50 grayscale border-emerald-500/50' : ''}`}
              >
                {/* Vibrant Card Gradient Overlay on Hover */}
                {isPlayable && !isCompleted && (
                   <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                )}

                <div className={`text-5xl mb-6 relative z-10 ${!isPlayable && 'opacity-40'}`}>
                  {game.icon}
                </div>
                
                <h3 className={`text-2xl font-black mb-2 relative z-10 ${isPlayable ? 'text-white' : 'text-white/40'}`}>
                  {game.name}
                </h3>
                <p className={`relative z-10 font-medium ${isPlayable ? 'text-slate-400 group-hover:text-slate-300' : 'text-white/30'}`}>
                  {game.desc}
                </p>
                
                {isCompleted && (
                  <div className="absolute top-6 right-6 w-10 h-10 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  </div>
                )}
                
                {isPlayable && !isCompleted && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Play Now
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {completedGames.size > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 p-8 md:p-12 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-xl rounded-[2rem] border border-emerald-500/30 text-center max-w-3xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              
              <div className="relative z-10">
                <p className="text-emerald-400 mb-6 font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2">
                  <Sparkles size={16} /> {completedGames.size} of 2 games completed
                </p>
                
                {completedGames.size >= 2 ? (
                  <button
                    onClick={() => setShowResults(true)}
                    className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all active:translate-y-0"
                  >
                    Reveal Cognitive DNA
                  </button>
                ) : (
                   <div className="h-2 w-full max-w-md mx-auto bg-black/40 rounded-full overflow-hidden border border-white/10">
                     <motion.div 
                       className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                       initial={{ width: 0 }}
                       animate={{ width: `${(completedGames.size / 2) * 100}%` }}
                       transition={{ duration: 0.5 }}
                     />
                   </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

const SkillResults: React.FC<{ profile: CognitiveProfile; onClose: () => void }> = ({ 
  profile, 
  onClose 
}) => {
  const skills = [
    { name: 'Logical Reasoning', value: profile.logicalReasoning, icon: '🧠', color: 'from-blue-400 to-indigo-500' },
    { name: 'Verbal Fluency', value: profile.verbalFluency, icon: '🗣️', color: 'from-emerald-400 to-teal-500' },
    { name: 'Spatial Intelligence', value: profile.spatialIntelligence, icon: '🎨', color: 'from-purple-400 to-pink-500' },
    { name: 'Creative Thinking', value: profile.creativeDivergence, icon: '💡', color: 'from-yellow-400 to-amber-500' },
    { name: 'Processing Speed', value: profile.processingSpeed, icon: '⚡', color: 'from-orange-400 to-red-500' },
    { name: 'Working Memory', value: profile.workingMemory, icon: '📚', color: 'from-cyan-400 to-blue-500' },
  ];

  const dominantSkill = skills.sort((a, b) => b.value - a.value)[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto flex items-center justify-center p-6">
      {/* Ambient Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#0f172a]/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-6 bg-white/5 rounded-full border border-white/10 shadow-inner mb-6 relative">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-cyan-500/30 rounded-full border-dashed"
            />
            <BrainCircuit size={64} className="text-cyan-400" />
          </div>
          
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-2">Analysis Complete</h2>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Your Cognitive DNA
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            Based on your gameplay, here is how your mind naturally processes the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {skills.map((skill, idx) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black/40 rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                  {skill.icon}
                </div>
                <div className="flex-1 flex justify-between items-end">
                  <span className="font-bold text-white">{skill.name}</span>
                  <span className="font-black text-white text-xl">{Math.round(skill.value)}<span className="text-white/40 text-sm font-medium">%</span></span>
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className={`h-full bg-gradient-to-r ${skill.color} relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.value}%` }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-[2rem] p-8 mb-10 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
               <Sparkles size={16} /> Your Superpower
            </h3>
            <p className="text-slate-300 text-xl leading-relaxed font-medium">
              Your strongest cognitive ability is <strong className="text-white font-black px-2 py-1 bg-white/10 rounded-lg">{dominantSkill.name}</strong>. 
              You process information best through <strong className="text-white font-black px-2 py-1 bg-white/10 rounded-lg">{profile.learningStyle}</strong> methods.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:-translate-y-1 transition-all active:translate-y-0"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
};
