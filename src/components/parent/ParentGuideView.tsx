import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Info } from 'lucide-react';
import { ParentSafeProfile } from '../../parent/permissions';
import { generateParentGuide, ParentGuideResult } from '../../ai/parentGuideNarrator';

export const ParentGuideView: React.FC<{ safeProfile: ParentSafeProfile }> = ({ safeProfile }) => {
  const [guide, setGuide] = useState<ParentGuideResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCitation, setActiveCitation] = useState<string[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    generateParentGuide(safeProfile).then((res) => {
      if (isMounted) {
        setGuide(res);
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [safeProfile]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-slate-200 animate-pulse">
        <Sparkles className="text-violet-500 mb-4 animate-spin-slow" size={32} />
        <p className="text-slate-500 font-medium text-sm tracking-wide">Generating safe insights...</p>
      </div>
    );
  }

  if (!guide || !guide.isSafeToDisplay || guide.sentences.length === 0) {
    return (
      <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
        <Shield className="text-red-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-red-600 font-bold mb-2">Insight Generation Paused</h4>
          <p className="text-red-500/80 text-sm leading-relaxed">
            Our safety system blocked the AI summary. We strictly limit insights to verified, safe personality dimensions to protect your teen's privacy and ensure accuracy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center border border-violet-200">
              <Sparkles className="text-violet-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">AI Parenting Guide</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Shield size={14} />
            <span>Privacy-Filtered & Fact-Checked</span>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          {guide.sentences.map((s, idx) => (
            <motion.span
              key={idx}
              className="inline-block mr-2 mb-2 text-slate-600 leading-relaxed text-lg transition-colors cursor-help hover:text-slate-900"
              onMouseEnter={() => setActiveCitation(s.citations)}
              onMouseLeave={() => setActiveCitation(null)}
              layout
            >
              <span className={activeCitation === s.citations ? "bg-violet-100 text-violet-800 rounded px-1" : ""}>
                {s.text}
              </span>
            </motion.span>
          ))}
        </div>

        <div className="h-16 flex items-center">
          {activeCitation ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100 w-full"
            >
              <Info className="text-violet-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Derived From</p>
                <div className="flex flex-wrap gap-2">
                  {activeCitation.map((cite, i) => (
                    <span key={i} className="text-sm font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-md border border-violet-200">
                      {cite.replace('bigFive.', '')}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <p className="text-slate-400 text-sm italic">Hover over any sentence to see which of your teen's traits it was derived from.</p>
          )}
        </div>
      </div>
    </div>
  );
};
