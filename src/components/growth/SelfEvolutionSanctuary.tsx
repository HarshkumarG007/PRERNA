import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Flame, 
  Filter, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  TrendingUp, 
  Brain, 
  Layers,
  ChevronLeft
} from 'lucide-react';
import { 
  useAppStore, 
  useUser, 
  useProfile, 
  useJournalEntries, 
  useCompletedMitigations 
} from '../../store';
import { 
  generateSelfImageComparison, 
  MITIGATION_STRATEGIES, 
  MitigationStrategy,
  GrowthJournalEntry 
} from '../../engine/growth/selfEvolutionEngine';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';

interface SelfEvolutionSanctuaryProps {
  initialTab?: 'mirror' | 'journal' | 'mitigations';
  onNavigateHome?: () => void;
}

const COMMON_TAGS = [
  'Focus', 
  'Procrastination', 
  'Courage', 
  'Perfectionism', 
  'Boundaries', 
  'Exams', 
  'Friendship', 
  'Self-Talk', 
  'Creativity', 
  'Calm'
];

const MOOD_EMOJIS = [
  { rating: 1, emoji: '🌧️', label: 'Heavy' },
  { rating: 2, emoji: '⛅', label: 'Uneasy' },
  { rating: 3, emoji: '🌱', label: 'Grounded' },
  { rating: 4, emoji: '☀️', label: 'Energetic' },
  { rating: 5, emoji: '✨', label: 'Flourishing' },
];

