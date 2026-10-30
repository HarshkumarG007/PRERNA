import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  MessageCircle, 
  User, 
  Trophy,
  ChevronRight,
  Zap,
  TrendingUp,
  WifiOff,
  Compass,
  BookOpen,
  ShieldCheck,
  Wind,
  Printer,
  Moon
} from 'lucide-react';

// Sub-components
import { DailyQuestCard } from './DailyQuestCard';
import { SkillArenaCard } from './SkillArenaCard';
import { MentorCard } from './MentorCard';
import { ProfileCard } from './ProfileCard';
import { WellnessPulse } from './WellnessPulse';
import { StreakTracker } from './StreakTracker';
import { InsightsCard } from './InsightsCard';
import { InsightNarrativeView } from '../synthesis/InsightNarrativeView';
import { PrernaEmblem } from '../common/PrernaLogo';
import { SixteenTypeCard } from '../personality/SixteenTypeCard';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAppStore, useUser, useProfile } from '../../store';
import { SomaticBreathingCompanion } from '../growth/SomaticBreathingCompanion';
import { LifeBlueprintExport } from '../growth/LifeBlueprintExport';
import { AtmaJnanaOriginModal } from '../common/AtmaJnanaOriginModal';
import { AboutDeveloperModal } from '../common/AboutDeveloperModal';

