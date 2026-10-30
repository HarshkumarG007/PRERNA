import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  Users, 
  GraduationCap, 
  Sparkles, 
  Trash2, 
  Lock, 
  Compass 
} from 'lucide-react';
import { usePartnerStore } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';

export const PartnerAiCompanion: React.FC = () => {
  const { chatHistory, sendCompanionMessage, clearCompanionChat } = usePartnerStore();
  const [activeMode, setActiveMode] = useState<'personal' | 'shared' | 'learning'>('personal');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const filteredMessages = chatHistory.filter((m) => m.mode === activeMode);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    somaticAudio.playSoftChime();
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      sendCompanionMessage(text.trim(), activeMode);
      setIsTyping(false);
      somaticAudio.playStarBeaconChime();
    }, 800);
  };

  const PROMPT_SUGGESTIONS = {
    personal: [
      'I felt a little hurt today, how can I express it gently?',
      'How can I ask for space without making my partner feel rejected?',
      'Help me understand why I get defensive during conflict.',
    ],
    shared: [
      'Suggest a surprise date for this weekend tailored to our love languages.',
      'We had a disagreement about timetables. Help us reframe it with NVC.',
      'Give us 3 deep questions to explore over tea tonight.',
    ],
    learning: [
      'What are Gottman’s 4 Horsemen and their healthy antidotes?',
      'How does the 4-step Nonviolent Communication (NVC) model work?',
      'Explain anxious vs avoidant attachment with kindness.',
    ],
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[85vh] bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden font-sans">
      
      {/* Top Companion Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-rose-50/80 via-white to-amber-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Preeti • प्रेरणा साथी
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Relationship AI Companion
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Empathetic, zero-judgment guidance anchored in ancient wisdom & relational psychology
            </p>
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={() => clearCompanionChat(activeMode)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
          title="Clear current mode conversation"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline text-[11px] font-bold">Clear</span>
        </button>
      </div>

      {/* 3-Mode Selector Tabs */}
      <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveMode('personal')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'personal'
              ? 'bg-white text-rose-900 shadow-xs border border-rose-200 scale-102'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={14} className={activeMode === 'personal' ? 'text-rose-600' : ''} />
          <span>Mode 1: My Personal Reflection</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">Private</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('shared')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'shared'
              ? 'bg-white text-rose-900 shadow-xs border border-rose-200 scale-102'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} className={activeMode === 'shared' ? 'text-rose-600' : ''} />
          <span>Mode 2: Our Shared Sanctuary</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">Joint</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('learning')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'learning'
              ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200 scale-102'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={14} className={activeMode === 'learning' ? 'text-indigo-600' : ''} />
          <span>Mode 3: Wisdom & Masterclass</span>
        </button>
      </div>

      {/* Mode Isolation Notice Banner */}
      <div className="px-6 py-2 bg-slate-100/60 border-b border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          {activeMode === 'personal' ? (
            <>
              <Lock size={12} className="text-rose-600" />
              <span>Strict Privacy: These reflections are visible ONLY to you. Your partner cannot view them.</span>
            </>
          ) : activeMode === 'shared' ? (
            <>
              <Users size={12} className="text-emerald-600" />
              <span>Shared Space: Safe ideas, reframing, and date suggestions for both of you.</span>
            </>
          ) : (
            <>
              <Compass size={12} className="text-indigo-600" />
              <span>Masterclass: Educational frameworks on NVC, attachment styles, and relationship longevity.</span>
            </>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">100% On-Device</span>
      </div>

      {/* Message Stream */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {filteredMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xs'
                }`}>
                  {isUser ? 'You' : '❤️'}
                </div>

                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs rounded-tl-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[9px] mt-1.5 opacity-60 text-right ${isUser ? 'text-slate-300' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
            <span>Preeti is reflecting...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="px-6 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold whitespace-nowrap text-[10px] uppercase">Suggestions:</span>
        {PROMPT_SUGGESTIONS[activeMode].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-600 font-medium transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 border border-slate-200/60"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            activeMode === 'personal'
              ? 'Share a private relationship reflection, fear, or vulnerability...'
              : activeMode === 'shared'
              ? 'Ask for a joint date idea, constructive reframing, or appreciation card...'
              : 'Ask about Gottman antidotes, active listening, or attachment styles...'
          }
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="p-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>

    </div>
  );
};
