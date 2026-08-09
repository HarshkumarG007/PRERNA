import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';

import { useI18n } from '../../engine/localization/i18n';
import { useAppStore } from '../../store';
import { calculateOptimalDifficulty } from '../../assessment/skills/engine';
import { WordBridge } from '../skills/WordBridge';

export interface SkillArenaProps {
  userId?: string;
}

export const SkillArena: React.FC<SkillArenaProps> = ({ userId }) => {
  const { language } = useI18n();
  const { user, recordSession } = useAppStore();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const disclosure = CURRENT_DISCLOSURES.skill_arena;

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId: userId || 'guest',
        sessionType: 'skill_arena',
        disclosureShownId: disclosure.id,
      };
      
      // Enforces Global Rule 0.1-2
      validateSessionCreation(config);
      
      setIsSessionActive(true);
    } catch (err: any) {
      setSessionError(err.message);
    }
  };

  if (results) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-emerald-500/30 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
        <h2 className="text-3xl font-black text-white tracking-tight mb-4 relative z-10">Arena Cleared!</h2>
        <p className="text-slate-300 font-medium mb-6 relative z-10">Here's how your skills map out today:</p>
        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-8 text-left relative z-10">
          <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>
        </div>
        <button onClick={() => setResults(null)} className="relative z-10 w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
          Re-enter Arena
        </button>
      </div>
    );
  }

  if (!disclosureAccepted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 relative overflow-hidden bg-[#020617] rounded-3xl shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Skill Arena</h2>
            <p className="text-emerald-200 mt-2 font-medium">Cognitive & linguistic processing evaluation.</p>
          </div>

          <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm text-left backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Before you play</p>
            </div>
            <p className="text-white/80 leading-relaxed font-medium">{disclosure.text[language as keyof typeof disclosure.text]}</p>
          </div>

          <button
            onClick={() => setDisclosureAccepted(true)}
            className="w-full py-4 rounded-xl shadow-lg shadow-emerald-500/20 text-white font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            I Understand, Let's Play
          </button>
        </div>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <button
          onClick={handleStartSession}
          className="relative z-10 py-5 px-12 rounded-[2rem] shadow-2xl shadow-emerald-500/20 text-2xl font-black text-white bg-gradient-to-r from-emerald-400 to-cyan-500 hover:scale-105 transition-all border border-white/20 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10">Enter the Arena</span>
        </button>
        {sessionError && (
          <p className="relative z-10 text-rose-400 text-sm font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl max-w-sm mx-auto">
            {sessionError}
          </p>
        )}
      </div>
    );
  }

  const difficulty = calculateOptimalDifficulty((user as any)?.bigFive);

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <div className="bg-[#0f172a]/80 backdrop-blur-xl text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-sm">Adaptive Pacing Active: Engine set difficulty to <strong className="font-black text-emerald-300 uppercase tracking-widest">{difficulty}</strong>.</span>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <WordBridge 
          difficulty={difficulty} 
          onComplete={async (res) => {
            setResults(res as any);
            setIsSessionActive(false);
            await recordSession({
              type: 'skill_arena',
              completedAt: new Date().toISOString(),
              score: (res as any).score || 0,
              metadata: res as Record<string, unknown>
            });
          }} 
        />
      </div>
    </div>
  );
};
