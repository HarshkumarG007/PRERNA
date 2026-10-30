import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  Heart, 
  Users, 
  CheckCircle2, 
  Search,
  Compass
} from 'lucide-react';
import { 
  SixteenTypeCode, 
  SixteenRole, 
  SIXTEEN_ROLES, 
  SIXTEEN_TYPE_DEFINITIONS, 
  SixteenTypeDefinition 
} from '../../engine/assessment/sixteenPersonalities';

interface SixteenTypesExplorerModalProps {
  userType?: SixteenTypeCode;
  onClose: () => void;
}

export const SixteenTypesExplorerModal: React.FC<SixteenTypesExplorerModalProps> = ({ 
  userType, 
  onClose 
}) => {
  const [activeRole, setActiveRole] = useState<SixteenRole | 'all'>('all');
  const [selectedType, setSelectedType] = useState<SixteenTypeDefinition>(
    userType ? SIXTEEN_TYPE_DEFINITIONS[userType] : SIXTEEN_TYPE_DEFINITIONS.INFJ
  );
  const [searchQuery, setSearchQuery] = useState('');

  const allTypes = Object.values(SIXTEEN_TYPE_DEFINITIONS);

  const filteredTypes = allTypes.filter(t => {
    const matchesRole = activeRole === 'all' || t.role === activeRole;
    const matchesSearch = searchQuery === '' || 
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hindiName.includes(searchQuery) ||
      t.traits.some(tr => tr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 my-auto"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-purple-50/70 to-pink-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Compass size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">The 16 Personality Spectrum</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  16 व्यक्तित्व प्रकार
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Explore your natural psychological architecture, learning style, and life orientation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Role Tabs */}
          <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
            <button
              onClick={() => setActiveRole('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All 16 Types
            </button>
            {(Object.keys(SIXTEEN_ROLES) as SixteenRole[]).map(roleKey => {
              const roleMeta = SIXTEEN_ROLES[roleKey];
              const isActive = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => setActiveRole(roleKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  style={{
                    backgroundColor: isActive ? roleMeta.color : undefined
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? '#fff' : roleMeta.color }} />
                  {roleMeta.name} ({roleMeta.hindiName})
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, trait, or title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Modal Body: Split view (List on left, Detail on right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Grid: Types Carousel/List */}
          <div className="md:col-span-5 border-r border-slate-100 overflow-y-auto p-4 space-y-2.5 max-h-[55vh] md:max-h-full">
            {filteredTypes.map(t => {
              const isSelected = selectedType.code === t.code;
              const isUserCurrent = userType === t.code;
              const roleMeta = SIXTEEN_ROLES[t.role];

              return (
                <div
                  key={t.code}
                  onClick={() => setSelectedType(t)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-md ring-1 ring-indigo-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                        {t.avatarEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                            {t.code}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            • {t.name}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">
                          {t.hindiName} • <span style={{ color: roleMeta.color }} className="font-semibold">{roleMeta.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isUserCurrent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 size={10} /> You
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400">
                        {t.traits[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-6 max-h-[55vh] md:max-h-full bg-slate-50/50">
            {/* Main Badge */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                    {selectedType.avatarEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedType.code}: {selectedType.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedType.hindiName}
                      </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: SIXTEEN_ROLES[selectedType.role].color }}>
                      {SIXTEEN_ROLES[selectedType.role].name} • {SIXTEEN_ROLES[selectedType.role].hindiName}
                    </p>
                  </div>
                </div>

                {userType === selectedType.code && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-sm">
                    <Sparkles size={12} className="text-emerald-500" /> Your Archetype
                  </span>
                )}
              </div>

              <p className="text-sm italic font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                "{selectedType.tagline}"
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedType.summary}
              </p>

              {/* Traits Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedType.traits.map(trait => (
                  <span key={trait} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    #{trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-500" /> Core Superpowers
                </h4>
                <ul className="space-y-1.5">
                  {selectedType.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Compass size={14} className="text-amber-500" /> Gentle Growth Edges
                </h4>
                <ul className="space-y-1.5">
                  {selectedType.growthAreas.map((gr, idx) => (
                    <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{gr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Study Tips & Learning Style */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" /> Ideal Study & Exam Strategy
              </h4>
              <div className="space-y-1.5">
                {selectedType.studyTips.map((tip, idx) => (
                  <p key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">✓</span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Careers Alignment */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Briefcase size={14} className="text-indigo-600" /> Natural Career Environments
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedType.careerDirections.map((career, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {career}
                  </span>
                ))}
              </div>
            </div>

            {/* Parent Communication Advice & Famous Inspirations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-500" /> For Parents & Mentors
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedType.parentCommunicationTip}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users size={14} className="text-slate-500" /> Real-World Inspirations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedType.famousFigures.map((fig, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {fig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
