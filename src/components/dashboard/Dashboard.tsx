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
  Printer
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

export const Dashboard: React.FC = () => {
  const user = useUser();
  const profile = useProfile();
  const isOnline = useNetworkStatus();
  const { loadProfile, sessions, streak } = useAppStore();
  const [greeting, setGreeting] = useState('');
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-10">
      {/* Background Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 md:px-12 md:pt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-md shadow-indigo-100/50">
              <PrernaEmblem size={44} animate={true} />
            </div>
            <div>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-0.5">{greeting}</p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {getFirstName()}
                {!isOnline && (
                  <span className="flex items-center gap-1 text-xs font-bold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <WifiOff size={12} />
                    Offline Mode
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StreakTracker />
            <button 
              onClick={() => navigate('/dashboard')}
              aria-label="View profile"
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
            >
              <User className="text-slate-600" size={22} />
            </button>
          </div>
        </div>
      </header>
      <main className="relative z-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Wellness Pulse */}
          <WellnessPulse score={profile?.wellbeingScore || 72} />

          {/* 16 Personalities Typology Profile */}
          {sixteenType && (
            <section>
              <SixteenTypeCard sixteenType={sixteenType} />
            </section>
          )}

          {/* Self-Evolution Sanctuary & Strengths Journal */}
          <section>
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate('/evolution')}
              className="cursor-pointer bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 border border-indigo-700/40 shadow-lg relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider border border-indigo-400/20">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span>Actual vs. Improvised Self</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    Self-Evolution Sanctuary & Strengths Journal
                  </h3>
                  <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
                    Explore your current archetype baseline vs. your self-actualized potential. Track superpower moments, face friction edges with dignity, and master 6 behavioral mitigation tools.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-emerald-400">100% Private & Local</span>
                    <span className="text-[11px] text-slate-400">DPDP Act Compliant</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white text-indigo-950 flex items-center justify-center font-bold shadow-md group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={22} />
                  </div>
                </div>
              </div>

              {/* 5 feature badges */}
              <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-200 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <Compass size={14} className="text-indigo-400 flex-shrink-0" />
                  <span>Actual vs Evolved</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <BookOpen size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Strengths Journal</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <Zap size={14} className="text-amber-400 flex-shrink-0" />
                  <span>Self-Management</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <ShieldCheck size={14} className="text-rose-400 flex-shrink-0" />
                  <span>Maslow Compass</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-500/15 px-3 py-2 rounded-xl border border-amber-400/30">
                  <span className="text-xs">🪷</span>
                  <span>आत्मज्ञान Creed</span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Quick Growth Action Bar: 432 Hz Breath & Blueprint Export */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Grounding & Portfolio</span>
              <span className="text-xs font-bold text-slate-800">Quick Growth Actions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowBreathingModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors border border-emerald-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Wind size={15} className="text-emerald-600" />
                <span>432 Hz Breath Pacer</span>
              </button>
              <button
                onClick={() => setShowBlueprintModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer size={15} className="text-indigo-600" />
                <span>Export Life Blueprint (PDF)</span>
              </button>
            </div>
          </div>

          {/* Atma-Jnana Foundational Creed Card */}
          <section>
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-7 border border-amber-400/30 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm shadow-amber-400/10">
                  🪷
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      The Soul of PRERNA • संत कबीर दास
                    </span>
                    <span className="text-xs text-slate-400">Founder's Creed</span>
                  </div>
                  <p className="text-white font-serif text-sm md:text-base italic">
                    "जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी... सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                  </p>
                  <p className="text-amber-200/90 text-xs font-semibold">
                    Core Ideology: <strong>Self Realisation is God's Realisation</strong> (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है)
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/origin')}
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold transition-all border border-amber-400/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Read Genesis</span>
                <ChevronRight size={14} className="text-amber-300" />
              </button>
            </div>
          </section>

          {/* Daily Focus */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Target size={24} className="text-indigo-600" />
                Today's Focus
              </h2>
              <span className="text-slate-500 font-bold text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200">3 activities</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DailyQuestCard onClick={() => navigate('/quests')} />
              <SkillArenaCard onClick={() => navigate('/arena')} />
              <MentorCard onClick={() => navigate('/mentor')} />
            </div>
          </section>

          {/* Progress Overview */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp size={24} className="text-emerald-600" />
                Your Journey
              </h2>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors flex items-center gap-1 bg-white px-4 py-1.5 rounded-full border border-slate-200/80 hover:border-slate-300 shadow-sm"
              >
                Full Profile <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Achievements */}
          <section className="pb-10">
            <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              Recent Wins
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
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
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="snap-start flex-shrink-0 w-44 p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">
                    {achievement.icon}
                  </div>
                  <h4 className="text-slate-900 font-bold mb-1 text-sm">{achievement.title}</h4>
                  <p className="text-slate-500 font-medium text-xs">{achievement.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* AI Narrative Insight */}
          {profile && (
            <section className="pb-10">
              <div className="mb-8">
                <InsightNarrativeView profile={profile} />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 px-6 py-2.5 md:hidden z-50 shadow-lg">
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
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                window.location.pathname === item.id 
                    ? 'text-indigo-600 bg-indigo-50 font-bold' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <item.icon size={22} strokeWidth={window.location.pathname === item.id ? 2.5 : 2} />
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
    </div>
  );
};
