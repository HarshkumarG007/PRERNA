import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap } from 'lucide-react';

interface WordBridgeProps {
  onComplete: (result: {
    score: number;
    accuracy: number;
    speed: number;
    connections: number;
    pattern: string;
    level: number;
  }) => void;
}

const WORD_PAIRS = [
  { start: 'Fire', target: 'Ice', theme: 'opposites' },
  { start: 'Student', target: 'Teacher', theme: 'relationships' },
  { start: 'Seed', target: 'Forest', theme: 'growth' },
  { start: 'Pen', target: 'Movie', theme: 'creation' },
  { start: 'Village', target: 'City', theme: 'places' },
];

const VALID_CONNECTIONS = new Set([
  'fire-water', 'water-ice',
  'student-school', 'school-teacher', 'student-book', 'book-teacher',
  'seed-plant', 'plant-tree', 'tree-forest', 'seed-tree',
  'pen-paper', 'paper-book', 'book-story', 'story-movie', 'pen-story',
  'village-town', 'town-city', 'village-people', 'people-city'
]);

export const WordBridge: React.FC<WordBridgeProps> = ({ onComplete }) => {
  const [currentPair, setCurrentPair] = useState(0);
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [connections, setConnections] = useState(0);
  const [feedback, setFeedback] = useState<'valid' | 'invalid' | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  
  const current = WORD_PAIRS[currentPair];

  const validateConnection = (from: string, to: string): boolean => {
    const key1 = `${from.toLowerCase()}-${to.toLowerCase()}`;
    const key2 = `${to.toLowerCase()}-${from.toLowerCase()}`;
    
    if (VALID_CONNECTIONS.has(key1) || VALID_CONNECTIONS.has(key2)) return true;
    
    const shared = [...from.toLowerCase()].filter(c => 
      to.toLowerCase().includes(c)
    ).length;
    const similarity = shared / Math.max(from.length, to.length);
    
    return similarity > 0.3 || Math.abs(from.length - to.length) <= 2;
  };

  const submitWord = () => {
    if (!input.trim()) return;
    
    const lastWord = chain.length > 0 ? chain[chain.length - 1] : current.start;
    const newWord = input.trim();
    
    if (validateConnection(lastWord, newWord)) {
      const newChain = [...chain, newWord];
      setChain(newChain);
      setScore(s => s + 10 * newChain.length);
      setConnections(c => c + 1);
      setFeedback('valid');
      
      const timeTaken = Date.now() - startTime;
      setTotalTime(t => t + timeTaken);
      
      if (newWord.toLowerCase() === current.target.toLowerCase()) {
        setTimeout(() => nextLevel(), 1000);
      }
    } else {
      setFeedback('invalid');
      setScore(s => Math.max(0, s - 5));
    }
    
    setInput('');
    setTimeout(() => setFeedback(null), 1000);
  };

  const nextLevel = () => {
    if (currentPair < WORD_PAIRS.length - 1) {
      setCurrentPair(p => p + 1);
      setChain([]);
      setInput('');
    } else {
      completeGame();
    }
  };

  const completeGame = () => {
    const avgSpeed = connections > 0 ? totalTime / connections : 0;
    
    onComplete({
      score,
      accuracy: connections > 0 ? (connections / (connections + WORD_PAIRS.length)) * 100 : 0,
      speed: avgSpeed,
      connections,
      pattern: chain.length > 3 ? 'exploratory' : 'systematic',
      level: currentPair + 1,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitWord();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
          <BookOpen className="text-emerald-400" />
          <span className="font-bold text-white tracking-wide">BRIDGE {currentPair + 1}/{WORD_PAIRS.length}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full border border-yellow-500/30">
            <Zap size={18} />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <span className="inline-block px-6 py-2 bg-indigo-500/20 text-indigo-200 rounded-full text-sm font-bold tracking-widest uppercase border border-indigo-500/30 shadow-inner">
          Theme: {current.theme}
        </span>
      </div>

      <div className="bg-black/20 rounded-3xl p-8 mb-8 min-h-[250px] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-center gap-4 flex-wrap w-full z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-6 py-4 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl font-black text-2xl shadow-lg border border-white/20"
          >
            {current.start}
          </motion.div>

          <AnimatePresence>
            {chain.map((word, idx) => (
              <React.Fragment key={idx}>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-white/40 font-bold"
                >
                  →
                </motion.span>
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-md border border-white/10 ${
                    idx === chain.length - 1 && feedback === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : idx === chain.length - 1 && feedback === 'invalid'
                      ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : 'bg-indigo-500/20 text-indigo-200'
                  }`}
                >
                  {word}
                </motion.div>
              </React.Fragment>
            ))}
          </AnimatePresence>

          <span className="text-white/40 font-bold">→</span>
          
          <motion.div
            animate={{
              scale: chain[chain.length - 1]?.toLowerCase() === current.target.toLowerCase() ? [1, 1.2, 1] : 1,
            }}
            className={`px-6 py-4 rounded-2xl font-black text-2xl border-2 shadow-lg ${
              chain[chain.length - 1]?.toLowerCase() === current.target.toLowerCase()
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-white/20'
                : 'bg-black/40 text-white/40 border-dashed border-white/20'
            }`}
          >
            {current.target}
          </motion.div>
        </div>

        <p className="text-center text-white/50 text-sm mt-10 font-medium">
          Connect words by association. Longer chains earn more points!
        </p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter connecting word..."
          className="flex-1 p-5 bg-white/10 border-2 border-white/20 rounded-2xl focus:border-emerald-400 focus:bg-white/20 transition-all focus:outline-none text-white placeholder-white/40 font-medium text-lg"
        />
        <button
          onClick={submitWord}
          disabled={!input.trim()}
          className="px-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:hover:shadow-none transition-all active:scale-95"
        >
          Connect
        </button>
      </div>

      <div className="mt-8 text-center flex justify-between items-center px-4">
        <button
          onClick={nextLevel}
          className="text-sm font-bold tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors"
        >
          Skip bridge →
        </button>
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
