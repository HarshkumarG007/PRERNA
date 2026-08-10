import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Info, WifiOff } from 'lucide-react';
import { UnifiedProfile } from '../../store';
import { generateTeenInsight, InsightNarrativeResult } from '../../ai/insightNarrator';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const InsightNarrativeView: React.FC<{ profile: UnifiedProfile }> = ({ profile }) => {
  const [insight, setInsight] = useState<InsightNarrativeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCitation, setActiveCitation] = useState<string[] | null>(null);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    let isMounted = true;
    
    // If offline, just wait. We don't fetch.
    if (!isOnline) {
      return;
    }

    setIsLoading(true);
    
    generateTeenInsight(profile).then((res) => {
      if (isMounted) {
        setInsight(res);
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [profile, isOnline]);

  if (!isOnline && !insight) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50">
        <WifiOff className="text-slate-500 mb-4" size={32} />
        <h4 className="text-slate-300 font-bold mb-1">Waiting for Connection</h4>
        <p className="text-slate-500 font-medium text-sm text-center max-w-sm">
          PRERNA is in offline mode. We need a brief connection to prepare your AI insights.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50 animate-pulse">
        <Sparkles className="text-violet-400 mb-4 animate-spin-slow" size={32} />
        <p className="text-slate-400 font-medium text-sm tracking-wide">Synthesizing your traits...</p>
      </div>
    );
  }

  if (!insight || !insight.isSafeToDisplay || insight.sentences.length === 0) {
    return (
      <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-start gap-4">
        <Shield className="text-red-400 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-red-400 font-bold mb-2">Insight Generation Paused</h4>
          <p className="text-red-300/80 text-sm leading-relaxed">
            Our safety system blocked the AI summary because it could not be strictly verified against your calculated scores. We prioritize factual accuracy over generated text.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1c29] to-[#0f172a] rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Sparkles className="text-violet-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Your AI Summary</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
            <Shield size={14} />
            <span>Fact-Checked</span>
          </div>
        </div>

          {/* Narrative Sentences */}
          <div className="space-y-2 mb-8">
            {insight.sentences.map((s, idx) => (
              <motion.span
                key={idx}
                className="inline-block mr-2 mb-2 text-slate-300 leading-relaxed text-lg transition-colors cursor-help hover:text-white"
                onMouseEnter={() => setActiveCitation(s.citations)}
                onMouseLeave={() => setActiveCitation(null)}
                layout
              >
                <span className={activeCitation === s.citations ? "bg-violet-500/20 text-violet-100 rounded px-1" : ""}>
                  {s.text}
                </span>
              </motion.span>
            ))}
          </div>

          {/* Source Scores Panel */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Underlying Deterministic Scores</h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(profile.personality.bigFive).map(([trait, score]) => (
                <div key={trait} className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-400 capitalize mr-2">{trait}</span>
                  <span className="text-sm font-bold text-violet-400">{score as number}</span>
                </div>
              ))}
            </div>
          </div>

        <div className="h-16 flex items-center">
          {activeCitation ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10 w-full"
            >
              <Info className="text-violet-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Source Citation</p>
                <div className="flex flex-wrap gap-2">
                  {activeCitation.map((cite, i) => (
                    <span key={i} className="text-sm font-medium text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-md border border-violet-500/30">
                      {cite.replace('bigFive.', '')}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <p className="text-slate-500 text-sm italic">Hover over any sentence to see the trait scores it was derived from.</p>
          )}
        </div>
      </div>
    </div>
  );
};
