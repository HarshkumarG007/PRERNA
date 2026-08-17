import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useI18n, LANGUAGE_NAMES, Language } from './engine/localization/i18n';

import { BetaOnboardingNotice } from './components/consent/BetaOnboardingNotice';
import { LifeQuests } from './components/activities/LifeQuests';
import { SkillArena } from './components/activities/SkillArena';
import { MoodMirror } from './components/activities/MoodMirror';
import { SocialCompass } from './components/activities/SocialCompass';
import { AiMentorChat } from './components/mentor/AiMentorChat';
import { TeenProfileView } from './components/dashboard/TeenProfileView';
import { Dashboard } from './components/dashboard/Dashboard';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { SchoolDashboard } from './components/school/SchoolDashboard';
import { RoleSelection } from './components/onboarding/RoleSelection';
import { ParentLinking } from './components/onboarding/ParentLinking';
import { SelfDiscoveryJourney } from './components/assessment/SelfDiscoveryJourney';
import { ClinicianLogin } from './components/clinical/ClinicianLogin';
import { ReviewDashboard } from './components/clinical/ReviewDashboard';
import { useAppStore } from './store';

// No mock context needed anymore

function App() {
  const { language, setLanguage } = useI18n();
  const { isAuthenticated, isLoading, login, logout, user, updateRole } = useAppStore();
  const [parentLinked, setParentLinked] = useState(false);
  const [clinicianAuthed, setClinicianAuthed] = useState(false);

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

  if (isAuthenticated && user && !user.role) {
    return (
      <RoleSelection 
        onSelectTeen={() => updateRole('teen')} 
        onSelectParent={() => updateRole('parent')} 
        onSelectEducator={() => updateRole('educator')} 
      />
    );
  }

  // Teen must complete the deep questionnaire on first login
  if (isAuthenticated && user && user.role === 'teen' && !user.hasCompletedQuestionnaire) {
    return (
      <SelfDiscoveryJourney
        onComplete={() => {
          // Generate a default fallback profile if they skip
          const fallbackProfile = {
            userId: user.id,
            generatedAt: new Date().toISOString(),
            personality: {
              bigFive: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
              riasec: { realistic: 50, investigative: 50, artistic: 50, social: 50, enterprising: 50, conventional: 50 },
              emotional: { resilience: 50, empathy: 50, emotionalAwareness: 50, impulseControl: 50, socialIntuition: 50 },
            },
            archetype: {
              name: 'The Explorer',
              description: 'You are beginning your journey of self-discovery.',
              traits: ['Curious', 'Adaptable']
            },
            wellbeingScore: 70,
            strengths: ['Curiosity', 'Adaptability'],
            growthAreas: ['Focus', 'Planning'],
          };
          useAppStore.getState().updateProfile(fallbackProfile as any);
          // Update user flag directly
          useAppStore.setState((state) => ({
            user: state.user ? { ...state.user, hasCompletedQuestionnaire: true } : null
          }));
        }}
      />
    );
  }

  if (isAuthenticated && user && user.role === 'parent' && !parentLinked) {
    return <ParentLinking onLinkSuccess={() => setParentLinked(true)} onBack={() => updateRole(undefined as any)} />;
  }

  if (isAuthenticated && user && user.role === 'parent' && parentLinked) {
    // Parents don't get the teen navigation bar!
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <h1 className="text-2xl font-black tracking-tight text-indigo-700 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              PRERNA Parent Hub
            </h1>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </header>
        <ParentDashboard onExit={logout} />
      </div>
    );
  }

  if (isAuthenticated && user && user.role === 'educator') {
    // Educators get the enterprise School Dashboard
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded">PR</div>
              Enterprise Analytics
            </h1>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </header>
        <SchoolDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <div className="flex items-center space-x-8">
              <Link to="/">
                <h1 className="text-2xl font-black tracking-tight text-indigo-700 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  PRERNA
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6 text-sm font-semibold">
                <Link to="/beta" className="text-slate-600 hover:text-indigo-600 transition-colors">Beta Consent</Link>
                <Link to="/quests" className="text-slate-600 hover:text-indigo-600 transition-colors">Life Quests</Link>
                <Link to="/arena" className="text-slate-600 hover:text-indigo-600 transition-colors">Skill Arena</Link>
                <Link to="/mood" className="text-slate-600 hover:text-indigo-600 transition-colors">Mood Mirror</Link>
                <Link to="/social" className="text-slate-600 hover:text-indigo-600 transition-colors">Social Compass</Link>
                <Link to="/mentor" className="text-slate-600 hover:text-indigo-600 transition-colors">AI Mentor</Link>
                <Link to="/profile" className="text-slate-600 hover:text-indigo-600 transition-colors">Teen Dash</Link>
                <Link to="/parent-dash" className="text-slate-600 hover:text-indigo-600 transition-colors">Parent Dash</Link>
                <Link to="/school-dash" className="text-slate-600 hover:text-indigo-600 transition-colors">School Dash</Link>
              </nav>
            </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none pl-4 pr-10 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold transition-colors border border-indigo-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 flex flex-col">
        <div className="flex-grow w-full mx-auto animate-fade-in-up">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beta" element={<BetaOnboardingNotice onAccept={() => { localStorage.setItem('prerna_beta_consented', 'true'); }} />} />
          <Route path="/quests" element={<div className="max-w-7xl mx-auto"><LifeQuests userId={user.id} /></div>} />
          <Route path="/arena" element={<div className="max-w-7xl mx-auto"><SkillArena userId={user.id} /></div>} />
          <Route path="/mood" element={<div className="max-w-7xl mx-auto"><MoodMirror userId={user.id} /></div>} />
          <Route path="/social" element={<div className="max-w-7xl mx-auto"><SocialCompass userId={user.id} /></div>} />
          <Route path="/mentor" element={<div className="max-w-7xl mx-auto"><AiMentorChat userId={user.id} /></div>} />
          <Route path="/dashboard" element={<TeenProfileView />} />
          <Route path="/profile" element={<TeenProfileView />} />
          <Route path="/parent-dash" element={<ParentDashboard onExit={() => window.location.href='/'} />} />
          <Route path="/school-dash" element={<SchoolDashboard />} />
          <Route path="/clinician-portal" element={
            !clinicianAuthed ? 
              <ClinicianLogin onSuccess={() => setClinicianAuthed(true)} /> : 
              <ReviewDashboard />
          } />
        </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
