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
  ChevronLeft,
  SlidersHorizontal,
  Sun,
  Wand2,
  Star,
  Wind,
  Printer
} from 'lucide-react';
import { 
  useAppStore, 
  useUser, 
  useProfile, 
  useJournalEntries, 
  useCompletedMitigations,
  useCustomMitigations
} from '../../store';
import { 
  generateSelfImageComparison, 
  generatePersonalizedSelfManagementPlan,
  MITIGATION_STRATEGIES, 
  MitigationStrategy,
  GrowthJournalEntry 
} from '../../engine/growth/selfEvolutionEngine';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';
import { MaslowNeedsCompass } from './MaslowNeedsCompass';
import { AtmaJnanaOriginModal } from '../common/AtmaJnanaOriginModal';
import { AboutDeveloperModal } from '../common/AboutDeveloperModal';
import { SomaticBreathingCompanion } from './SomaticBreathingCompanion';
import { LifeBlueprintExport } from './LifeBlueprintExport';

interface SelfEvolutionSanctuaryProps {
  initialTab?: 'mirror' | 'journal' | 'mitigations' | 'needs' | 'origin';
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
  const customMitigations = useCustomMitigations();
  const { 
    addJournalEntry, 
    deleteJournalEntry, 
    toggleMitigation, 
    addCustomMitigation, 
    deleteCustomMitigation 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'mirror' | 'journal' | 'mitigations' | 'needs' | 'origin'>(initialTab);
  const [showAtmaModal, setShowAtmaModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  
  // Strategy filter & mode
  const [managementMode, setManagementMode] = useState<'personalized' | 'all'>('personalized');
  const [strategyCategory, setStrategyCategory] = useState<string>('all');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom strategy form state
  const [customTitle, setCustomTitle] = useState('');
  const [customHindiTitle, setCustomHindiTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<MitigationStrategy['category']>('focus');
  const [customTagline, setCustomTagline] = useState('');
  const [customTargetFriction, setCustomTargetFriction] = useState('');
  const [customMechanism, setCustomMechanism] = useState('');
  const [customStep1, setCustomStep1] = useState('');
  const [customStep2, setCustomStep2] = useState('');
  const [customStep3, setCustomStep3] = useState('');
  const [customMantra, setCustomMantra] = useState('');

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

  // Derive deep personalized self-management plan
  const personalizedPlan = useMemo(() => {
    return generatePersonalizedSelfManagementPlan(
      profile,
      user,
      journalEntries,
      completedMitigations,
      customMitigations
    );
  }, [profile, user, journalEntries, completedMitigations, customMitigations]);

  // All combined strategies
  const allStrategies = useMemo(() => {
    return [...MITIGATION_STRATEGIES, ...customMitigations];
  }, [customMitigations]);

  // Filtered strategies for "all" mode
  const filteredStrategies = useMemo(() => {
    if (strategyCategory === 'all') return allStrategies;
    return allStrategies.filter(s => s.category === strategyCategory);
  }, [strategyCategory, allStrategies]);

  // Filtered recommendations for "personalized" mode
  const filteredRecommendations = useMemo(() => {
    if (strategyCategory === 'all') return personalizedPlan.recommendedStrategies;
    return personalizedPlan.recommendedStrategies.filter(r => r.strategy.category === strategyCategory);
  }, [strategyCategory, personalizedPlan]);

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

  const handleSaveCustomStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customTagline.trim()) return;

    const steps = [customStep1, customStep2, customStep3]
      .map(s => s.trim())
      .filter(s => s.length > 0);

    addCustomMitigation({
      title: customTitle.trim(),
      hindiTitle: customHindiTitle.trim() || customTitle.trim(),
      category: customCategory,
      tagline: customTagline.trim(),
      targetFriction: customTargetFriction.trim() || 'Custom personal friction point',
      psychologicalMechanism: customMechanism.trim() || 'Personal intentional habit reprogramming.',
      stepByStep: steps.length > 0 ? steps : ['Pause and take a breath', 'Follow your custom protocol', 'Check off as completed'],
      quickMantra: customMantra.trim() || 'My customized habit brings calm momentum.'
    });

    setCustomTitle('');
    setCustomHindiTitle('');
    setCustomTagline('');
    setCustomTargetFriction('');
    setCustomMechanism('');
    setCustomStep1('');
    setCustomStep2('');
    setCustomStep3('');
    setCustomMantra('');
    setShowCustomModal(false);
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
              
              {/* Quick action buttons in Hero */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <button
                  onClick={() => setShowBreathingModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 font-bold text-xs transition-all border border-emerald-400/30 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Wind size={14} className="text-emerald-300" />
                  <span>432 Hz Somatic Pacer</span>
                </button>
                <button
                  onClick={() => setShowBlueprintModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500/25 hover:bg-indigo-500/35 text-indigo-200 font-bold text-xs transition-all border border-indigo-400/30 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer size={14} className="text-indigo-300" />
                  <span>Export Life Blueprint (PDF)</span>
                </button>
              </div>
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
          <div className="flex flex-wrap items-center gap-2 mt-8 border-b border-white/10 pb-1">
            <button
              onClick={() => setActiveTab('mirror')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'mitigations'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap size={16} />
              <span>Self-Management (Tools)</span>
            </button>
            <button
              onClick={() => setActiveTab('needs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'needs'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Needs & Desires (Maslow Compass)</span>
            </button>
            <button
              onClick={() => setActiveTab('origin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'origin'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-amber-300 hover:text-white hover:bg-amber-400/10 border border-amber-400/30'
              }`}
              title="आत्मज्ञान: Foundational Verses & Creator's Ideology"
            >
              <span>🪷</span>
              <span>आत्मज्ञान • Origin & Creed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sacred Atma-Jnana Foundation Banner */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-4 mb-2 relative z-20">
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-indigo-950/90 backdrop-blur-xl border border-amber-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5 shadow-sm">
              <span className="text-xl">🪷</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  मूल दर्शन • The Foundation
                </span>
                <span className="text-xs text-slate-400">Quote by संत कबीर दास (Sant Kabir Das)</span>
              </div>
              <p className="text-white font-serif text-xs md:text-sm italic leading-relaxed">
                "जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी... सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
              </p>
              <p className="text-amber-200/90 text-xs font-semibold mt-0.5">
                The Guiding Creed: <strong>Self Realisation is God's Realisation</strong> (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
            <button
              onClick={() => setActiveTab('origin')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Explore Genesis Tab</span>
              <ArrowRight size={13} className="text-amber-300" />
            </button>
            <button
              onClick={() => setShowAtmaModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open full interactive philosophy modal"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Modal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-6">
        
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
        {/* TAB 3: PERSONALIZED SELF-MANAGEMENT TOOLKIT */}
        {/* ========================================================================= */}
        {activeTab === 'mitigations' && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Header with Mode Switcher & Custom Strategy CTA */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1.5 border border-amber-200">
                  <Wand2 size={13} className="text-amber-600" />
                  <span>Personalized Self-Management Strategy Engine</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Behavioral Self-Management Toolkit
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-0.5 max-w-2xl">
                  Evidence-based CBT and ACT micro-interventions dynamically matched to your 16-type, learning style, and local journal reflections.
                </p>
              </div>

              {/* Mode Switcher and Add Button */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  onClick={() => setShowBreathingModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Wind size={14} />
                  <span>432Hz Breathing Pacer</span>
                </button>

                <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
                  <button
                    onClick={() => setManagementMode('personalized')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      managementMode === 'personalized'
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Tailored For You ({personalizedPlan.recommendedStrategies.length})</span>
                  </button>
                  <button
                    onClick={() => setManagementMode('all')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      managementMode === 'all'
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers size={14} className="text-slate-600" />
                    <span>All Tools ({allStrategies.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Custom Tool</span>
                </button>
              </div>
            </div>

            {/* Interactive Somatic Breathing Companion Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 flex-shrink-0 text-xl shadow-sm">
                  🫁
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Somatic Vagal Regulation • 432 Hz Synthesizer
                    </span>
                    <span className="text-xs text-slate-400">4-7-8 • Box Breath • 3s Active Pause</span>
                  </div>
                  <h4 className="text-lg font-black text-white">Interactive Somatic Breathing Companion</h4>
                  <p className="text-slate-300 text-xs mt-0.5 max-w-xl leading-relaxed">
                    Instantly down-regulate autonomic nervous system panic, test anxiety, or impulsive reactions using mathematically synthesized 432 Hz harmonic audio cues.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBreathingModal(true)}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Wind size={15} />
                <span>Launch Breathing Pacer</span>
              </button>
            </div>

            {/* PERSONALIZED PROFILE BANNER (Visible in Personalized Mode) */}
            {managementMode === 'personalized' && (
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 border border-indigo-700/40 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <Star size={12} className="text-emerald-300 fill-emerald-300" />
                        <span>Tailored for {personalizedPlan.userTitle}</span>
                      </span>
                      <span className="text-xs font-bold text-indigo-300">
                        {sixteenType?.fullCode || 'Authentic Self'}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tight">
                      {personalizedPlan.archetypeTitle}
                    </h4>
                    <p className="text-indigo-200 text-xs md:text-sm mt-1">
                      {personalizedPlan.archetypeSubtitle}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 max-w-sm text-xs">
                    <span className="text-amber-300 font-bold flex items-center gap-1.5 mb-1">
                      <Flame size={14} className="text-amber-400" />
                      Dominant Friction Focus:
                    </span>
                    <p className="text-slate-300 leading-snug">
                      {personalizedPlan.coreFrictionPattern}
                    </p>
                  </div>
                </div>

                {/* 3 Personal Adaptation Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                  
                  {/* Pillar 1: Learning Style */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                        <Brain size={14} className="text-indigo-400" />
                        <span>{personalizedPlan.learningStyleGuidance.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {personalizedPlan.learningStyleGuidance.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs font-medium text-emerald-300">
                      💡 <strong>Action Tip:</strong> {personalizedPlan.learningStyleGuidance.actionableTip}
                    </div>
                  </div>

                  {/* Pillar 2: Academic & Age Context */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                        <Target size={14} className="text-amber-400" />
                        <span>Academic Stage: {personalizedPlan.ageTierGuidance.tier}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {personalizedPlan.ageTierGuidance.context}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs font-medium text-amber-200">
                      🎯 <strong>Focus:</strong> {personalizedPlan.ageTierGuidance.focus}
                    </div>
                  </div>

                  {/* Pillar 3: Daily Keystone Routine */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                        <Sun size={14} className="text-cyan-400" />
                        <span>Daily Keystone Anchors</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div>
                          <strong className="text-slate-100">🌅 Morning:</strong> {personalizedPlan.dailyKeystoneRoutine.morningAnchor}
                        </div>
                        <div>
                          <strong className="text-slate-100">🎯 Study Focus:</strong> {personalizedPlan.dailyKeystoneRoutine.studyFocusRule}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-white/10 text-xs text-slate-300">
                      <strong className="text-slate-100">🌙 Evening:</strong> {personalizedPlan.dailyKeystoneRoutine.eveningReflection}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Theme:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                  {[
                    { id: 'all', label: 'All Themes' },
                    { id: 'focus', label: 'Focus & Flow' },
                    { id: 'emotional_calm', label: 'Emotional Calm' },
                    { id: 'relationships', label: 'Boundaries & Energy' },
                    { id: 'confidence', label: 'Confidence' },
                    { id: 'habits', label: 'Execution Habits' },
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

              <span className="text-xs font-medium text-slate-400">
                {managementMode === 'personalized' 
                  ? `Showing ${filteredRecommendations.length} tailored recommendations`
                  : `Showing ${filteredStrategies.length} tools`}
              </span>
            </div>

            {/* ========================================================= */}
            {/* PERSONALIZED RECOMMENDATIONS GRID */}
            {/* ========================================================= */}
            {managementMode === 'personalized' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRecommendations.map(({ strategy, matchScore, matchReason, priority, learningStyleTip }) => {
                  const practiceCount = completedMitigations[strategy.id] || 0;
                  return (
                    <div
                      key={strategy.id}
                      className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                    >
                      <div>
                        {/* Top Match Bar */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Sparkles size={12} className="text-emerald-600" />
                              <span>{matchScore}% Match for {personalizedPlan.userTitle}</span>
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              priority === 'primary' 
                                ? 'bg-indigo-100 text-indigo-900' 
                                : priority === 'recommended'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {priority === 'primary' ? 'High Impact' : priority === 'recommended' ? 'Recommended' : 'Supportive'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {strategy.isCustom && (
                              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                                Custom Tool
                              </span>
                            )}
                            {practiceCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                <Flame size={12} className="text-amber-500" />
                                {practiceCount} {practiceCount === 1 ? 'rep' : 'reps'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title and Category */}
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">
                          {strategy.title}
                        </h4>
                        <p className="text-xs font-bold text-indigo-600 mt-0.5">
                          {strategy.hindiTitle} • <span className="text-slate-500 font-medium">{strategy.tagline}</span>
                        </p>

                        {/* Personalized Matching Rationale */}
                        <div className="mt-3.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100/90 text-xs">
                          <span className="font-black text-indigo-900 flex items-center gap-1.5 mb-0.5">
                            <Target size={13} className="text-indigo-600" />
                            Why tailored for you:
                          </span>
                          <span className="text-indigo-800 leading-snug block">
                            {matchReason}
                          </span>
                        </div>

                        {/* Learning Style Anchor (if applicable) */}
                        {learningStyleTip && (
                          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 font-medium">
                            {learningStyleTip}
                          </div>
                        )}

                        {/* Target Friction */}
                        <div className="mt-3 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs">
                          <span className="font-bold text-rose-800">Target Friction: </span>
                          <span className="text-rose-700">{strategy.targetFriction}</span>
                        </div>

                        {/* Psychological Mechanism */}
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <span className="font-bold text-slate-800">Why It Works: </span>
                          <span className="text-slate-600">{strategy.psychologicalMechanism}</span>
                        </div>

                        {/* Step by Step */}
                        <div className="mt-3.5 space-y-1.5">
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
                        <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-center">
                          <p className="text-xs font-bold italic text-amber-900">
                            "{strategy.quickMantra}"
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMitigation(strategy.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 size={14} className="text-indigo-600" />
                            <span>Practice (+1)</span>
                          </button>
                          {strategy.isCustom && (
                            <button
                              onClick={() => deleteCustomMitigation(strategy.id)}
                              aria-label="Delete custom tool"
                              className="text-slate-300 hover:text-red-500 transition-colors p-2"
                              title="Delete custom tool"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

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
            ) : (
              /* ========================================================= */
              /* ALL STRATEGIES GRID VIEW */
              /* ========================================================= */
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
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {strategy.category.replace('_', ' ')}
                            </span>
                            {strategy.isCustom && (
                              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                                Custom Tool
                              </span>
                            )}
                          </div>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMitigation(strategy.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 size={14} className="text-indigo-600" />
                            <span>Practice (+1)</span>
                          </button>
                          {strategy.isCustom && (
                            <button
                              onClick={() => deleteCustomMitigation(strategy.id)}
                              aria-label="Delete custom tool"
                              className="text-slate-300 hover:text-red-500 transition-colors p-2"
                              title="Delete custom tool"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

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
            )}

            {/* ========================================================= */}
            {/* CREATE CUSTOM SELF-MANAGEMENT TOOL MODAL */}
            {/* ========================================================= */}
            {showCustomModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <form 
                  onSubmit={handleSaveCustomStrategy}
                  className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-fade-in-up my-8"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <Plus size={18} />
                      </div>
                      <h4 className="text-lg font-black text-slate-900">Craft Custom Self-Management Tool</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Design a personalized behavioral trigger that fits your exact study schedule, temperament, or environment. Saved 100% locally to your device.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Tool Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. Cold Water Sip Reset"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Hindi / Nickname
                      </label>
                      <input
                        type="text"
                        value={customHindiTitle}
                        onChange={(e) => setCustomHindiTitle(e.target.value)}
                        placeholder="e.g. जल विराम नियम"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="focus">Focus & Flow</option>
                        <option value="emotional_calm">Emotional Calm</option>
                        <option value="relationships">Boundaries & Energy</option>
                        <option value="confidence">Confidence</option>
                        <option value="habits">Execution Habits</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        One-Line Tagline *
                      </label>
                      <input
                        type="text"
                        required
                        value={customTagline}
                        onChange={(e) => setCustomTagline(e.target.value)}
                        placeholder="e.g. 3 cold sips break study brain-freeze."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Target Friction Point
                    </label>
                    <input
                      type="text"
                      value={customTargetFriction}
                      onChange={(e) => setCustomTargetFriction(e.target.value)}
                      placeholder="e.g. Getting stuck on hard physics derivations and wanting to scroll Instagram."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Action Protocol (3 Quick Steps)
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={customStep1}
                        onChange={(e) => setCustomStep1(e.target.value)}
                        placeholder="Step 1: Notice the moment you want to give up."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={customStep2}
                        onChange={(e) => setCustomStep2(e.target.value)}
                        placeholder="Step 2: Take 3 slow sips of cold water."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={customStep3}
                        onChange={(e) => setCustomStep3(e.target.value)}
                        placeholder="Step 3: Try writing just the next formula line."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Personal Anchor Mantra
                    </label>
                    <input
                      type="text"
                      value={customMantra}
                      onChange={(e) => setCustomMantra(e.target.value)}
                      placeholder="e.g. Cool the mind, solve the line."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(false)}
                      className="px-4 py-2 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                    >
                      Save Custom Tool
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MASLOW'S NEEDS & DESIRES COMPASS */}
        {/* ========================================================================= */}
        {activeTab === 'needs' && (
          <MaslowNeedsCompass />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ATMA-JNANA (ORIGIN, FOUNDATIONAL DOHAS & CREATOR'S CREED) */}
        {/* ========================================================================= */}
        {activeTab === 'origin' && (
          <div className="space-y-8 animate-fade-in-up pb-12">
            {/* Grand Hero Creed Card */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 text-white border border-amber-400/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-400/30">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>The Soul of PRERNA • आदि दर्शन</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  "Self-Realisation is God's Realisation."
                </h2>
                <p className="text-amber-200 font-serif text-lg md:text-xl font-bold">
                  आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है — स्वयं को जानना ही परमात्मा की अनुभूति है।
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
                  This platform is not merely an assemblage of psychometric charts or productivity sprints. It was conceived as a digital sanctuary with one sacred intent: to guide adolescents away from the noisy, frantic search for external approval, and to anchor them in their eternal, indwelling essence.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowAtmaModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Open Interactive Philosophy Modal</span>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* The Foundational Verses with Reverent Attribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Question: The External Search */}
              <div className="bg-white rounded-3xl p-7 md:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      The Symptom • बाहरी भटकाव
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      संत कबीर दास (Sant Kabir Das)
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 text-amber-100 font-serif text-base md:text-lg text-center leading-loose font-semibold shadow-inner border border-slate-800">
                    "आत्मज्ञान बिना नर भटके, कोई मथुरा कोई काशी।<br />
                    जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी।।<br />
                    जल में मीन प्यासी, मोहे सुन-सुन आवत हाँसि।।"
                  </div>

                  <div className="space-y-2 text-xs md:text-sm text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800">सरल भावार्थ (Profound Commentary):</p>
                    <p>
                      <strong>कस्तूरी मृग (The Musk Deer):</strong> जिस प्रकार कस्तूरी मृग अपनी ही नाभि में बसी दिव्य सुगंध से अनजान होकर पूरे वन में व्याकुल होकर भटकता रहता है, उसी प्रकार आज का किशोर शांति, आत्म-सम्मान और अपनी पहचान को बाहर दुनिया में, सोशल मीडिया पर और दूसरों की नज़रों में खोजता है।
                    </p>
                    <p>
                      <strong>जल में मीन प्यासी (The Thirsty Fish):</strong> जैसे असीम सागर में तैरती हुई मछली पानी के लिए प्यासी रहे, यह सुनकर ज्ञानी को दया और आश्चर्य होता है — वैसे ही हम परमात्मा और असीम ऊर्जा में डूबे होकर भी स्वयं को अधूरा और असहाय समझते हैं।
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer: The Indwelling Light */}
              <div className="bg-white rounded-3xl p-7 md:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      The Resolution • घट में प्रकाश
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      संत कबीर दास (Sant Kabir Das)
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 text-emerald-100 font-serif text-base md:text-lg text-center leading-loose font-semibold shadow-inner border border-slate-800">
                    "विधि हरि हर जाको ध्यान धरत हैं, मुनिजन सहज अठ्ठासी।<br />
                    सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                  </div>

                  <div className="space-y-2 text-xs md:text-sm text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800">सरल भावार्थ (Profound Commentary):</p>
                    <p>
                      <strong>सोई हंस तेरे घट माहि (The Indwelling Divine Swan):</strong> जिस परम चेतना का ध्यान ब्रह्मा (विधि), विष्णु (हरि) और शिव (हर) धरते हैं, और अट्ठासी हज़ार ऋषि-मुनि समाधि में जिसकी खोज करते हैं — वही अविनाशी, अलख पुरुष रूपी 'हंस' (शुद्ध आत्मा) तुम्हारे अपने हृदय में विराजमान है!
                    </p>
                    <p>
                      <strong>आत्मज्ञान ही परमात्मा का ज्ञान है:</strong> जब एक किशोर अपने भीतर के उस प्रकाश, अपनी अंतर्निहित शक्तियों और आत्म-स्वरूप को पहचान लेता है, तो बाहर की सभी व्यर्थ चिंताओं, तुलना और भटकावों से मुक्त हो जाता है।
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How PRERNA's Architecture Fulfills This Ancient Vision */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Compass size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">How Every Feature Manifests Atma-Jnana</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">From Ancient Philosophy to Modern Cognitive Architecture</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Psychometrics & 16 Types</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Understanding the unique design of your vessel (घट). Recognizing your natural introversion, creativity, or analytical precision without comparing yourself to others.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    2
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Actual vs. Evolved Mirror</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Higgins' Self-Discrepancy reimagined with reverence. Your evolved self is not an artificial persona you force, but the natural awakening of the Divine Swan within you.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                    3
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Maslow Needs vs. Wants</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The Distraction Shield. Breaking free from superficial dopamine traps (scrolling, cravings) so your mind can remain clear, centered, and peaceful.
                  </p>
                </div>
              </div>
            </div>

            {/* Meet the Architect & Lineage Showcase */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0c1124] rounded-3xl p-8 border border-indigo-500/30 text-white shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
                    <span className="text-2xl font-black">HG</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Architect & Developer
                      </span>
                      <span className="text-xs text-slate-400">Varanasi, India</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mt-1">
                      Harsh Kumar Gupta
                    </h3>
                    <p className="text-xs text-indigo-300 font-medium">
                      AI & Robotics Specialist • Yoga & Science of Living Scholar • Clinical Pharma Bridge
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDeveloperModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles size={14} />
                  <span>View Full Developer Biography & 11 Google Badges →</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider block text-[11px]">
                    Spiritual Lineage & Gratitude
                  </span>
                  <p className="leading-relaxed">
                    Disciple of <strong>Shri Prem Rawat</strong> (recipient of the living Knowledge of breath and peace). First inspired by his <strong>Father</strong> (under whose name <em>"Dinesh Kumar Presents"</em> he dedicated 6+ years of visual storytelling).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider block text-[11px]">
                    Multi-Disciplinary Convergence
                  </span>
                  <p className="leading-relaxed">
                    <strong>MCA (Grade A)</strong> + <strong>MA in Yoga & Science of Living</strong> + <strong>D.Pharm</strong> + <strong>B.Sc. (Maths/Physics)</strong>. Unites machine learning with somatic nervous-system regulation and clinical pharmaceutical boundaries.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="font-bold text-emerald-300 uppercase tracking-wider block text-[11px]">
                    Mindset & Divine Offering
                  </span>
                  <p className="leading-relaxed">
                    Grounded in a <em>"Never Give Up"</em> ethos and relentless daily learning. PRERNA is offered as a humble token of gratitude to God for the abilities to make this world a safer, more conscious place for every seeker.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Atma-Jnana Interactive Modal */}
      <AtmaJnanaOriginModal
        isOpen={showAtmaModal}
        onClose={() => setShowAtmaModal(false)}
      />

      {/* Dedicated About Developer Modal */}
      <AboutDeveloperModal
        isOpen={showDeveloperModal}
        onClose={() => setShowDeveloperModal(false)}
      />

      {/* Somatic Breathing Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <SomaticBreathingCompanion
            isModal={true}
            onClose={() => setShowBreathingModal(false)}
          />
        </div>
      )}

      {/* Life Blueprint Export Modal */}
      <LifeBlueprintExport
        isOpen={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        user={user}
        profile={profile}
        sixteenType={sixteenType}
      />
    </div>
  );
};
