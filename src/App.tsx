import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { LogOut, HeartHandshake } from 'lucide-react';
import { useI18n, LANGUAGE_NAMES, Language } from './engine/localization/i18n';

import { BetaOnboardingNotice } from './components/consent/BetaOnboardingNotice';
import { LifeQuests } from './components/activities/LifeQuests';
import { SkillArena } from './components/skills/SkillArena';
import { MoodMirror } from './components/activities/MoodMirror';
import { SocialCompass } from './components/activities/SocialCompass';
import { AiMentorChat } from './components/mentor/AiMentorChat';
import { TeenProfileView } from './components/dashboard/TeenProfileView';
import { Dashboard } from './components/dashboard/Dashboard';
import { SharedDashboardView } from './components/dashboard/SharedDashboardView';
import { ResourceSurface } from './components/crisis/ResourceSurface';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { LoadingScreen } from './components/common/LoadingScreen';
import { PrernaLogo } from './components/common/PrernaLogo';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { SchoolDashboard } from './components/school/SchoolDashboard';
import { RoleSelection } from './components/onboarding/RoleSelection';
import { ParentLinking } from './components/onboarding/ParentLinking';
import { SelfDiscoveryJourney } from './components/assessment/SelfDiscoveryJourney';
import { deriveSixteenType } from './engine/assessment/sixteenPersonalities';
import { SelfEvolutionSanctuary } from './components/growth/SelfEvolutionSanctuary';
import { AtmaJnanaOriginModal } from './components/common/AtmaJnanaOriginModal';
import { AboutDeveloperModal } from './components/common/AboutDeveloperModal';
import { SomaticBreathingCompanion } from './components/growth/SomaticBreathingCompanion';
import { LifeBlueprintExport } from './components/growth/LifeBlueprintExport';
import { SanctuaryFooter } from './components/common/SanctuaryFooter';
import { ClinicianLogin } from './components/clinical/ClinicianLogin';
import { ReviewDashboard } from './components/clinical/ReviewDashboard';
import { useAppStore } from './store';

// No mock context needed anymore

