import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Trash2, 
  Lightbulb, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Compass,
  Zap
} from 'lucide-react';
import { 
  useUser, 
  useProfile, 
  useJournalEntries, 
  useTrackedNeeds, 
  useAppStore 
} from '../../store';
import { 
  MASLOW_TIERS, 
  MaslowTier, 
  calculateMaslowAudit, 
  discernWantVsNeed
} from '../../engine/growth/maslowNeedsEngine';

const QUICK_URGE_PROMPTS = [
  'Scroll Instagram reels for another hour',
  'Eat sugary snacks / junk food while studying',
  'Avoid starting my difficult math assignment',
  'Buy new sneakers so my school group likes me',
  'Learn to play acoustic guitar chords',
  'Agree to a party tonight even though I am exhausted'
];

export const MaslowNeedsCompass: React.FC = () => {
  const user = useUser();
  const profile = useProfile();
  const journalEntries = useJournalEntries();
  const trackedNeeds = useTrackedNeeds();
  const { addTrackedNeed, updateTrackedNeedStatus, deleteTrackedNeed } = useAppStore();

  // Active expanded tier in the pyramid
  const [expandedTier, setExpandedTier] = useState<MaslowTier | null>(null);

  // Input want text for discernment
  const [inputWant, setInputWant] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'redirected'>('all');

  // Currently analyzed discernment (live or submitted)
  const discernmentResult = useMemo(() => {
    if (!inputWant.trim()) return null;
    return discernWantVsNeed(inputWant, profile, user);
  }, [inputWant, profile, user]);

  // Overall Maslow fulfillment audit
  const audit = useMemo(() => {
    return calculateMaslowAudit(profile, user, journalEntries, trackedNeeds);
  }, [profile, user, journalEntries, trackedNeeds]);

  // Filtered tracked needs
  const filteredNeeds = useMemo(() => {
    if (filterStatus === 'all') return trackedNeeds;
    if (filterStatus === 'active') return trackedNeeds.filter(n => n.status === 'active');
    return trackedNeeds.filter(n => n.status === 'redirected' || n.status === 'fulfilled');
  }, [trackedNeeds, filterStatus]);

  // Handle saving a newly discerned want into the user's tracker
  const handleSaveDiscernedNeed = () => {
    if (!discernmentResult || !inputWant.trim()) return;

    addTrackedNeed({
      expressedWant: inputWant.trim(),
      rootNeedTier: discernmentResult.rootTier,
      rootNeedExplanation: discernmentResult.rootExplanation,
      classification: discernmentResult.classification,
      nourishingAlternative: discernmentResult.nourishingAlternative,
      status: 'active',
      tags: [discernmentResult.rootTier, discernmentResult.classification]
    });

    setInputWant('');
  };

  const tiersInPyramidOrder: MaslowTier[] = [
    'self_actualization',
    'esteem',
    'belonging',
    'safety',
    'physiological'
  ];

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header & Framework Introduction */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-indigo-700/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-500/30">
                <Compass size={13} className="text-rose-400" />
                <span>Maslow's Hierarchy of Needs & Distraction Shield</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Needs & Desires Compass
              </h2>
              <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-1 leading-relaxed">
                Adolescent distraction is rarely a failure of willpower. When fundamental biological or emotional needs are starved, the brain craves quick dopamine substitutes. Learn to recognize what your body and mind truly need.
              </p>
            </div>

            {/* Overall Balance Index */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-5 self-start md:self-auto flex-shrink-0">
              <div>
                <div className="text-3xl font-black text-emerald-400">{audit.overallMaslowIndex}%</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Foundation Health</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className={`text-xs font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                  audit.distractionRiskLevel === 'high' 
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                    : audit.distractionRiskLevel === 'moderate'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {audit.distractionRiskLevel} Distraction Risk
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Level {audit.hungryTier.level} needs care</div>
              </div>
            </div>
          </div>

          {/* Hungry Tier Alert Callout */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3.5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <span>Foundation Insight for {audit.userTitle}:</span>
                <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-md bg-amber-500/20">
                  {audit.hungryTier.title} (Level {audit.hungryTier.level})
                </span>
              </h4>
              <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                {audit.guidingInsight}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: THE INTERACTIVE MASLOW PYRAMID RADAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers size={20} className="text-indigo-600" />
              The 5-Tier Adolescent Needs Pyramid
            </h3>
            <p className="text-slate-500 text-xs">
              Click on any tier to explore its core needs, common disguised distraction traps, and 10-minute root fulfillments.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Higher tiers rely on lower bedrock
          </span>
        </div>

        {/* Pyramid Tiers Visual Stack */}
        <div className="space-y-3">
          {tiersInPyramidOrder.map((tierKey) => {
            const tierMeta = MASLOW_TIERS[tierKey];
            const scoreMeta = audit.tierScores[tierKey];
            const isExpanded = expandedTier === tierKey;
            const isHungry = audit.hungryTier.id === tierKey;

            return (
              <div
                key={tierKey}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? 'shadow-md border-indigo-300 bg-white' 
                    : 'hover:border-slate-300 bg-slate-50/70'
                }`}
              >
                {/* Clickable Header Bar */}
                <button
                  type="button"
                  onClick={() => setExpandedTier(isExpanded ? null : tierKey)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: tierMeta.bgLight, color: tierMeta.color }}
                    >
                      {tierMeta.iconEmoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          Level {tierMeta.level}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {tierMeta.title}
                        </h4>
                        <span className="text-xs font-bold text-slate-400">
                          ({tierMeta.hindiTitle})
                        </span>
                        {isHungry && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            Needs Care
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {tierMeta.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Fulfillment Bar & Toggle */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-right w-28">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{scoreMeta.score}%</span>
                        <span className={`text-[10px] font-bold capitalize ${
                          scoreMeta.status === 'starved' ? 'text-rose-600' :
                          scoreMeta.status === 'fragile' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {scoreMeta.status}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${scoreMeta.score}%`,
                            backgroundColor: tierMeta.color
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-5 animate-fade-in-up bg-white">
                    <p className="text-xs text-slate-600 leading-relaxed mt-4">
                      {tierMeta.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Core Needs */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Foundational Needs
                        </h5>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {tierMeta.coreNeeds.map((need, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{need}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Common Disguised Wants */}
                      <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                        <h5 className="text-xs font-black uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-rose-600" />
                          Disguised Distraction Traps
                        </h5>
                        <div className="space-y-2 text-xs">
                          {tierMeta.commonDisguisedWants.map((trap, idx) => (
                            <div key={idx} className="bg-white/80 p-2 rounded-lg border border-rose-100/70">
                              <div className="font-bold text-rose-900">"{trap.fleetingWant}"</div>
                              <div className="text-[11px] text-slate-600 mt-1">
                                <strong className="text-rose-700">Real Need:</strong> {trap.realUnderlyingNeed}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Nourishing 10-Minute Alternatives */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <h5 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                          <Lightbulb size={13} className="text-emerald-600" />
                          10-Minute Root Fulfillments
                        </h5>
                        <ul className="space-y-1.5 text-xs text-emerald-900">
                          {tierMeta.healthyRootFulfillments.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: THE WANTS VS. NEEDS DETANGLER TOOL */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-indigo-200 shadow-md space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-100">
            <Zap size={13} className="text-indigo-600" />
            <span>Interactive Wants vs. Needs Detangler</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            What urge or desire are you feeling right now?
          </h3>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Type whatever you are craving or feeling distracted by. The system decodes the disguised Maslow need underneath.
          </p>
        </div>

        {/* Input & Quick Chips */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputWant}
              onChange={(e) => setInputWant(e.target.value)}
              placeholder="e.g. I want to keep scrolling YouTube shorts instead of studying for tomorrow..."
              className="w-full px-4 py-3.5 pr-28 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
            {inputWant && (
              <button
                type="button"
                onClick={() => setInputWant('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Quick Prompts:</span>
            {QUICK_URGE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputWant(prompt)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/70 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* DISCERNMENT ANALYSIS CARD */}
        {discernmentResult && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-indigo-200 space-y-5 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  discernmentResult.classification === 'dopamine_trap'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : discernmentResult.classification === 'healthy_desire'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {discernmentResult.classification === 'dopamine_trap' && '🔴 Dopamine Trap / Distraction'}
                  {discernmentResult.classification === 'healthy_desire' && '🟡 Healthy Secondary Desire'}
                  {discernmentResult.classification === 'core_need' && '🟢 Core Foundational Need'}
                </span>

                <span className="text-xs font-bold text-slate-600">
                  Calling Level {MASLOW_TIERS[discernmentResult.rootTier].level}: {MASLOW_TIERS[discernmentResult.rootTier].title}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveDiscernedNeed}
                className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span>Save to Needs Tracker</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Compassionate Root Need Translation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Brain size={14} className="text-indigo-600" />
                  What Your Mind/Body is Actually Asking For:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {discernmentResult.rootExplanation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-emerald-600" />
                  10-Minute Nourishing Alternative:
                </span>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  {discernmentResult.nourishingAlternative}
                </p>
              </div>
            </div>

            {/* Personalized Profile Insight */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
              <Sparkles size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Personalized Alignment:</strong> {discernmentResult.personalizedInsight}
              </div>
            </div>

            {/* 3 Discerning Questions */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                The 3-Second Pause Filter (Ask Yourself):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {discernmentResult.discerningQuestions.map((q, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                    <span className="font-bold text-indigo-600">Q{idx + 1}:</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: MY TRACKED NEEDS & DESIRES AUDIT LOG */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              My Tracked Desires & Need Discernments
            </h3>
            <p className="text-xs text-slate-500">
              Track how often you successfully catch dopamine traps and redirect energy to root fulfillments.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'active', 'redirected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                  filterStatus === tab
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab === 'all' && 'All'}
                {tab === 'active' && 'Active Urges'}
                {tab === 'redirected' && 'Redirected ✨'}
              </button>
            ))}
          </div>
        </div>

        {filteredNeeds.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl mx-auto">
              🧭
            </div>
            <h4 className="text-base font-black text-slate-900">No Desires Tracked Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Whenever you feel an urge to scroll, snack, or procrastinate, type it above to uncover the hidden Maslow need.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNeeds.map(item => {
              const tier = MASLOW_TIERS[item.rootNeedTier];
              const isRedirected = item.status === 'redirected' || item.status === 'fulfilled';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    isRedirected
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.classification === 'dopamine_trap'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.classification === 'dopamine_trap' ? 'Distraction Trap' : 'Secondary Desire'}
                      </span>

                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {tier.iconEmoji} Level {tier.level}: {tier.title}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateTrackedNeedStatus(
                          item.id, 
                          isRedirected ? 'active' : 'redirected',
                          isRedirected ? undefined : 'Successfully redirected to nourishing alternative!'
                        )}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          isRedirected
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        <CheckCircle2 size={13} className={isRedirected ? 'text-emerald-600' : 'text-indigo-600'} />
                        <span>{isRedirected ? 'Redirected ✨' : 'Mark as Redirected'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTrackedNeed(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        aria-label="Delete tracked desire"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expressed Urge */}
                  <h4 className="text-sm font-black text-slate-900">
                    "{item.expressedWant}"
                  </h4>

                  {/* Root explanation & Nourishing alternative */}
                  <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="text-slate-600">
                      <strong className="text-slate-900">Root Need:</strong> {item.rootNeedExplanation}
                    </div>
                    <div className="text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                      <strong>Nourishing Fix:</strong> {item.nourishingAlternative}
                    </div>
                  </div>

                  {item.userNotes && (
                    <div className="mt-2 text-xs italic text-slate-500">
                      Note: {item.userNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
