import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ShieldCheck, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useAppStore, Session } from '../../store';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { useI18n } from '../../engine/localization/i18n';

export const ActivityHistoryViewer: React.FC = () => {
  const sessions = useAppStore(state => state.sessions);
  const { language } = useI18n();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showDisclosureModal, setShowDisclosureModal] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  const getSessionLabel = (type: Session['type']) => {
    switch (type) {
      case 'life_quest': return 'Life Quest Story';
      case 'skill_arena': return 'Skill Arena Cognitive Trial';
      case 'mood_mirror': return 'Mood Mirror Check-in';
      case 'social_compass': return 'Social Compass Scenario';
      case 'ai_chat': return 'AI Mentor Reflection';
      default: return 'Self-Discovery Activity';
    }
  };

  const getBadgeColor = (type: Session['type']) => {
    switch (type) {
      case 'life_quest': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'skill_arena': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'mood_mirror': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'social_compass': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Activity History & Recorded Choices</h3>
            <p className="text-xs text-slate-400 font-medium">
              Transparent log of all assessment sessions and derived signals.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDisclosureModal('all')}
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <BookOpen size={14} /> Review Disclosures
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-slate-800">
          <p className="text-slate-400 text-sm font-medium">No recorded activities yet.</p>
          <p className="text-slate-500 text-xs mt-1">Play Life Quests or enter the Skill Arena to build your history!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isExpanded = expandedSessionId === s.id;
            const disclosureVer = (s.metadata?.disclosure_version as string) || '1.0';

            return (
              <div
                key={s.id}
                className="bg-black/30 border border-white/5 rounded-2xl p-4 transition-all hover:border-white/10"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(s.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getBadgeColor(s.type)}`}>
                      {getSessionLabel(s.type)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(s.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {s.score !== undefined && (
                      <span className="text-xs font-mono font-bold text-slate-200 bg-white/5 px-2.5 py-1 rounded-md">
                        Score: {Math.round(s.score)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <ShieldCheck size={12} /> v{disclosureVer}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-300 font-mono space-y-2 overflow-hidden"
                    >
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 overflow-x-auto max-h-48 custom-scrollbar">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                          Session Choices & Exported Data:
                        </span>
                        <pre className="text-[11px] text-slate-300">
                          {JSON.stringify(s.metadata || { score: s.score }, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclosures Review Modal */}
      <AnimatePresence>
        {showDisclosureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/20 rounded-3xl max-w-2xl w-full p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Activity Disclosures</h3>
                    <p className="text-xs text-slate-400">
                      DPDP Section 9(3) compliant notices shown before every activity.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDisclosureModal(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(CURRENT_DISCLOSURES).map(([key, item]) => (
                  <div key={key} className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Version {item.version} ({item.id})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {item.text[language as keyof typeof item.text] || item.text.en}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
