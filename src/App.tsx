import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useI18n } from './engine/localization/i18n';

// Import all components we built
import { AgeDeclaration } from './components/consent/AgeDeclaration';
import { ParentConsentFlow } from './components/consent/ParentConsentFlow';
import { BetaOnboardingNotice } from './components/consent/BetaOnboardingNotice';
import { LifeQuests } from './components/activities/LifeQuests';
import { SkillArena } from './components/activities/SkillArena';
import { MoodMirror } from './components/activities/MoodMirror';
import { SocialCompass } from './components/activities/SocialCompass';
import { AiMentorChat } from './components/mentor/AiMentorChat';
import { TeenProfileView } from './components/dashboard/TeenProfileView';
import { SharedDashboardView } from './components/dashboard/SharedDashboardView';
import { Dashboard } from './components/dashboard/Dashboard';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { useAppStore } from './store';

// Dummy context for demo for older components that haven't been migrated yet
const mockUserId = 'user_123';
const mockContext = { name: 'Demo User', bigFive: { openness: 60, conscientiousness: 70, extraversion: 50, agreeableness: 80, neuroticism: 40 } };
const mockDashboardData = { userId: mockUserId, bigFive: mockContext.bigFive, riasec: { realistic: 30, investigative: 40, artistic: 80, social: 70, enterprising: 20, conventional: 10 }, lastMoodLog: new Date() };

function App() {
  const { language, setLanguage } = useI18n();
  const { isAuthenticated, isLoading, login, user } = useAppStore();

  useEffect(() => {
    // Check for existing session
    const init = async () => {
      const lastUser = localStorage.getItem('prerna_last_user');
      if (lastUser) {
        try {
          await login(lastUser);
        } catch (error) {
          // Invalid session, clear it
          localStorage.removeItem('prerna_last_user');
        }
      }
    };

    init();
  }, [login]);

  // We don't use handleAuthenticated directly anymore, it's handled by AuthModal -> Zustand

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    // We pass an empty function or let AuthModal handle the state completely via Zustand
    return <WelcomeScreen onAuthenticated={() => {}} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-black tracking-tight text-indigo-700 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                PRERNA
              </h1>
              <nav className="hidden md:flex space-x-6 text-sm font-semibold">
                <Link to="/beta" className="text-slate-600 hover:text-indigo-600 transition-colors">Beta Consent</Link>
                <Link to="/quests" className="text-slate-600 hover:text-indigo-600 transition-colors">Life Quests</Link>
                <Link to="/arena" className="text-slate-600 hover:text-indigo-600 transition-colors">Skill Arena</Link>
                <Link to="/mood" className="text-slate-600 hover:text-indigo-600 transition-colors">Mood Mirror</Link>
                <Link to="/social" className="text-slate-600 hover:text-indigo-600 transition-colors">Social Compass</Link>
                <Link to="/mentor" className="text-slate-600 hover:text-indigo-600 transition-colors">AI Mentor</Link>
                <Link to="/profile" className="text-slate-600 hover:text-indigo-600 transition-colors">Teen Dash</Link>
                <Link to="/parent-dash" className="text-slate-600 hover:text-indigo-600 transition-colors">Parent Dash</Link>
              </nav>
            </div>
          <div>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold transition-colors border border-indigo-100"
            >
              Language: {language === 'en' ? 'EN' : 'HI'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 flex flex-col">
        <div className="flex-grow w-full mx-auto animate-fade-in-up">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beta" element={<BetaOnboardingNotice onAccept={() => alert('Accepted Beta')} />} />
          <Route path="/quests" element={<div className="max-w-7xl mx-auto"><LifeQuests userId={user.id} /></div>} />
          <Route path="/arena" element={<div className="max-w-7xl mx-auto"><SkillArena userId={user.id} /></div>} />
          <Route path="/mood" element={<div className="max-w-7xl mx-auto"><MoodMirror userId={user.id} /></div>} />
          <Route path="/social" element={<div className="max-w-7xl mx-auto"><SocialCompass userId={user.id} /></div>} />
          <Route path="/mentor" element={<div className="max-w-7xl mx-auto"><AiMentorChat userId={user.id} userContext={mockContext as any} /></div>} />
          <Route path="/dashboard" element={<TeenProfileView data={mockDashboardData as any} />} />
          <Route path="/profile" element={<TeenProfileView data={mockDashboardData as any} />} />
          <Route path="/parent-dash" element={<ParentDashboard teenId={user.id} onExit={() => window.location.href='/'} />} />
        </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