export const SelfEvolutionSanctuary: React.FC<SelfEvolutionSanctuaryProps> = ({
  initialTab = 'mirror',
  onNavigateHome
}) => {
  const navigate = useNavigate();
  const handleBack = onNavigateHome || (() => navigate('/'));
  const user = useUser();
  const profile = useProfile();
  const journalEntries = useJournalEntries();
  const completedMitigations = useCompletedMitigations();
  const { addJournalEntry, deleteJournalEntry, toggleMitigation } = useAppStore();

  const [activeTab, setActiveTab] = useState<'mirror' | 'journal' | 'mitigations'>(initialTab);
  
  // Strategy filter
  const [strategyCategory, setStrategyCategory] = useState<string>('all');

  // Journal form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [entryType, setEntryType] = useState<GrowthJournalEntry['type']>('strength');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryReflection, setEntryReflection] = useState('');
  const [entrySelectedTags, setEntrySelectedTags] = useState<string[]>([]);
  const [entryCustomTag, setEntryCustomTag] = useState('');
  const [entryMitigation, setEntryMitigation] = useState<string>('');
  const [entryMood, setEntryMood] = useState<number>(4);
  const [journalFilter, setJournalFilter] = useState<'all' | 'strength' | 'growth_edge' | 'reflection'>('all');

  // Derive 16-type
  const sixteenType = useMemo(() => {
    if (profile?.sixteenType) return profile.sixteenType;
    if (profile?.personality?.bigFive) {
      try {
        return deriveSixteenType(profile.personality.bigFive);
      } catch {
        return null;
      }
    }
    return null;
  }, [profile]);

  // Derive personalized Self-Image comparison
  const comparison = useMemo(() => {
    return generateSelfImageComparison(sixteenType, user?.name);
  }, [sixteenType, user?.name]);

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    if (strategyCategory === 'all') return MITIGATION_STRATEGIES;
    return MITIGATION_STRATEGIES.filter(s => s.category === strategyCategory);
  }, [strategyCategory]);

  // Filtered journal entries
  const filteredEntries = useMemo(() => {
    if (journalFilter === 'all') return journalEntries;
    return journalEntries.filter(e => e.type === journalFilter);
  }, [journalEntries, journalFilter]);

  // Journal statistics
  const journalStats = useMemo(() => {
    const total = journalEntries.length;
    const strengths = journalEntries.filter(e => e.type === 'strength').length;
    const growthEdges = journalEntries.filter(e => e.type === 'growth_edge').length;
    const totalMitigationsPracticed = Object.values(completedMitigations).reduce((a, b) => a + b, 0);
    return { total, strengths, growthEdges, totalMitigationsPracticed };
  }, [journalEntries, completedMitigations]);

  // Handle opening form with a specific mitigation strategy pre-filled
  const handleReflectWithStrategy = (strategy: MitigationStrategy) => {
    setEntryType('growth_edge');
    setEntryMitigation(strategy.id);
    setEntryTitle(`Reflecting on: ${strategy.title}`);
    setEntryReflection(`Today I noticed friction around ${strategy.targetFriction.toLowerCase()}. I applied the "${strategy.title}" (${strategy.quickMantra}). Here is what I observed...`);
    setActiveTab('journal');
    setShowAddForm(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryReflection.trim()) return;

    addJournalEntry({
      type: entryType,
      title: entryTitle.trim(),
      reflection: entryReflection.trim(),
      tags: entrySelectedTags,
      mitigationUsed: entryMitigation || undefined,
      moodRating: entryMood
    });

    // Reset form
    setEntryTitle('');
    setEntryReflection('');
    setEntrySelectedTags([]);
    setEntryMitigation('');
    setEntryMood(4);
    setShowAddForm(false);
  };

  const toggleTag = (tag: string) => {
    setEntrySelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = entryCustomTag.trim();
    if (trimmed && !entrySelectedTags.includes(trimmed)) {
      setEntrySelectedTags(prev => [...prev, trimmed]);
      setEntryCustomTag('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden py-12 px-6 md:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Back to Sanctuary</span>
            </button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/30">
                <Sparkles size={13} className="text-indigo-400" />
                <span>Self-Evolution Sanctuary • Higgins' Actual vs Evolved Self</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                Your Evolving Self
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                Explore the bridge between where you are today and your highest potential. Turn natural friction into strengths with gentle evidence-based micro-strategies.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-6 self-start md:self-auto">
              <div>
                <div className="text-2xl font-black text-amber-300">{journalStats.total}</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Reflections</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-black text-emerald-300">{journalStats.totalMitigationsPracticed}</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Tools Used</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-black text-indigo-300">
                  {sixteenType?.code || 'INFJ'}
                </div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Archetype</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-white/10 pb-1">
            <button
              onClick={() => setActiveTab('mirror')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'mirror'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass size={16} />
              <span>The Mirror (Current vs Evolved)</span>
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'journal'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen size={16} />
              <span>Strengths & Growth Journal</span>
              {journalEntries.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold">
                  {journalEntries.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('mitigations')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'mitigations'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap size={16} />
              <span>Evolution Toolkit (Strategies)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: THE MIRROR (CURRENT VS EVOLVED SELF) */}
        {/* ========================================================================= */}
        {activeTab === 'mirror' && (
          <div className="space-y-10 animate-fade-in-up">
            {/* Philosophical Framing Banner */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Self-Discrepancy & Growth Psychology
                  </h3>
                  <p className="text-slate-600 text-xs md:text-sm mt-0.5 max-w-3xl leading-relaxed">
                    Growth is not about fixing something "broken"; it is about unlocking the natural potential already woven into your personality. Below is your grounded foundation today and the self-actualized vision you are growing into.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('mitigations')}
                className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm flex-shrink-0"
              >
                <span>View Actionable Toolkit</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Side-by-Side Cards: Current vs Improvised Self */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* CURRENT SELF CARD */}
              <div className="bg-white rounded-3xl p-7 md:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-full pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Baseline Foundation
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {sixteenType?.fullCode || 'Current Self'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {comparison.currentSelf.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                    {comparison.currentSelf.description}
                  </p>

                  <div className="mt-6 space-y-5">
                    {/* Dominant States */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Layers size={14} className="text-indigo-500" />
                        Natural Operating Patterns
                      </h4>
                      <div className="space-y-1.5">
                        {comparison.currentSelf.dominantStates.map((state, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{state}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Friction Points */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2.5 flex items-center gap-1.5">
                        <Flame size={14} className="text-rose-500" />
                        Where Energy Gets Stuck (Friction Edges)
                      </h4>
                      <div className="space-y-1.5">
                        {comparison.currentSelf.frictionPoints.map((friction, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/70">
                            <span className="text-rose-500 font-bold">⚡</span>
                            <span>{friction}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Energy Sources */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2.5 flex items-center gap-1.5">
                        <Zap size={14} className="text-emerald-500" />
                        Natural Recharge Sources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {comparison.currentSelf.energySources.map((source, idx) => (
                          <span key={idx} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                            🌿 {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Grounded in actualized trait metrics</span>
                  <button 
                    onClick={() => {
                      setEntryType('growth_edge');
                      setShowAddForm(true);
                      setActiveTab('journal');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                  >
                    <span>Log friction in Journal</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* EVOLVED / IMPROVISED SELF CARD */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-7 md:p-8 border border-indigo-700/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-300" />
                      Self-Actualized Horizon
                    </span>
                    <span className="text-xs font-bold text-indigo-300">
                      The Improvised Version
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {comparison.evolvedSelf.title}
                  </h3>
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                    {comparison.evolvedSelf.description}
                  </p>

                  <div className="mt-6 space-y-5">
                    {/* Unlocked Capacities */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        Unlocked Superpowers
                      </h4>
                      <div className="space-y-1.5">
                        {comparison.evolvedSelf.unlockedCapacities.map((capacity, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{capacity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keystone Habits */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5 flex items-center gap-1.5">
                        <Target size={14} className="text-amber-400" />
                        Keystone Habits to Cultivate
                      </h4>
                      <div className="space-y-1.5">
                        {comparison.evolvedSelf.habitsToCultivate.map((habit, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                            <span className="text-amber-400 font-bold">★</span>
                            <span>{habit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guiding Vision Banner */}
                    <div className="bg-indigo-800/40 border border-indigo-500/30 rounded-2xl p-4 text-center">
                      <p className="text-xs font-medium italic text-indigo-200 leading-relaxed">
                        {comparison.evolvedSelf.guidingVision}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-emerald-300 font-bold">Achieved step-by-step, not overnight</span>
                  <button 
                    onClick={() => {
                      setEntryType('strength');
                      setShowAddForm(true);
                      setActiveTab('journal');
                    }}
                    className="font-bold text-white hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <span>Celebrate a Win</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Stepping Stones: The Evolution Bridge */}
            <div className="bg-white rounded-3xl p-7 md:p-8 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={22} className="text-indigo-600" />
                    The Evolution Bridge (Stepping Stones)
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">
                    Higgins' micro-transition phases to move from self-doubt to authentic mastery.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  3 Stages
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparison.steppingStones.map((stone, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                          {stone.phase}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">
                        {stone.action}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <span className="text-xs text-slate-500 block font-medium">Daily Focus:</span>
                      <span className="text-xs font-bold text-slate-700 mt-0.5 block">{stone.focus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STRENGTHS & GROWTH EDGES JOURNAL */}
        {/* ========================================================================= */}
        {activeTab === 'journal' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Privacy Guarantee Header */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                      DPDP Act 2023 Strictly On-Device Storage
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Zero Behavioral Tracking
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    All journal reflections remain 100% encrypted in your local device browser storage. Never uploaded, sold, or profiled.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex-shrink-0"
              >
                <Plus size={15} />
                <span>{showAddForm ? 'Close Form' : 'Write Reflection'}</span>
              </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Entries</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{journalStats.total}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Superpowers Logged</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">{journalStats.strengths}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Growth Edges Faced</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">{journalStats.growthEdges}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Mitigation Reps</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">{journalStats.totalMitigationsPracticed}</span>
              </div>
            </div>

            {/* Reflection Creation Form */}
            {showAddForm && (
              <form 
                onSubmit={handleSaveEntry}
                className="bg-white rounded-3xl p-6 md:p-8 border border-indigo-200 shadow-md space-y-6 animate-fade-in-up"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-600" />
                    Record a Self-Evolution Reflection
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                {/* Entry Type Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Reflection Kind
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setEntryType('strength')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        entryType === 'strength'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-base font-black flex items-center gap-2">
                        <span>🌟</span>
                        <span>Superpower Win</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">A moment where your natural strength or resilience showed up.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEntryType('growth_edge')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        entryType === 'growth_edge'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-base font-black flex items-center gap-2">
                        <span>🌱</span>
                        <span>Growth Edge</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">A friction point or hesitation you observed with self-compassion.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEntryType('reflection')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        entryType === 'reflection'
                          ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-base font-black flex items-center gap-2">
                        <span>💭</span>
                        <span>Free Reflection</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Daily clarity, thoughts on a conversation, or a dream.</p>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Title / Core Insight
                  </label>
                  <input
                    type="text"
                    required
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder={
                      entryType === 'strength' 
                        ? 'e.g. Spoke up in chemistry class despite nervous jitters'
                        : entryType === 'growth_edge'
                        ? 'e.g. Kept procrastinating on history essay out of perfectionism'
                        : 'e.g. What gives me peace after a long week'
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>

                {/* Reflection Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    What happened? What did you discover about yourself?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={entryReflection}
                    onChange={(e) => setEntryReflection(e.target.value)}
                    placeholder="Describe the moment honestly. How did your mind react? What did you choose to do differently?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>

                {/* Link to Mitigation Strategy (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Linked Mitigation Strategy (Optional)
                  </label>
                  <select
                    value={entryMitigation}
                    onChange={(e) => setEntryMitigation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                  >
                    <option value="">None / Pure Reflection</option>
                    {MITIGATION_STRATEGIES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.hindiTitle}) — {s.tagline}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Tags & Themes
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {COMMON_TAGS.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                          entrySelectedTags.includes(tag)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm mt-2">
                    <input
                      type="text"
                      value={entryCustomTag}
                      onChange={(e) => setEntryCustomTag(e.target.value)}
                      placeholder="Add custom tag..."
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs flex-grow focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Mood Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Inner Energy & Resonance
                  </label>
                  <div className="flex gap-3">
                    {MOOD_EMOJIS.map(m => (
                      <button
                        type="button"
                        key={m.rating}
                        onClick={() => setEntryMood(m.rating)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border flex-1 transition-all ${
                          entryMood === m.rating
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold scale-105 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
                  >
                    Save Reflection
                  </button>
                </div>
              </form>
            )}

            {/* Entries Filter & Timeline */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter By:</span>
                  <div className="flex gap-1.5">
                    {(['all', 'strength', 'growth_edge', 'reflection'] as const).map(tabKey => (
                      <button
                        key={tabKey}
                        onClick={() => setJournalFilter(tabKey)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                          journalFilter === tabKey
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tabKey === 'all' && 'All'}
                        {tabKey === 'strength' && '🌟 Superpowers'}
                        {tabKey === 'growth_edge' && '🌱 Growth Edges'}
                        {tabKey === 'reflection' && '💭 Free'}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Showing {filteredEntries.length} of {journalEntries.length} reflections
                </span>
              </div>

              {/* Journal List */}
              {filteredEntries.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mx-auto">
                    📝
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Your Journal Awaits Your Truth</h4>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
                      Every time you log a tiny win or notice a moment of hesitation, you strengthen your self-awareness. Click below to begin.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Log My First Entry</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map(entry => {
                    const linkedStrategy = MITIGATION_STRATEGIES.find(s => s.id === entry.mitigationUsed);
                    return (
                      <div 
                        key={entry.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                entry.type === 'strength'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : entry.type === 'growth_edge'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {entry.type === 'strength' && '🌟 Superpower'}
                                {entry.type === 'growth_edge' && '🌱 Growth Edge'}
                                {entry.type === 'reflection' && '💭 Reflection'}
                              </span>

                              <span className="text-xs text-slate-400 font-medium">
                                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>

                              {entry.moodRating && (
                                <span className="text-sm" title={`Energy rating: ${entry.moodRating}/5`}>
                                  {MOOD_EMOJIS.find(m => m.rating === entry.moodRating)?.emoji || '🌱'}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => deleteJournalEntry(entry.id)}
                              aria-label="Delete entry"
                              className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <h4 className="text-base font-black text-slate-900">
                            {entry.title}
                          </h4>
                          
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                            {entry.reflection}
                          </p>

                          {/* Linked Mitigation Strategy Pill */}
                          {linkedStrategy && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold">
                              <Zap size={13} className="text-indigo-600" />
                              <span>Applied Tool: {linkedStrategy.title} ({linkedStrategy.hindiTitle})</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                            {entry.tags.map((tag, idx) => (
                              <span key={idx} className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MITIGATION STRATEGIES (EVOLUTION TOOLKIT) */}
        {/* ========================================================================= */}
        {activeTab === 'mitigations' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Header Description */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Zap size={22} className="text-amber-500" />
                  Evidence-Based Behavioral Mitigation Toolkit
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  Rooted in Cognitive Behavioral Defusion (CBT) and Positive Psychology. Pick 1 tool to try whenever friction arises.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'focus', label: 'Focus & Flow' },
                  { id: 'emotional_calm', label: 'Emotional Calm' },
                  { id: 'relationships', label: 'Boundaries' },
                  { id: 'confidence', label: 'Confidence' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setStrategyCategory(cat.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                      strategyCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStrategies.map((strategy) => {
                const practiceCount = completedMitigations[strategy.id] || 0;
                return (
                  <div
                    key={strategy.id}
                    className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Category & Practice Counter */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {strategy.category.replace('_', ' ')}
                        </span>
                        {practiceCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Flame size={12} className="text-amber-500" />
                            {practiceCount} {practiceCount === 1 ? 'rep' : 'reps'}
                          </span>
                        )}
                      </div>

                      {/* Titles */}
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">
                        {strategy.title}
                      </h4>
                      <p className="text-xs font-bold text-indigo-600 mt-0.5">
                        {strategy.hindiTitle} • <span className="text-slate-500 font-medium">{strategy.tagline}</span>
                      </p>

                      {/* Target Friction */}
                      <div className="mt-4 p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs">
                        <span className="font-bold text-rose-800">Target Friction: </span>
                        <span className="text-rose-700">{strategy.targetFriction}</span>
                      </div>

                      {/* Psychological Mechanism */}
                      <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70 text-xs">
                        <span className="font-bold text-indigo-900">Why It Works: </span>
                        <span className="text-indigo-800">{strategy.psychologicalMechanism}</span>
                      </div>

                      {/* Step by step */}
                      <div className="mt-4 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Action Protocol:
                        </span>
                        {strategy.stepByStep.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* Quick Mantra */}
                      <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-center">
                        <p className="text-xs font-bold italic text-amber-900">
                          "{strategy.quickMantra}"
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => toggleMitigation(strategy.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                      >
                        <CheckCircle2 size={14} className="text-indigo-600" />
                        <span>Practice This Tool (+1)</span>
                      </button>

                      <button
                        onClick={() => handleReflectWithStrategy(strategy)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <span>Reflect in Journal</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
