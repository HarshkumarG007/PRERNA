import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { LogOut, HeartHandshake, Menu, X, Lock } from 'lucide-react';
import { useI18n, LANGUAGE_NAMES, Language } from './engine/localization/i18n';

import { BetaOnboardingNotice } from './components/consent/BetaOnboardingNotice';
import { Dashboard } from './components/dashboard/Dashboard';
import { ResourceSurface } from './components/crisis/ResourceSurface';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { LoadingScreen } from './components/common/LoadingScreen';
import { PrernaLogo } from './components/common/PrernaLogo';
import { SanctuaryFooter } from './components/common/SanctuaryFooter';
import { PersonaAuthModal } from './components/security/PersonaAuthModal';
import { PartnersGateModal } from './components/partners/auth/PartnersGateModal';
import { deriveSixteenType } from './engine/assessment/sixteenPersonalities';
import { somaticAudio } from './utils/audioSynthesis';
import { usePartnerStore } from './store/partnerStore';
import { useAppStore } from './store';

// Lazy-loaded Persona Dashboards & Modular Subsystems
const AdultDashboard = lazy(() => import('./components/adult/AdultDashboard').then(m => ({ default: m.AdultDashboard })));
const PartnersDashboard = lazy(() => import('./components/partners/dashboard/PartnersDashboard').then(m => ({ default: m.PartnersDashboard })));
const ParentDashboard = lazy(() => import('./components/parent/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const SchoolDashboard = lazy(() => import('./components/school/SchoolDashboard').then(m => ({ default: m.SchoolDashboard })));
const RoleSelection = lazy(() => import('./components/onboarding/RoleSelection').then(m => ({ default: m.RoleSelection })));
const ParentLinking = lazy(() => import('./components/onboarding/ParentLinking').then(m => ({ default: m.ParentLinking })));
const SelfDiscoveryJourney = lazy(() => import('./components/assessment/SelfDiscoveryJourney').then(m => ({ default: m.SelfDiscoveryJourney })));

// Lazy-loaded Activities & Sanctuaries
const LifeQuests = lazy(() => import('./components/activities/LifeQuests').then(m => ({ default: m.LifeQuests })));
const SkillArena = lazy(() => import('./components/skills/SkillArena').then(m => ({ default: m.SkillArena })));
const MoodMirror = lazy(() => import('./components/activities/MoodMirror').then(m => ({ default: m.MoodMirror })));
const SocialCompass = lazy(() => import('./components/activities/SocialCompass').then(m => ({ default: m.SocialCompass })));
const AiMentorChat = lazy(() => import('./components/mentor/AiMentorChat').then(m => ({ default: m.AiMentorChat })));
const TeenProfileView = lazy(() => import('./components/dashboard/TeenProfileView').then(m => ({ default: m.TeenProfileView })));
const SharedDashboardView = lazy(() => import('./components/dashboard/SharedDashboardView').then(m => ({ default: m.SharedDashboardView })));
const SelfEvolutionSanctuary = lazy(() => import('./components/growth/SelfEvolutionSanctuary').then(m => ({ default: m.SelfEvolutionSanctuary })));
const KayaKalpaSanctuary = lazy(() => import('./components/vitality/KayaKalpaSanctuary').then(m => ({ default: m.KayaKalpaSanctuary })));
const SomaticBreathingCompanion = lazy(() => import('./components/growth/SomaticBreathingCompanion').then(m => ({ default: m.SomaticBreathingCompanion })));
const LifeBlueprintExport = lazy(() => import('./components/growth/LifeBlueprintExport').then(m => ({ default: m.LifeBlueprintExport })));

// Lazy-loaded Clinical Portal
const ClinicianLogin = lazy(() => import('./components/clinical/ClinicianLogin').then(m => ({ default: m.ClinicianLogin })));
const ReviewDashboard = lazy(() => import('./components/clinical/ReviewDashboard').then(m => ({ default: m.ReviewDashboard })));

// Lazy-loaded Modals
const AtmaJnanaOriginModal = lazy(() => import('./components/common/AtmaJnanaOriginModal').then(m => ({ default: m.AtmaJnanaOriginModal })));
const AboutDeveloperModal = lazy(() => import('./components/common/AboutDeveloperModal').then(m => ({ default: m.AboutDeveloperModal })));
const BetaFeedbackModal = lazy(() => import('./components/beta/BetaFeedbackModal').then(m => ({ default: m.BetaFeedbackModal })));
const ProductShowcaseModal = lazy(() => import('./components/showcase/ProductShowcaseModal').then(m => ({ default: m.ProductShowcaseModal })));
const MultiPersonaTourModal = lazy(() => import('./components/showcase/MultiPersonaTourModal').then(m => ({ default: m.MultiPersonaTourModal })));
const DataSovereigntyModal = lazy(() => import('./components/governance/DataSovereigntyModal').then(m => ({ default: m.DataSovereigntyModal })));

// Peaceful fallback loader for suspended chunks
const SanctuaryLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center" role="status" aria-label="Loading sanctuary">
    <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-3" />
    <p className="text-xs text-slate-500 font-medium tracking-wide">अवतरण · Loading Sanctuary...</p>
  </div>
);

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
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showBetaFeedback, setShowBetaFeedback] = useState(false);
  const [showProductShowcase, setShowProductShowcase] = useState(false);
  const [showPersonaTour, setShowPersonaTour] = useState(false);
  const [showDataGovernance, setShowDataGovernance] = useState(false);
  const [showPartnersGateModal, setShowPartnersGateModal] = useState(false);
  const [isInPartnersView, setIsInPartnersView] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connection: partnerConnection } = usePartnerStore();

  const handleRoleAuthorize = (targetRole: 'teen' | 'adult' | 'parent' | 'educator') => {
    usePartnerStore.getState().lockGate();
    setIsInPartnersView(false);
    updateRole(targetRole);
    if (targetRole === 'parent') {
      localStorage.setItem('prerna_parent_linked', 'true');
      setParentLinked(true);
    }
    setShowPersonaModal(false);
  };

  const handleTourPersonaSelect = (targetRole: 'teen' | 'adult' | 'parent' | 'educator') => {
    setShowPersonaTour(false);
    if (targetRole === user?.role) return;
    // Always require cryptographic identity verification to switch persona
    setShowPersonaModal(true);
  };

  const handleLogout = () => {
    usePartnerStore.getState().lockGate();
    setIsInPartnersView(false);
    logout();
  };

  useEffect(() => {
    // Check if user came from a tour link
    if (window.location.search.includes('tour=true') || window.location.pathname === '/tour') {
      setShowPersonaTour(true);
    }

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
      <Suspense fallback={<SanctuaryLoader />}>
        <RoleSelection 
          onSelectTeen={() => updateRole('teen')} 
          onSelectAdult={() => updateRole('adult')}
          onSelectParent={() => updateRole('parent')} 
          onSelectEducator={() => updateRole('educator')} 
        />
      </Suspense>
    );
  }

  // Teen must complete the deep questionnaire on first login
  if (isAuthenticated && user && user.role === 'teen' && !user.hasCompletedQuestionnaire) {
    return (
      <Suspense fallback={<SanctuaryLoader />}>
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
      </Suspense>
    );
  }

  if (isAuthenticated && user && user.role === 'parent' && !parentLinked) {
    return (
      <Suspense fallback={<SanctuaryLoader />}>
        <ParentLinking 
          onLinkSuccess={() => {
            localStorage.setItem('prerna_parent_linked', 'true');
            setParentLinked(true);
          }} 
          onBack={() => updateRole(undefined as any)} 
        />
      </Suspense>
    );
  }

  if (isAuthenticated && user && user.role === 'parent' && parentLinked) {
    // Parents get the dedicated Parent Sanctuary Hub with header & footer!
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2.5 md:px-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0" title="PRERNA Sanctuary">
                <PrernaLogo variant="compact" size="sm" />
              </Link>
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Parent Sanctuary Hub
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setShowPersonaTour(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                title="Interactive Tour of All 4 Personas"
              >
                <span>✨ Ecosystem Tour</span>
              </button>
              <button
                onClick={() => setShowPersonaModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                title="Switch persona to Teen or Educator"
              >
                <span>👨‍👩‍👧 Parent View</span>
                <span className="text-[10px] text-indigo-500 font-normal hidden sm:inline">(Switch)</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          <Suspense fallback={<SanctuaryLoader />}>
            <ParentDashboard onExit={() => setShowPersonaModal(true)} />
          </Suspense>
        </main>
        <SanctuaryFooter 
          onOpenBetaFeedback={() => setShowBetaFeedback(true)}
          onOpenProductShowcase={() => setShowProductShowcase(true)}
          onOpenPersonaTour={() => setShowPersonaTour(true)}
          onOpenDataGovernance={() => setShowDataGovernance(true)}
        />

        <Suspense fallback={null}>
          <PersonaAuthModal
            isOpen={showPersonaModal}
            onClose={() => setShowPersonaModal(false)}
            onAuthorize={handleRoleAuthorize}
          />

          {showBetaFeedback && (
            <BetaFeedbackModal
              isOpen={showBetaFeedback}
              onClose={() => setShowBetaFeedback(false)}
            />
          )}

          {showProductShowcase && (
            <ProductShowcaseModal
              isOpen={showProductShowcase}
              onClose={() => setShowProductShowcase(false)}
            />
          )}

          {showPersonaTour && (
            <MultiPersonaTourModal
              isOpen={showPersonaTour}
              onClose={() => setShowPersonaTour(false)}
              onSelectPersona={handleTourPersonaSelect}
              currentRole={user.role}
            />
          )}

          {showDataGovernance && (
            <DataSovereigntyModal
              isOpen={showDataGovernance}
              onClose={() => setShowDataGovernance(false)}
            />
          )}
        </Suspense>
      </div>
    );
  }

  if (isAuthenticated && user && user.role === 'adult') {
    if (isInPartnersView) {
      return (
        <Suspense fallback={<SanctuaryLoader />}>
          <PartnersDashboard onQuickExit={() => setIsInPartnersView(false)} />
        </Suspense>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2.5 md:px-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0" title="PRERNA Sanctuary">
                <PrernaLogo variant="compact" size="sm" />
              </Link>
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Adult Sanctuary
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setShowPersonaTour(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                title="Interactive Tour of All 4 Personas"
              >
                <span>✨ Ecosystem Tour</span>
              </button>
              <button
                onClick={() => {
                  if (partnerConnection.isActivated && !partnerConnection.isGateLocked) {
                    setIsInPartnersView(true);
                  } else {
                    setShowPartnersGateModal(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                title="Enter PRERNA for Partners"
              >
                <Lock size={12} className={partnerConnection.isGateLocked ? "text-rose-500" : "text-emerald-500"} />
                <span>❤️ Partners</span>
              </button>
              <button
                onClick={() => setShowPersonaModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                title="Switch persona"
              >
                <span>👤 Adult View</span>
                <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">(Switch)</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          <Suspense fallback={<SanctuaryLoader />}>
            <AdultDashboard 
              onEnterPartners={() => setIsInPartnersView(true)} 
              onSwitchPersona={() => setShowPersonaModal(true)} 
            />
          </Suspense>
        </main>
        <SanctuaryFooter 
          onOpenBetaFeedback={() => setShowBetaFeedback(true)}
          onOpenProductShowcase={() => setShowProductShowcase(true)}
          onOpenPersonaTour={() => setShowPersonaTour(true)}
          onOpenDataGovernance={() => setShowDataGovernance(true)}
        />

        <Suspense fallback={null}>
          <PersonaAuthModal
            isOpen={showPersonaModal}
            onClose={() => setShowPersonaModal(false)}
            onAuthorize={handleRoleAuthorize}
          />

          {showBetaFeedback && (
            <BetaFeedbackModal
              isOpen={showBetaFeedback}
              onClose={() => setShowBetaFeedback(false)}
            />
          )}

          {showProductShowcase && (
            <ProductShowcaseModal
              isOpen={showProductShowcase}
              onClose={() => setShowProductShowcase(false)}
            />
          )}

          <PartnersGateModal
            isOpen={showPartnersGateModal}
            onClose={() => setShowPartnersGateModal(false)}
            onUnlocked={() => {
              setShowPartnersGateModal(false);
              setIsInPartnersView(true);
            }}
          />

          {showPersonaTour && (
            <MultiPersonaTourModal
              isOpen={showPersonaTour}
              onClose={() => setShowPersonaTour(false)}
              onSelectPersona={handleTourPersonaSelect}
              currentRole={user.role}
            />
          )}

          {showDataGovernance && (
            <DataSovereigntyModal
              isOpen={showDataGovernance}
              onClose={() => setShowDataGovernance(false)}
            />
          )}
        </Suspense>
      </div>
    );
  }

  if (isAuthenticated && user && user.role === 'educator') {
    // Educators get the enterprise School Dashboard
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2.5 md:px-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0" title="PRERNA Sanctuary">
                <PrernaLogo variant="compact" size="sm" />
              </Link>
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                School Analytics
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setShowPersonaTour(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                title="Interactive Tour of All 4 Personas"
              >
                <span>✨ Ecosystem Tour</span>
              </button>
              <button
                onClick={() => setShowPersonaModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                title="Switch persona to Teen or Parent"
              >
                <span>🎓 Educator View</span>
                <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">(Switch)</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          <Suspense fallback={<SanctuaryLoader />}>
            <SchoolDashboard onSwitchPersona={() => setShowPersonaModal(true)} />
          </Suspense>
        </main>
        <SanctuaryFooter 
          onOpenBetaFeedback={() => setShowBetaFeedback(true)}
          onOpenProductShowcase={() => setShowProductShowcase(true)}
          onOpenPersonaTour={() => setShowPersonaTour(true)}
          onOpenDataGovernance={() => setShowDataGovernance(true)}
        />

        <Suspense fallback={null}>
          <PersonaAuthModal
            isOpen={showPersonaModal}
            onClose={() => setShowPersonaModal(false)}
            onAuthorize={handleRoleAuthorize}
          />

          {showBetaFeedback && (
            <BetaFeedbackModal
              isOpen={showBetaFeedback}
              onClose={() => setShowBetaFeedback(false)}
            />
          )}

          {showProductShowcase && (
            <ProductShowcaseModal
              isOpen={showProductShowcase}
              onClose={() => setShowProductShowcase(false)}
            />
          )}

          {showPersonaTour && (
            <MultiPersonaTourModal
              isOpen={showPersonaTour}
              onClose={() => setShowPersonaTour(false)}
              onSelectPersona={handleTourPersonaSelect}
              currentRole={user.role}
            />
          )}

          {showDataGovernance && (
            <DataSovereigntyModal
              isOpen={showDataGovernance}
              onClose={() => setShowDataGovernance(false)}
            />
          )}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <header className="sticky top-0 z-40 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-3 py-2 sm:px-6">
            {/* Left: Brand / Logo - Guaranteed full clear space across all viewports */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0" title="PRERNA Sanctuary Home">
              <PrernaLogo variant="compact" size="sm" />
            </Link>
            
            {/* Right: Exactly 3 non-colliding controls (Helplines, Language, Slide Menu) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Helplines (Emergency / Support Quick Access) */}
              <Link
                to="/support"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs group cursor-pointer"
                title="Always-on confidential helplines and calming tools"
              >
                <HeartHandshake size={15} className="text-rose-600 flex-shrink-0" />
                <span className="text-xs font-bold text-rose-800 hidden sm:inline">{t('nav.support', 'Helplines')}</span>
              </Link>

              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none pl-2.5 pr-6 py-1.5 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

              {/* Universal Sliding Navigation Drawer Trigger (Icon-only 3 bars) */}
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setMobileMenuOpen(true);
                }}
                className="flex items-center justify-center p-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 border border-indigo-500 transition-all shadow-sm cursor-pointer"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Sliding Navigation Drawer (Responsive across all screen ratios & aspect sizes) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" role="dialog" aria-modal="true" aria-label="Navigation Menu">
            {/* Backdrop Blur Overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Panel from Right */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <PrernaLogo variant="compact" size="sm" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sanctuary Menu</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Persona Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 border border-indigo-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {user.name ? user.name[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{user.name || 'Aarav'}</p>
                          <p className="text-[11px] font-semibold text-indigo-600 capitalize">
                            👤 {user.role} · Sovereign Persona
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-100/70">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowPersonaModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <span>🔄 Switch Persona</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Sanctuary Explorations & Lineage */}
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                      Soul, Origin & Creator Lineage
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowAtmaModal(true);
                        }}
                        className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="text-lg mb-1">🪷</div>
                        <p className="text-xs font-bold text-amber-950 group-hover:text-amber-900">आत्मज्ञान</p>
                        <p className="text-[10px] text-amber-700 font-medium">Kabir's Soul Creed</p>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowDevModal(true);
                        }}
                        className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-left transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="text-lg mb-1">👨‍💻</div>
                        <p className="text-xs font-bold text-indigo-950 group-hover:text-indigo-900">Developer</p>
                        <p className="text-[10px] text-indigo-700 font-medium">Meet Harsh K. Gupta</p>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          somaticAudio.playSoftChime();
                          setShowPersonaTour(true);
                        }}
                        className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 text-left transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="text-lg mb-1">🧭</div>
                        <p className="text-xs font-bold text-purple-950 group-hover:text-purple-900">Ecosystem Tour</p>
                        <p className="text-[10px] text-purple-700 font-medium">4 Sovereign Personas</p>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowProductShowcase(true);
                        }}
                        className="p-3 rounded-2xl bg-violet-50 hover:bg-violet-100/80 border border-violet-200/80 text-left transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="text-lg mb-1">✨</div>
                        <p className="text-xs font-bold text-violet-950 group-hover:text-violet-900">Pitch Deck</p>
                        <p className="text-[10px] text-violet-700 font-medium">Product Showcase</p>
                      </button>
                    </div>
                  </div>

                  {/* Wellbeing & Growth Sanctuaries */}
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                      Wellbeing & Growth Sanctuaries
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Link
                        to="/quests"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🌟</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Life Quests</p>
                          <p className="text-[10px] text-slate-500">Adventures & Hero Quests</p>
                        </div>
                      </Link>

                      <Link
                        to="/arena"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">⚔️</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Skill Arena</p>
                          <p className="text-[10px] text-slate-500">Psychology & Mastery</p>
                        </div>
                      </Link>

                      <Link
                        to="/mood"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🪞</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Mood Mirror</p>
                          <p className="text-[10px] text-slate-500">Somatic Reflection</p>
                        </div>
                      </Link>

                      <Link
                        to="/social"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🧭</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Social Compass</p>
                          <p className="text-[10px] text-slate-500">Peer & Family Boundaries</p>
                        </div>
                      </Link>

                      <Link
                        to="/mentor"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🤖</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">AI Mentor</p>
                          <p className="text-[10px] text-slate-500">24/7 Sovereign Guide</p>
                        </div>
                      </Link>

                      <Link
                        to="/evolution"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🌱</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Self-Evolution</p>
                          <p className="text-[10px] text-slate-500">Archetypes & Strengths</p>
                        </div>
                      </Link>

                      <Link
                        to="/vitality"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🌿</span>
                        <div>
                          <p className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">Kaya Kalpa</p>
                          <p className="text-[10px] text-emerald-700">Circadian Sleep & Vitality</p>
                        </div>
                      </Link>

                      <Link
                        to="/breathe"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/70 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">🫁</span>
                        <div>
                          <p className="text-xs font-bold text-teal-900 group-hover:text-teal-700">432 Hz Breathe</p>
                          <p className="text-[10px] text-teal-700">Somatic Coherence Pacer</p>
                        </div>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/70 text-left transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-xl">📊</span>
                        <div>
                          <p className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">Teen Dashboard</p>
                          <p className="text-[10px] text-indigo-700">Milestones & Blueprint</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Governance & Privacy Footer */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowDataGovernance(true);
                      }}
                      className="hover:text-indigo-600 transition-colors font-semibold cursor-pointer"
                    >
                      🛡️ DPDP Act Privacy
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowBetaFeedback(true);
                      }}
                      className="hover:text-indigo-600 transition-colors font-semibold cursor-pointer"
                    >
                      💌 Beta Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      <main className="flex-grow flex flex-col">
        <div className="flex-grow w-full mx-auto animate-fade-in-up">
        <Suspense fallback={<SanctuaryLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beta" element={<BetaOnboardingNotice onAccept={() => { localStorage.setItem('prerna_beta_consented', 'true'); }} />} />
          <Route path="/quests" element={<div className="max-w-7xl mx-auto"><LifeQuests userId={user.id} /></div>} />
          <Route path="/arena" element={<div className="max-w-7xl mx-auto"><SkillArena userId={user.id} /></div>} />
          <Route path="/mood" element={<div className="max-w-7xl mx-auto"><MoodMirror userId={user.id} /></div>} />
          <Route path="/social" element={<div className="max-w-7xl mx-auto"><SocialCompass userId={user.id} /></div>} />
          <Route path="/mentor" element={<div className="max-w-7xl mx-auto"><AiMentorChat userId={user.id} /></div>} />
          <Route path="/vitality" element={<KayaKalpaSanctuary />} />
          <Route path="/sleep" element={<KayaKalpaSanctuary />} />
          <Route path="/health" element={<KayaKalpaSanctuary />} />
          <Route path="/kaya" element={<KayaKalpaSanctuary />} />
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
          <Route path="/showcase" element={<ProductShowcaseModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/pitch" element={<ProductShowcaseModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/deck" element={<ProductShowcaseModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/tour" element={<MultiPersonaTourModal isOpen={true} onClose={() => window.history.back()} onSelectPersona={handleTourPersonaSelect} currentRole={user.role} />} />
          <Route path="/feedback" element={<BetaFeedbackModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/beta-feedback" element={<BetaFeedbackModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/adult-dash" element={
            (user.role === 'adult' || user.ageRange === '18+') ? (
              <AdultDashboard 
                onEnterPartners={() => setIsInPartnersView(true)} 
                onSwitchPersona={() => setShowPersonaModal(true)} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          <Route path="/partners" element={
            (user.role === 'adult' || user.ageRange === '18+') ? (
              <PartnersDashboard onQuickExit={() => window.history.back()} />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          <Route path="/parent-dash" element={user.role === 'parent' ? <ParentDashboard onExit={() => window.location.href='/'} /> : <Navigate to="/" replace />} />
          <Route path="/school-dash" element={user.role === 'educator' ? <SchoolDashboard /> : <Navigate to="/" replace />} />
          <Route path="/clinician-portal" element={
            !clinicianAuthed ? 
              <ClinicianLogin onSuccess={() => setClinicianAuthed(true)} /> : 
              <ReviewDashboard />
          } />
        </Routes>
        </Suspense>
        </div>
      </main>

      {/* Global Sanctuary Footer & Hold the Light Anchor */}
      <SanctuaryFooter
        onOpenBetaFeedback={() => setShowBetaFeedback(true)}
        onOpenProductShowcase={() => setShowProductShowcase(true)}
        onOpenPersonaTour={() => setShowPersonaTour(true)}
        onOpenDataGovernance={() => setShowDataGovernance(true)}
      />

      <Suspense fallback={null}>
        {showAtmaModal && (
          <AtmaJnanaOriginModal
            isOpen={showAtmaModal}
            onClose={() => setShowAtmaModal(false)}
          />
        )}

        {showDevModal && (
          <AboutDeveloperModal
            isOpen={showDevModal}
            onClose={() => setShowDevModal(false)}
          />
        )}

        <PersonaAuthModal
          isOpen={showPersonaModal}
          onClose={() => setShowPersonaModal(false)}
          onAuthorize={handleRoleAuthorize}
        />

        {showBetaFeedback && (
          <BetaFeedbackModal
            isOpen={showBetaFeedback}
            onClose={() => setShowBetaFeedback(false)}
          />
        )}

        {showProductShowcase && (
          <ProductShowcaseModal
            isOpen={showProductShowcase}
            onClose={() => setShowProductShowcase(false)}
          />
        )}

        {showPersonaTour && (
          <MultiPersonaTourModal
            isOpen={showPersonaTour}
            onClose={() => setShowPersonaTour(false)}
            onSelectPersona={handleTourPersonaSelect}
            currentRole={user?.role}
          />
        )}

        {showDataGovernance && (
          <DataSovereigntyModal
            isOpen={showDataGovernance}
            onClose={() => setShowDataGovernance(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
