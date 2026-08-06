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
} from 'lucide-react';

// Sub-components
import { DailyQuestCard } from './DailyQuestCard';
import { SkillArenaCard } from './SkillArenaCard';
import { MentorCard } from './MentorCard';
import { ProfileCard } from './ProfileCard';
import { WellnessPulse } from './WellnessPulse';
import { StreakTracker } from './StreakTracker';
import { InsightsCard } from './InsightsCard';
import { useAppStore, useUser, useProfile } from '../../store';

export const Dashboard: React.FC = () => {
  const user = useUser();
  const profile = useProfile();
  const { loadProfile } = useAppStore();
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
    // In future: parse from profile or user settings
    return user?.id ? 'Explorer' : 'Guest';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans pb-20 md:pb-0">
      {/* Background Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 md:px-12 md:pt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <p className="text-white/60 font-medium text-sm mb-0.5">{greeting}</p>
              <h1 className="text-3xl font-black text-white tracking-tight">{getFirstName()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StreakTracker />
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
            >
              <User className="text-white/70" size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Wellness Pulse */}
          <WellnessPulse score={profile?.wellbeingScore || 72} />

          {/* Daily Focus */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Target size={24} className="text-violet-400" />
                Today's Focus
              </h2>
              <span className="text-white/50 font-bold text-sm bg-white/5 px-3 py-1 rounded-full border border-white/10">3 activities</span>
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
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <TrendingUp size={24} className="text-emerald-400" />
                Your Journey
              </h2>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-white/50 font-bold text-sm hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:border-white/30"
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
            <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
              <Trophy size={24} className="text-amber-400" />
              Recent Wins
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {[
                { icon: '🔥', title: '5 Day Streak', desc: 'Daily check-ins' },
                { icon: '🎯', title: 'First Quest', desc: 'Completed Life Quest' },
                { icon: '🧠', title: 'Self Aware', desc: 'Profile generated' },
                { icon: '💬', title: 'Seeker', desc: 'First AI chat' },
                { icon: '🚀', title: 'Liftoff', desc: 'Joined PRERNA' },
              ].map((achievement, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="snap-start flex-shrink-0 w-44 p-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm shadow-lg hover:border-white/20 transition-colors"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
                    {achievement.icon}
                  </div>
                  <h4 className="text-white font-bold mb-1">{achievement.title}</h4>
                  <p className="text-white/50 font-medium text-xs">{achievement.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#020617]/90 backdrop-blur-2xl border-t border-white/10 px-6 py-4 md:hidden z-50">
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
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
                window.location.pathname === item.id 
                    ? 'text-violet-400 bg-violet-500/10' 
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <item.icon size={24} strokeWidth={window.location.pathname === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