function App() {
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated, isLoading, login, logout, user, updateRole } = useAppStore();
  const [parentLinked, setParentLinked] = useState(() => {
    return localStorage.getItem('prerna_parent_linked') === 'true';
  });
  const [clinicianAuthed, setClinicianAuthed] = useState(false);
  const [showAtmaModal, setShowAtmaModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

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
        onComplete={async () => {
          const fallbackProfile = {
            userId: user.id,
            generatedAt: new Date().toISOString(),
            personality: {
              bigFive: { openness: 68, conscientiousness: 72, extraversion: 64, agreeableness: 76, neuroticism: 38 },
              riasec: { realistic: 48, investigative: 78, artistic: 70, social: 72, enterprising: 58, conventional: 52 },
              emotional: { resilience: 74, empathy: 80, emotionalAwareness: 76, impulseControl: 70, socialIntuition: 72 },
            },
            cognition: {
              logicalReasoning: 78,
              verbalFluency: 74,
              spatialIntelligence: 68,
              creativeDivergence: 82,
              processingSpeed: 72,
              workingMemory: 74,
              learningStyle: 'mixed',
            },
            archetype: {
              name: 'The Navigator',
              description: 'You are an insightful and empathetic explorer with an agile, curious mind.',
              traits: ['Curious', 'Empathetic', 'Insightful']
            },
            wellbeingScore: 82,
            strengths: ['Emotional Intuition', 'Creative Problem-Solving', 'Empathy'],
            growthAreas: ['Focus Consistency', 'Boundary Setting'],
            sixteenType: deriveSixteenType({ openness: 68, conscientiousness: 72, extraversion: 64, agreeableness: 76, neuroticism: 38 }),
          };
          if (!useAppStore.getState().profile) {
            useAppStore.getState().updateProfile(fallbackProfile as any);
          }
          await useAppStore.getState().completeQuestionnaire();
        }}
      />
    );
  }

  if (isAuthenticated && user && user.role === 'parent' && !parentLinked) {
    return (
      <ParentLinking 
        onLinkSuccess={() => {
          localStorage.setItem('prerna_parent_linked', 'true');
          setParentLinked(true);
        }} 
        onBack={() => updateRole(undefined as any)} 
      />
    );
  }

  if (isAuthenticated && user && user.role === 'parent' && parentLinked) {
    // Parents don't get the teen navigation bar!
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2.5 md:px-6">
            <div className="flex items-center gap-3">
              <PrernaLogo variant="compact" size="sm" />
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                Parent Hub
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => updateRole(undefined as any)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 transition-colors shadow-sm cursor-pointer"
                title="Switch persona to Teen or Educator"
              >
                <span>👨‍👩‍👧 Parent View</span>
                <span className="text-[10px] text-indigo-500 font-normal">(Switch)</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100 cursor-pointer"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
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
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2.5 md:px-6">
            <div className="flex items-center gap-3">
              <PrernaLogo variant="compact" size="sm" />
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                School Analytics
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => updateRole(undefined as any)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-sm cursor-pointer"
                title="Switch persona to Teen or Parent"
              >
                <span>🎓 Educator View</span>
                <span className="text-[10px] text-slate-500 font-normal">(Switch)</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </header>
        <SchoolDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-3 py-2 md:px-6">
            <div className="flex items-center gap-3 xl:gap-6 min-w-0">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0" title="PRERNA Sanctuary Home">
                <PrernaLogo variant="compact" size="sm" />
              </Link>
              <nav className="hidden lg:flex items-center gap-3 xl:gap-4 text-xs xl:text-sm font-semibold min-w-0">
                <Link to="/quests" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">{t('nav.life_quests', 'Life Quests')}</Link>
                <Link to="/arena" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">{t('nav.skill_arena', 'Skill Arena')}</Link>
                <Link to="/mood" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">{t('nav.mood_mirror', 'Mood Mirror')}</Link>
                <Link to="/social" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">{t('nav.social_compass', 'Social Compass')}</Link>
                <Link to="/mentor" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">{t('nav.ai_mentor', 'AI Mentor')}</Link>
                <Link to="/evolution" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">Self-Evolution</Link>
                <Link to="/profile" className="text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap">{t('nav.profile', 'Teen Dash')}</Link>
                
                {/* Fast Access Somatic Coherence Pacer */}
                <Link 
                  to="/breathe" 
                  className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-bold flex items-center gap-1 border border-emerald-200 text-xs shadow-2xs whitespace-nowrap flex-shrink-0"
                  title="432 Hz Somatic Coherence Pacer"
                >
                  <span>🫁</span>
                  <span>Breathe</span>
                </Link>
              </nav>
            </div>
            
            {/* Right-aligned action cluster: Genesis & Developer grouped together with guaranteed gap */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Atma-Jnana Vision & Creed */}
              <button
                onClick={() => setShowAtmaModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                title="आत्मज्ञान: Origin, Kabir's Creed & Vision"
              >
                <span>🪷</span>
                <span className="hidden xl:inline">आत्मज्ञान</span>
              </button>

              {/* Developer Profile */}
              <button
                onClick={() => setShowDevModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                title="Meet the Developer: Harsh Kumar Gupta"
              >
                <span>👨‍💻</span>
                <span className="hidden xl:inline">Developer</span>
              </button>
              
              <Link
                to="/support"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs whitespace-nowrap"
                title="Always-on confidential helplines and calming tools"
              >
                <HeartHandshake size={13} className="text-rose-600" />
                <span className="hidden md:inline">{t('nav.support', 'Helplines')}</span>
              </Link>
              
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none pl-2.5 pr-6 py-1 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold transition-colors border border-indigo-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Select language"
                >
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-indigo-700">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {/* Persona Switcher Pill */}
              <button
                onClick={() => updateRole(undefined as any)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                title="Click to switch persona (Teen, Parent, or Educator)"
              >
                <span>👤 Teen</span>
                <span className="text-[10px] text-indigo-500 font-normal hidden md:inline">(Switch)</span>
              </button>

              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

      <main className="flex-grow flex flex-col">
        <div className="flex-grow w-full mx-auto animate-fade-in-up">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beta" element={<BetaOnboardingNotice onAccept={() => { localStorage.setItem('prerna_beta_consented', 'true'); }} />} />
          <Route path="/quests" element={<div className="max-w-7xl mx-auto"><LifeQuests userId={user.id} /></div>} />
          <Route path="/arena" element={<div className="max-w-7xl mx-auto"><SkillArena userId={user.id} /></div>} />
          <Route path="/mood" element={<div className="max-w-7xl mx-auto"><MoodMirror userId={user.id} /></div>} />
          <Route path="/social" element={<div className="max-w-7xl mx-auto"><SocialCompass userId={user.id} /></div>} />
          <Route path="/mentor" element={<div className="max-w-7xl mx-auto"><AiMentorChat userId={user.id} /></div>} />
          <Route path="/evolution" element={<SelfEvolutionSanctuary />} />
          <Route path="/journal" element={<SelfEvolutionSanctuary initialTab="journal" />} />
          <Route path="/mitigations" element={<SelfEvolutionSanctuary initialTab="mitigations" />} />
          <Route path="/needs" element={<SelfEvolutionSanctuary initialTab="needs" />} />
          <Route path="/maslow" element={<SelfEvolutionSanctuary initialTab="needs" />} />
          <Route path="/origin" element={<SelfEvolutionSanctuary initialTab="origin" />} />
          <Route path="/philosophy" element={<SelfEvolutionSanctuary initialTab="origin" />} />
          <Route path="/atma-jnana" element={<SelfEvolutionSanctuary initialTab="origin" />} />
          <Route path="/breathe" element={<div className="max-w-3xl mx-auto py-8 px-4"><SomaticBreathingCompanion isModal={false} /></div>} />
          <Route path="/developer" element={<div className="max-w-4xl mx-auto py-8 px-4"><AboutDeveloperModal isOpen={true} onClose={() => window.history.back()} /></div>} />
          <Route path="/about-developer" element={<div className="max-w-4xl mx-auto py-8 px-4"><AboutDeveloperModal isOpen={true} onClose={() => window.history.back()} /></div>} />
          <Route path="/blueprint" element={
            <div className="max-w-4xl mx-auto py-8 px-4">
              <LifeBlueprintExport 
                isOpen={true} 
                onClose={() => window.history.back()} 
                user={user} 
                profile={useAppStore.getState().profile} 
                sixteenType={useAppStore.getState().profile?.sixteenType || deriveSixteenType(useAppStore.getState().profile?.personality?.bigFive || { openness: 60, conscientiousness: 60, extraversion: 60, agreeableness: 60, neuroticism: 40 })} 
              />
            </div>
          } />
          <Route path="/dashboard" element={<TeenProfileView />} />
          <Route path="/profile" element={<TeenProfileView />} />
          <Route path="/shared-dashboard" element={<div className="max-w-7xl mx-auto"><SharedDashboardView /></div>} />
          <Route path="/support" element={<div className="max-w-7xl mx-auto"><ResourceSurface mode="page" /></div>} />
          <Route path="/parent-dash" element={user.role === 'parent' ? <ParentDashboard onExit={() => window.location.href='/'} /> : <Navigate to="/" replace />} />
          <Route path="/school-dash" element={user.role === 'educator' ? <SchoolDashboard /> : <Navigate to="/" replace />} />
          <Route path="/clinician-portal" element={
            !clinicianAuthed ? 
              <ClinicianLogin onSuccess={() => setClinicianAuthed(true)} /> : 
              <ReviewDashboard />
          } />
        </Routes>
        </div>
      </main>

      {/* Global Sanctuary Footer & Hold the Light Anchor */}
      <SanctuaryFooter />

      {/* Global Atma-Jnana Philosophy Modal */}
      <AtmaJnanaOriginModal
        isOpen={showAtmaModal}
        onClose={() => setShowAtmaModal(false)}
      />

      {/* Global About Developer Profile Modal */}
      <AboutDeveloperModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
      />
    </div>
  );
}

export default App;
