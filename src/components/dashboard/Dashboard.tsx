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
  WifiOff
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
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAppStore, useUser, useProfile } from '../../store';

export const Dashboard: React.FC = () => {
  const user = useUser();
  const profile = useProfile();
  const isOnline = useNetworkStatus();
  const { loadProfile, sessions, streak } = useAppStore();
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

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
    </div>
  );
};
