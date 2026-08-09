import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: string;
}

interface ChatResponse {
  response: string;
  conversation_id: string;
  sentiment: string;
  suggested_actions: string[];
}

export const MentorChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm PRERNA, your AI companion. I'm here to chat, help you figure things out, or just listen. What's on your mind? 🌟",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await invoke<ChatResponse>('chat_with_mentor', {
        request: {
          message: userMessage.content,
        },
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        sentiment: response.sentiment,
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestedActions(response.suggested_actions);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble thinking right now. You might need to download my AI brain first! 🙏",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
          <Bot size={28} />
        </div>
        <div>
          <h3 className="font-black text-lg">PRERNA Mentor</h3>
          <p className="text-xs text-white/80 font-medium tracking-wide">Your private local guide</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-xs text-white/90 font-bold uppercase tracking-widest">Local</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                }`}
              >
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div
                className={`max-w-[75%] p-4 rounded-3xl shadow-sm border ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                    : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                
                {message.sentiment === 'negative_concern' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="font-medium">I'm here for you. If things feel too heavy, please consider talking to someone who can help.</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-3xl rounded-tl-none">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="w-2.5 h-2.5 bg-indigo-300 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2.5 h-2.5 bg-purple-300 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2.5 h-2.5 bg-pink-300 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      {suggestedActions.length > 0 && (
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setInput(action)}
                className="flex-shrink-0 px-4 py-2 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-5 bg-white border-t border-slate-200">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-4 bg-slate-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-sm font-medium border border-transparent focus:border-indigo-400"
            rows={1}
            style={{ minHeight: '60px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-center font-bold uppercase tracking-widest">
          🔒 Processed locally. No data leaves your device.
        </p>
      </div>
    </div>
  );
};
