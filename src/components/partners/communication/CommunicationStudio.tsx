import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquareHeart, 
  Sparkles, 
  Heart, 
  Clock, 
  Send, 
  Flame 
} from 'lucide-react';
import { usePartnerStore } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';

export const CommunicationStudio: React.FC = () => {
  const { conversationPrompts, answerPrompt } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<'daily_cards' | 'nvc_reframe' | 'gratitude_jar' | 'listening_drill'>('daily_cards');

  // Daily cards state
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // NVC Re-framer state
  const [rawImpulsiveText, setRawImpulsiveText] = useState('');
  const [reframedNvc, setReframedNvc] = useState<string | null>(null);

  // Gratitude Jar state
  const [gratitudes, setGratitudes] = useState<string[]>([
    'Loved how gently you greeted me this morning.',
    'Thank you for holding space when I was stressed about my project.',
  ]);
  const [newGratitude, setNewGratitude] = useState('');

  // Active Listening Drill state
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes

  const activePrompt = conversationPrompts[selectedPromptIndex] || conversationPrompts[0];

  const handleSaveAnswer = () => {
    if (!answerText.trim() || !activePrompt) return;
    somaticAudio.playStarBeaconChime();
    answerPrompt(activePrompt.id, answerText.trim());
    setAnswerText('');
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleReframing = () => {
    if (!rawImpulsiveText.trim()) return;
    somaticAudio.playSoftChime();

    const lower = rawImpulsiveText.toLowerCase();
    let reframe = '';

    if (lower.includes('never') || lower.includes('always')) {
      reframe = `I notice that when plans change, I feel anxious and disconnected because consistency and predictability are important to me. Would you be open to giving me a quick heads-up next time?`;
    } else if (lower.includes('listen') || lower.includes('phone') || lower.includes('busy')) {
      reframe = `I really treasure our time together, and when phones are out during dinner, I feel a bit lonely. Could we do 30 minutes of uninterrupted screen-free time tonight?`;
    } else if (lower.includes('chore') || lower.includes('clean') || lower.includes('mess')) {
      reframe = `I feel overwhelmed by the housework right now and I need support to keep our sanctuary calm. Could we divide these tasks together for 15 minutes?`;
    } else {
      reframe = `When this happened, I felt vulnerable because my need for emotional reassurance was heightened. I love you and would appreciate holding space for a quiet conversation about this.`;
    }

    setReframedNvc(reframe);
  };

  const handleAddGratitude = () => {
    if (!newGratitude.trim()) return;
    somaticAudio.playStarBeaconChime();
    setGratitudes([newGratitude.trim(), ...gratitudes]);
    setNewGratitude('');
  };

  const toggleListeningTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      somaticAudio.playSoftChime();
      setSecondsLeft(180);
      setTimerRunning(true);
    }
  };

  React.useEffect(() => {
    let interval: any;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            somaticAudio.playStarBeaconChime();
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Studio Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 border border-rose-200/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            <MessageSquareHeart size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Couple Communication Studio
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Speak with Heart, Listen with Soul
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mt-0.5">
              Tools to transform misunderstandings into intimacy, practice non-violent communication, and share daily gratitude.
            </p>
          </div>
        </div>

        {/* Sub-tab Switchers */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { id: 'daily_cards', label: 'Heart Cards', icon: Heart },
            { id: 'nvc_reframe', label: 'NVC Re-framer', icon: Sparkles },
            { id: 'gratitude_jar', label: 'Gratitude Jar', icon: Flame },
            { id: 'listening_drill', label: '3-Min Listening', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Daily Heart Cards */}
      {activeTab === 'daily_cards' && activePrompt && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Visualizer */}
          <div className="md:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Category: {activePrompt.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Card {selectedPromptIndex + 1} of {conversationPrompts.length}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 border border-rose-100">
              <p className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                "{activePrompt.question}"
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Your Heart’s Reflection:
              </label>
              <textarea
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your genuine, unhurried reflection..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {showSavedFeedback ? '✨ Reflection saved to your shared sanctuary!' : 'Take all the time you need.'}
                </span>

                <button
                  onClick={handleSaveAnswer}
                  disabled={!answerText.trim()}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} /> Save Reflection
                </button>
              </div>
            </div>

            {/* Existing Answer Display */}
            {activePrompt.myAnswer && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Your Stored Reflection:</span>
                <p className="text-slate-600 italic">"{activePrompt.myAnswer}"</p>
              </div>
            )}
          </div>

          {/* Card Carousel Navigation */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              All Available Cards
            </h4>
            <div className="space-y-2">
              {conversationPrompts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    somaticAudio.playSoftChime();
                    setSelectedPromptIndex(idx);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPromptIndex === idx
                      ? 'bg-white border-rose-300 shadow-xs'
                      : 'bg-white/60 border-slate-200/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span className="uppercase">{p.category}</span>
                    {p.myAnswer && <span className="text-emerald-600">✓ Answered</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-2">{p.question}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Nonviolent Communication (NVC) Re-framer */}
      {activeTab === 'nvc_reframe' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              Compassionate NVC Re-framer (अहिंसक सम्प्रेषण)
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              When triggered, we often speak in generalizations ("You always ignore me"). Type your unfiltered frustration below, and let the assistant reframe it using Marshall Rosenberg's 4-step framework: <em>Observation → Feeling → Need → Gentle Request</em>.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              What do you want to say right now? (Raw & unfiltered):
            </label>
            <textarea
              rows={3}
              value={rawImpulsiveText}
              onChange={(e) => setRawImpulsiveText(e.target.value)}
              placeholder="e.g., You are always on your phone and never make time for me!"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              onClick={handleReframing}
              disabled={!rawImpulsiveText.trim()}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} /> Reframe with Compassion
            </button>
          </div>

          {reframedNvc && (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200/80 space-y-3 animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Reframed Compassionate Message:
              </span>
              <p className="text-sm font-semibold text-emerald-950 italic leading-relaxed">
                "{reframedNvc}"
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reframedNvc);
                    somaticAudio.playSoftChime();
                    alert('Copied reframed message to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Copy to Share
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Gratitude Jar */}
      {activeTab === 'gratitude_jar' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              Shared Gratitude & Appreciation Jar 🍯
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Research shows that couples who verbalize 5 positive appreciations for every 1 critique thrive with lifelong stability and joy.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
              placeholder="What made you appreciate your partner today?"
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              onClick={handleAddGratitude}
              disabled={!newGratitude.trim()}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer flex-shrink-0"
            >
              Drop in Jar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {gratitudes.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                <span className="text-[10px] text-amber-700 font-mono font-bold block">✨ Gratitude Note</span>
                <p className="font-medium italic leading-relaxed">"{item}"</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 4: 3-Minute Active Listening Drill */}
      {activeTab === 'listening_drill' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              3-Minute Sacred Listening Practice (श्रोता योग)
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Rules: One person speaks for 3 minutes without interruption, advice, or debate. The listener simply maintains warm eye contact and breathes. When the bell sounds, the listener summarizes what they felt, not to argue, but to validate.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <div className="w-32 h-32 rounded-full border-4 border-rose-500 flex items-center justify-center text-3xl font-black font-mono text-slate-900 shadow-inner">
              {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
            </div>

            <button
              onClick={toggleListeningTimer}
              className={`px-8 py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                timerRunning
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {timerRunning ? 'Pause Drill' : secondsLeft === 0 ? 'Restart Drill' : 'Start 3-Minute Listening'}
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