export const Dashboard: React.FC = () => {
  const user = useUser();
  const profile = useProfile();
  const isOnline = useNetworkStatus();
  const { loadProfile, sessions, streak } = useAppStore();
  const [greeting, setGreeting] = useState('');
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showAtmaModal, setShowAtmaModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const navigate = useNavigate();

  const sixteenType = React.useMemo(() => {
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

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    
    setGreeting(timeGreeting);

    // Load profile
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const getFirstName = () => {
    if (user?.name) return user.name.split(' ')[0];
    if (user?.id) return 'Explorer';
    return 'Guest';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 md:pb-12">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[110px]" />
      </div>

      {/* Compact Top Greeting Row */}
      <header className="relative z-10 px-4 py-3 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shadow-xs flex-shrink-0">
              <PrernaEmblem size={30} animate={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-indigo-600 font-bold text-[11px] uppercase tracking-wider">{greeting},</p>
                <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  {getFirstName()}
                </h1>
                {!isOnline && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                    <WifiOff size={11} />
                    Offline
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs hidden sm:block">
                Welcome to your self-discovery sanctuary & growth center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap self-end sm:self-auto">
            <StreakTracker />
            
            {/* Quick Grounding Action Pills right in header */}
            <button
              onClick={() => setShowBreathingModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors border border-emerald-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="432 Hz Somatic Breathing Coherence"
            >
              <Wind size={13} className="text-emerald-600" />
              <span className="hidden md:inline">432 Hz</span>
              <span>Breathe</span>
            </button>

            <button
              onClick={() => setShowBlueprintModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export Full Life Blueprint (DPDP-sealed PDF)"
            >
              <Printer size={13} className="text-indigo-600" />
              <span className="hidden md:inline">Life</span>
              <span>Blueprint</span>
            </button>

            <button 
              onClick={() => navigate('/dashboard')}
              aria-label="View profile"
              className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-all shadow-2xs cursor-pointer text-slate-600 hover:text-indigo-600"
              title="Teen Profile & Settings"
            >
              <User size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto space-y-6 md:space-y-7">
        
        {/* ========================================================
            HERO BENTO GRID: Self-Evolution Sanctuary + Wellness Pulse
            Balanced 2-column layout that fits cleanly above the fold!
           ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Hero Card: Self-Evolution Sanctuary & Atma-Jnana Heart */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <motion.div
              whileHover={{ scale: 1.005 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 md:p-6 border border-indigo-700/40 shadow-md flex flex-col justify-between h-full group"
            >
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />

              <div className="relative z-10 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase tracking-wider border border-indigo-400/20">
                      <Sparkles size={11} className="text-emerald-400" />
                      <span>Actual vs. Improvised Self</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      Self-Evolution Sanctuary & Strengths Journal
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      DPDP Private
                    </span>
                    <button
                      onClick={() => navigate('/evolution')}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white text-white hover:text-indigo-950 flex items-center justify-center font-bold transition-all shadow-sm cursor-pointer"
                      title="Enter Full Sanctuary"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
                  Explore your baseline archetype vs. self-actualized potential. Track superpower moments, face friction edges with dignity, and master 6 behavioral mitigation tools.
                </p>

                {/* Embedded Founder's Creed & Spiritual Anchor (Sant Kabir Das) */}
                <div className="p-3 md:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0 mt-0.5">🪷</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                          The Soul of PRERNA • संत कबीर दास
                        </span>
                        <span className="text-[10px] text-slate-400">• Founder's Creed</span>
                      </div>
                      <p className="text-white font-serif text-xs md:text-sm italic mt-0.5">
                        "जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी... सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                      </p>
                      <p className="text-amber-200/90 text-[11px] font-semibold mt-0.5">
                        Core: <strong>Self Realisation is God's Realisation</strong> (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => setShowAtmaModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[11px] font-bold transition-all border border-amber-400/30 flex items-center gap-1 cursor-pointer"
                      title="Read Origin and Dohas"
                    >
                      <span>Genesis</span>
                      <ChevronRight size={12} className="text-amber-300" />
                    </button>
                    <button
                      onClick={() => setShowDevModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold transition-all border border-white/20 flex items-center gap-1 cursor-pointer"
                      title="Meet the Architect: Harsh Kumar Gupta"
                    >
                      <span>👨‍💻 Dev</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Sanctuary Quick-Tabs */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4 pt-3.5 border-t border-white/10">
                <button
                  onClick={() => navigate('/evolution')}
                  className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 hover:bg-white/15 px-2.5 py-2 rounded-xl border border-white/10 transition-colors text-left cursor-pointer"
                >
                  <Compass size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="truncate">Actual vs Evolved</span>
                </button>
                <button
                  onClick={() => navigate('/journal')}
                  className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 hover:bg-white/15 px-2.5 py-2 rounded-xl border border-white/10 transition-colors text-left cursor-pointer"
                >
                  <BookOpen size={13} className="text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Strengths Journal</span>
                </button>
                <button
                  onClick={() => navigate('/mitigations')}
                  className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 hover:bg-white/15 px-2.5 py-2 rounded-xl border border-white/10 transition-colors text-left cursor-pointer"
                >
                  <Zap size={13} className="text-amber-400 flex-shrink-0" />
                  <span className="truncate">Self-Management</span>
                </button>
                <button
                  onClick={() => navigate('/maslow')}
                  className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 hover:bg-white/15 px-2.5 py-2 rounded-xl border border-white/10 transition-colors text-left cursor-pointer"
                >
                  <ShieldCheck size={13} className="text-rose-400 flex-shrink-0" />
                  <span className="truncate">Maslow Compass</span>
                </button>
                <button
                  onClick={() => setShowAtmaModal(true)}
                  className="flex items-center gap-1.5 text-xs text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-2 rounded-xl border border-amber-400/30 transition-colors text-left cursor-pointer"
                >
                  <span className="text-xs">🪷</span>
                  <span className="truncate">आत्मज्ञान Creed</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Hero Card: Wellness Pulse (Balanced Bento Box Companion) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <WellnessPulse 
              score={profile?.wellbeingScore || 72} 
              onBreathe={() => setShowBreathingModal(true)}
              onExportBlueprint={() => setShowBlueprintModal(true)}
              className="h-full"
            />
          </div>

        </section>

        {/* 16 Personalities Typology Profile (if available) */}
        {sixteenType && (
          <section>
            <SixteenTypeCard sixteenType={sixteenType} />
          </section>
        )}

        {/* ========================================================
            TODAY'S FOCUS (Core daily loop visible above the fold!)
           ======================================================== */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Target size={16} />
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                Today's Focus
              </h2>
            </div>
            <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              3 Mindful Activities
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <DailyQuestCard onClick={() => navigate('/quests')} />
            <SkillArenaCard onClick={() => navigate('/arena')} />
            <MentorCard onClick={() => navigate('/mentor')} />
          </div>
        </section>

        {/* ========================================================
            KAYA KALPA: PHYSICAL VITALITY & CIRCADIAN SANCTUARY (Bento Banner)
           ======================================================== */}
        <section>
          <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/25 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                  <span>🌿</span>
                  <span>काया कल्प • PHYSICAL VITALITY & CIRCADIAN SLEEP</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  90-Min Sleep Cycles & Adolescent Growth Rhythm
                </h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  Calculate optimal bedtime windows to wake up refreshed at the top of a cycle. Track hydration, safe adolescent growth velocity without numbers anxiety, and sync smartwatches over local Bluetooth.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/vitality')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs md:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Moon size={16} />
                  <span>Open Kaya Kalpa Sanctuary</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            JOURNEY & ARCHETYPE DEEP DIVE (Secondary exploration)
           ======================================================== */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp size={16} />
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                Your Journey
              </h2>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-slate-600 font-bold text-xs hover:text-slate-900 transition-colors flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 shadow-2xs cursor-pointer"
            >
              Full Profile <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <ProfileCard 
              archetype={profile?.archetype?.name || "The Explorer"} 
              topCareer={profile?.topCareer?.role || "Game Designer"}
              onClick={() => navigate('/dashboard')}
            />
            <InsightsCard 
              strengths={profile?.strengths?.slice(0, 3) || ["Curious", "Adaptable", "Strategic"]}
              insights={[
                "You've shown 15% improvement in self-awareness this week.",
                "Creative problem solving is your emerging superpower. Keep it up!",
              ]}
              onClick={() => navigate('/dashboard')}
            />
          </div>
        </section>

        {/* ========================================================
            ACHIEVEMENTS & MILESTONES
           ======================================================== */}
        <section className="pb-4">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Trophy size={16} />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              Recent Wins
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x hide-scrollbar">
            {[
              { condition: true, icon: '🚀', title: 'Liftoff', desc: 'Joined PRERNA' },
              { condition: !!profile, icon: '🧠', title: 'Self Aware', desc: 'Profile generated' },
              { condition: sessions.some(s => s.type === 'life_quest'), icon: '🎯', title: 'First Quest', desc: 'Completed Life Quest' },
              { condition: sessions.some(s => s.type === 'ai_chat'), icon: '💬', title: 'Seeker', desc: 'First AI chat' },
              { condition: sessions.some(s => s.type === 'skill_arena'), icon: '⚡', title: 'Arena Contender', desc: 'Entered Skill Arena' },
              { condition: streak && streak.longestStreak > 2, icon: '🔥', title: `${streak.longestStreak} Day Streak`, desc: 'Consistent check-ins' },
            ].filter(a => a.condition).map((achievement, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -2 }}
                className="snap-start flex-shrink-0 w-40 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-xl mb-3 shadow-2xs">
                  {achievement.icon}
                </div>
                <h4 className="text-slate-900 font-bold mb-0.5 text-xs">{achievement.title}</h4>
                <p className="text-slate-500 font-medium text-[11px] leading-snug">{achievement.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Narrative Insight */}
        {profile && (
          <section className="pb-6">
            <InsightNarrativeView profile={profile} />
          </section>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 px-4 py-2 md:hidden z-50 shadow-lg">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {[
            { id: '/', icon: Sparkles, label: 'Home' },
            { id: '/evolution', icon: Compass, label: 'Evolve' },
            { id: '/quests', icon: Target, label: 'Quest' },
            { id: '/arena', icon: Zap, label: 'Arena' },
            { id: '/mentor', icon: MessageCircle, label: 'Mentor' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${
                window.location.pathname === item.id 
                    ? 'text-indigo-600 bg-indigo-50 font-bold' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} strokeWidth={window.location.pathname === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

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

      {/* Atma-Jnana Origin & Philosophy Modal */}
      <AtmaJnanaOriginModal
        isOpen={showAtmaModal}
        onClose={() => setShowAtmaModal(false)}
      />

      {/* Meet the Developer Modal */}
      <AboutDeveloperModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
      />
    </div>
  );
};
