import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PatternMatch } from './PatternMatch';
import { WordBridge } from './WordBridge';
import { SkillArenaEngine, CognitiveProfile, GameResult } from '../../assessment/skills/engine';
import { useDatabase } from '../../hooks/useDatabase';

type GameType = 'pattern' | 'word' | 'spatial' | 'reaction' | 'creative';

export const SkillArena: React.FC<{ userId: string; onExit: () => void }> = ({ userId, onExit }) => {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [engine] = useState(() => new SkillArenaEngine());
  const [completedGames, setCompletedGames] = useState<Set<GameType>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const { saveSession } = useDatabase();

  const games = [
    { id: 'pattern' as GameType, name: 'Pattern Match', icon: '🧩', desc: 'Visual memory & logic', color: 'from-blue-500 to-indigo-600' },
    { id: 'word' as GameType, name: 'Word Bridge', icon: '🔗', desc: 'Language & connections', color: 'from-emerald-500 to-teal-600' },
    { id: 'spatial' as GameType, name: 'Spatial Spin', icon: '🎯', desc: 'Mental rotation (Coming Soon)', color: 'from-purple-500 to-pink-600' },
    { id: 'reaction' as GameType, name: 'Quick Draw', icon: '⚡', desc: 'Speed & reflexes (Coming Soon)', color: 'from-orange-500 to-red-600' },
    { id: 'creative' as GameType, name: 'Idea Chain', icon: '💡', desc: 'Divergent thinking (Coming Soon)', color: 'from-yellow-500 to-amber-600' },
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
    
    // For demonstration, show results after just 2 games, normally 5
    if (newCompleted.size >= 2) {
      const cognitiveProfile = engine.calculateCognitiveProfile();
      setProfile(cognitiveProfile);
      setShowResults(true);
      
      // Save to database
      await saveSession({
        user_id: userId,
        session_type: 'skill_arena',
        raw_choices: engine.exportData(),
        derived_traits: JSON.stringify(cognitiveProfile),
      });
    }
  };

  if (showResults && profile) {
    return <SkillResults profile={profile} onClose={onExit} />;
  }

  if (activeGame === 'pattern') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-8 overflow-y-auto">
        <button
          onClick={() => setActiveGame(null)}
          className="mb-6 text-white/50 hover:text-white font-bold tracking-widest uppercase text-sm transition-colors flex items-center gap-2"
        >
          ← Exit Game
        </button>
        <PatternMatch onComplete={(r) => handleGameComplete('pattern', r)} />
      </div>
    );
  }

  if (activeGame === 'word') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-4 md:p-8 overflow-y-auto">
        <button
          onClick={() => setActiveGame(null)}
          className="mb-6 text-white/50 hover:text-white font-bold tracking-widest uppercase text-sm transition-colors flex items-center gap-2"
        >
          ← Exit Game
        </button>
        <WordBridge onComplete={(r) => handleGameComplete('word', r)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 mb-2">
              Skill Arena
            </h1>
            <p className="text-white/60 font-medium tracking-wide">Play mini-games to discover your cognitive strengths</p>
          </div>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors border border-white/10"
          >
            Leave Arena
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const isPlayable = game.id === 'pattern' || game.id === 'word';
            const isCompleted = completedGames.has(game.id);

            return (
              <motion.button
                key={game.id}
                whileHover={isPlayable && !isCompleted ? { scale: 1.03, y: -5 } : {}}
                whileTap={isPlayable && !isCompleted ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (isPlayable && !isCompleted) setActiveGame(game.id);
                }}
                className={`relative p-8 rounded-3xl text-left overflow-hidden group shadow-xl ${
                  isPlayable 
                    ? `bg-gradient-to-br ${game.color} cursor-pointer` 
                    : 'bg-white/5 cursor-not-allowed border border-white/10'
                } ${isCompleted ? 'opacity-50 grayscale' : ''}`}
              >
                <div className={`text-5xl mb-4 ${!isPlayable && 'opacity-40'}`}>{game.icon}</div>
                <h3 className={`text-2xl font-black mb-2 ${isPlayable ? 'text-white' : 'text-white/40'}`}>
                  {game.name}
                </h3>
                <p className={isPlayable ? 'text-white/80' : 'text-white/30'}>{game.desc}</p>
                
                {isCompleted && (
                  <div className="absolute top-6 right-6 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-emerald-900 text-sm font-black">✓</span>
                  </div>
                )}
                
                {isPlayable && !isCompleted && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                )}
              </motion.button>
            )
          })}
        </div>

        {completedGames.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center max-w-2xl mx-auto shadow-2xl"
          >
            <p className="text-white/60 mb-6 font-bold tracking-widest uppercase">
              {completedGames.size} of 2 available games completed
            </p>
            {completedGames.size >= 2 && (
              <button
                onClick={() => setShowResults(true)}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-1 transition-all active:translate-y-0"
              >
                Reveal Cognitive Profile
              </button>
            )}
          </motion.div>
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
    { name: 'Logical Reasoning', value: profile.logicalReasoning, icon: '🧠', color: 'from-blue-400 to-indigo-400' },
    { name: 'Verbal Fluency', value: profile.verbalFluency, icon: '🗣️', color: 'from-emerald-400 to-teal-400' },
    { name: 'Spatial Intelligence', value: profile.spatialIntelligence, icon: '🎨', color: 'from-purple-400 to-pink-400' },
    { name: 'Creative Thinking', value: profile.creativeDivergence, icon: '💡', color: 'from-yellow-400 to-amber-400' },
    { name: 'Processing Speed', value: profile.processingSpeed, icon: '⚡', color: 'from-orange-400 to-red-400' },
    { name: 'Working Memory', value: profile.workingMemory, icon: '📚', color: 'from-cyan-400 to-blue-400' },
  ];

  const dominantSkill = skills.sort((a, b) => b.value - a.value)[0];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/20 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
        
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold text-white/70 uppercase tracking-widest mb-4 border border-white/10">Analysis Complete</span>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-4">
            Your Cognitive DNA
          </h2>
          <p className="text-white/60 text-lg">
            Based on your gameplay, here's how your mind naturally works.
          </p>
        </div>

        <div className="grid gap-5 mb-10">
          {skills.map((skill, idx) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-2xl p-4 flex items-center gap-5 border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                {skill.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-white/90">{skill.name}</span>
                  <span className="font-black text-white">{Math.round(skill.value)}<span className="text-white/50 text-xs font-medium">%</span></span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${skill.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ delay: idx * 0.1 + 0.3, duration: 1, type: "spring" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl p-8 mb-10 border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-6xl opacity-10 blur-[2px]">{dominantSkill.icon}</div>
          <h3 className="text-white/50 font-bold uppercase tracking-widest text-xs mb-3">Your Superpower</h3>
          <p className="text-white text-xl leading-relaxed font-medium">
            Your strongest cognitive ability is <strong className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black">{dominantSkill.name}</strong>. 
            You process information best through <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-black">{profile.learningStyle}</strong> methods.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all active:translate-y-0 text-lg"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
};
