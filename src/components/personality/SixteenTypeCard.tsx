import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Compass, 
  ChevronRight, 
  BookOpen,
  Briefcase
} from 'lucide-react';
import { SixteenTypeResult, SIXTEEN_ROLES } from '../../engine/assessment/sixteenPersonalities';
import { SixteenTypesExplorerModal } from './SixteenTypesExplorerModal';

interface SixteenTypeCardProps {
  sixteenType: SixteenTypeResult;
  onExploreAll?: () => void;
}

export const SixteenTypeCard: React.FC<SixteenTypeCardProps> = ({ sixteenType }) => {
  const [showExplorer, setShowExplorer] = useState(false);

  const { code, fullCode, identity, definition, dichotomies } = sixteenType;
  const roleMeta = SIXTEEN_ROLES[definition.role];

  const spectrumItems = [
    dichotomies.energy,
    dichotomies.mind,
    dichotomies.nature,
    dichotomies.tactics,
    dichotomies.identity,
  ];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      {/* Ambient gradient glow in background */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: roleMeta.color }}
      />

      <div className="relative z-10 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-inner">
              {definition.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-2xl md:text-3xl tracking-tight text-slate-900">
                  {fullCode}
                </span>
                <span className="text-lg md:text-xl font-bold text-slate-700">
                  {definition.name}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {definition.hindiName}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: roleMeta.color }}>
                {roleMeta.name} ({roleMeta.hindiName}) • {identity} Identity
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplorer(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Compass size={14} className="text-indigo-600" />
            <span>Explore All 16 Types</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>

        {/* Tagline & summary */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <p className="text-xs italic font-medium text-slate-600 mb-1.5">
            "{definition.tagline}"
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {definition.summary}
          </p>
        </div>

        {/* 5-Dimension Spectrum Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-500" /> Psychological Spectrum Breakdown
            </h4>
            <span className="text-[11px] font-medium text-slate-400">Derived from IPIP Big Five</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {spectrumItems.map((item) => {
              const isDominantA = item.dominant === item.codeA;
              return (
                <div 
                  key={item.dimension}
                  className="bg-slate-50/50 p-3 rounded-2xl border border-slate-200/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={isDominantA ? 'text-indigo-600 font-black' : 'text-slate-400'}>
                      {item.traitA} ({item.pctA}%)
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </span>
                    <span className={!isDominantA ? 'text-indigo-600 font-black' : 'text-slate-400'}>
                      ({item.pctB}%) {item.traitB}
                    </span>
                  </div>

                  {/* Dual-direction visual bar */}
                  <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isDominantA ? 'bg-indigo-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${item.pctA}%` }}
                    />
                    <div 
                      className={`h-full transition-all duration-500 ${
                        !isDominantA ? 'bg-indigo-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${item.pctB}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Highlights: Study Strategy & Career Direction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" /> Ideal Study Technique
            </h5>
            <p className="text-xs text-indigo-900/80 font-medium leading-relaxed">
              {definition.studyTips[0]}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Briefcase size={14} className="text-emerald-600" /> Emerging Career Vectors
            </h5>
            <p className="text-xs text-emerald-900/80 font-medium leading-relaxed">
              {definition.careerDirections.slice(0, 3).join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* 16 Personalities Modal */}
      <AnimatePresence>
        {showExplorer && (
          <SixteenTypesExplorerModal
            userType={code}
            onClose={() => setShowExplorer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
