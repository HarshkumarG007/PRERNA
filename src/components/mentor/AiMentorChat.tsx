import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';
import { sendMessageToLLM, ChatMessage } from '../../ai/llmClient';
import { useI18n } from '../../engine/localization/i18n';
import { Mic, Square, Sparkles, Send, Bot, User as UserIcon, AlertTriangle, ArrowRight } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';



interface AiMentorChatProps {
  userId: string;
}

const QUICK_ACTIONS = [
  "I'm feeling overwhelmed today.",
  "Can you help me explore my career options?",
  "I had an argument with a friend.",
  "How can I improve my focus?",
];

export const AiMentorChat: React.FC<AiMentorChatProps> = ({ userId }) => {
  const { language } = useI18n();
  // const { profile } = useAppStore(); // Profile not needed in mock mode
  


  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const disclosure = CURRENT_DISCLOSURES.ai_mentor;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Cleanup LLM when leaving the chat interface
    return () => {
      console.log('Unloading AI Mentor model from VRAM...');
      invoke('unload_model').catch(err => console.error('Failed to unload model', err));
    };
  }, []);

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId,
        sessionType: 'ai_mentor',
        disclosureShownId: disclosure.id,
      };
      
      validateSessionCreation(config);
      setIsSessionActive(true);
      
      setMessages([
        { role: 'assistant', content: 'Hi there! I am PRERNA’s AI Mentor. I’m here to help you explore your thoughts, feelings, and future safely. What’s on your mind today?' }
      ]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      // Pass the last 5 messages as context to prevent context window overflow
      // Filter out system messages or introductory bot greetings if needed, but for now we pass the raw history
      const recentContext = messages.slice(-5);
      
      const chatResponse = await sendMessageToLLM(userMsg.content, recentContext);
      const aiMsg: ChatMessage = { role: 'assistant', content: chatResponse.response };
      setMessages([...newHistory, aiMsg]);
    } catch (err) {
      console.error("Failed to get response from AI Mentor", err);
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, my neural pathways are a bit congested right now. Could we try again later?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInput("I've been feeling a bit overwhelmed lately.");
      }, 3000);
    }
  };

  if (!disclosureAccepted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 relative overflow-hidden bg-[#020617] rounded-3xl shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Bot size={40} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Meet Your AI Mentor</h2>
            <p className="text-cyan-200 mt-2 font-medium">A safe, private space to explore your thoughts.</p>
          </div>

          <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm text-left backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-cyan-400" />
              <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Before we chat</p>
            </div>
            <p className="text-white/80 leading-relaxed font-medium">{disclosure.text[language as keyof typeof disclosure.text]}</p>
          </div>

          <button
            onClick={() => setDisclosureAccepted(true)}
            className="w-full py-4 rounded-xl shadow-lg shadow-cyan-500/20 text-white font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            I Understand, Let's Chat
          </button>
        </div>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartSession}
          className="py-5 px-10 rounded-full shadow-2xl shadow-violet-500/30 text-xl font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border border-white/20"
        >
          Initialize Neural Link ✨
        </motion.button>
        {error && (
          <p className="text-red-500 text-sm font-bold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl inline-block backdrop-blur-md">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-5 bg-white/5 border-b border-white/10 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#020617]"></div>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-wide">PRERNA Mentor</h2>
            <p className="text-xs text-emerald-400 font-medium tracking-widest uppercase">Local AI Active</p>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="relative z-10 flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mb-1">
                    <Sparkles size={14} className="text-violet-400" />
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl shadow-sm backdrop-blur-md ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-sm' 
                    : 'bg-white/10 border border-white/10 text-slate-100 rounded-bl-sm markdown-body'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mb-1">
                    <UserIcon size={14} className="text-white/70" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start items-end gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mb-1">
              <Sparkles size={14} className="text-violet-400" />
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-sm backdrop-blur-md flex gap-1.5 items-center h-12">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-violet-400" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-violet-400" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-violet-400" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (only show if history is small) */}
      {messages.length === 1 && !isTyping && (
        <div className="relative z-10 px-6 pb-4 flex flex-wrap gap-2 justify-center">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSend(action)}
              className="text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
            >
              {action}
              <ArrowRight size={12} className="opacity-50" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Recording Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 bg-white/5 border-t border-white/10 p-6 flex flex-col items-center justify-center backdrop-blur-xl"
          >
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-violet-500 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-2 bg-fuchsia-500 rounded-full"
              />
              <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Mic size={32} className="text-white" />
              </div>
            </div>
            <p className="font-bold text-white text-lg tracking-wide mb-1">Listening...</p>
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Local Processing (Whisper)</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={onSubmit} className="relative z-10 p-4 bg-[#020617]/80 backdrop-blur-xl border-t border-white/10 flex items-end gap-3">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
          }`}
          title={isRecording ? "Stop recording" : "Start voice input"}
        >
          {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 text-white rounded-2xl px-5 py-4 focus:outline-none transition-colors placeholder-white/30"
            disabled={isRecording}
          />
        </div>
        
        <button
          type="submit"
          disabled={isTyping || !input.trim() || isRecording}
          className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
