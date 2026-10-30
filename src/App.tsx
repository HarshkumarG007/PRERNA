import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { LogOut, HeartHandshake, Menu, X, Lock } from 'lucide-react';
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
import { KayaKalpaSanctuary } from './components/vitality/KayaKalpaSanctuary';
import { SanctuaryFooter } from './components/common/SanctuaryFooter';
import { ClinicianLogin } from './components/clinical/ClinicianLogin';
import { ReviewDashboard } from './components/clinical/ReviewDashboard';
import { PersonaAuthModal } from './components/security/PersonaAuthModal';
import { BetaFeedbackModal } from './components/beta/BetaFeedbackModal';
import { ProductShowcaseModal } from './components/showcase/ProductShowcaseModal';
import { MultiPersonaTourModal } from './components/showcase/MultiPersonaTourModal';
import { AdultDashboard } from './components/adult/AdultDashboard';
import { PartnersDashboard } from './components/partners/dashboard/PartnersDashboard';
import { PartnersGateModal } from './components/partners/auth/PartnersGateModal';
import { somaticAudio } from './utils/audioSynthesis';
import { usePartnerStore } from './store/partnerStore';
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
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showBetaFeedback, setShowBetaFeedback] = useState(false);
  const [showProductShowcase, setShowProductShowcase] = useState(false);
  const [showPersonaTour, setShowPersonaTour] = useState(false);
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
      <RoleSelection 
        onSelectTeen={() => updateRole('teen')} 
        onSelectAdult={() => updateRole('adult')}
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
          <ParentDashboard onExit={() => setShowPersonaModal(true)} />
        </main>
        <SanctuaryFooter 
          onOpenBetaFeedback={() => setShowBetaFeedback(true)}
          onOpenProductShowcase={() => setShowProductShowcase(true)}
          onOpenPersonaTour={() => setShowPersonaTour(true)}
        />

        <PersonaAuthModal
          isOpen={showPersonaModal}
          onClose={() => setShowPersonaModal(false)}
          onAuthorize={handleRoleAuthorize}
        />

        <BetaFeedbackModal
          isOpen={showBetaFeedback}
          onClose={() => setShowBetaFeedback(false)}
        />

        <ProductShowcaseModal
          isOpen={showProductShowcase}
          onClose={() => setShowProductShowcase(false)}
        />

        <MultiPersonaTourModal
          isOpen={showPersonaTour}
          onClose={() => setShowPersonaTour(false)}
          onSelectPersona={handleRoleAuthorize}
          currentRole={user.role}
        />
      </div>
    );
  }

  if (isAuthenticated && user && user.role === 'adult') {
    if (isInPartnersView) {
      return (
        <PartnersDashboard onQuickExit={() => setIsInPartnersView(false)} />
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
          <AdultDashboard 
            onEnterPartners={() => setIsInPartnersView(true)} 
            onSwitchPersona={() => setShowPersonaModal(true)} 
          />
        </main>
        <SanctuaryFooter 
          onOpenBetaFeedback={() => setShowBetaFeedback(true)}
          onOpenProductShowcase={() => setShowProductShowcase(true)}
          onOpenPersonaTour={() => setShowPersonaTour(true)}
        />

        <PersonaAuthModal
          isOpen={showPersonaModal}
          onClose={() => setShowPersonaModal(false)}
          onAuthorize={handleRoleAuthorize}
        />

        <BetaFeedbackModal
          isOpen={showBetaFeedback}
          onClose={() => setShowBetaFeedback(false)}
        />

        <ProductShowcaseModal
          isOpen={showProductShowcase}
          onClose={() => setShowProductShowcase(false)}
        />

        <PartnersGateModal
          isOpen={showPartnersGateModal}
          onClose={() => setShowPartnersGateModal(false)}
          onUnlocked={() => {
            setShowPartnersGateModal(false);
            setIsInPartnersView(true);
          }}
        />

        <MultiPersonaTourModal
          isOpen={showPersonaTour}
          onClose={() => setShowPersonaTour(false)}
          onSelectPersona={handleRoleAuthorize}
          currentRole={user.role}
        />
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
          <SchoolDashboard onSwitchPersona={() => setShowPersonaModal(true)} />
        </main>
        <SanctuaryFooter 
          onOpenBetaFeedback={() => setShowBetaFeedback(true)}
          onOpenProductShowcase={() => setShowProductShowcase(true)}
          onOpenPersonaTour={() => setShowPersonaTour(true)}
        />

        <PersonaAuthModal
          isOpen={showPersonaModal}
          onClose={() => setShowPersonaModal(false)}
          onAuthorize={handleRoleAuthorize}
        />

        <BetaFeedbackModal
          isOpen={showBetaFeedback}
          onClose={() => setShowBetaFeedback(false)}
        />

        <ProductShowcaseModal
          isOpen={showProductShowcase}
          onClose={() => setShowProductShowcase(false)}
        />

        <MultiPersonaTourModal
          isOpen={showPersonaTour}
          onClose={() => setShowPersonaTour(false)}
          onSelectPersona={handleRoleAuthorize}
          currentRole={user.role}
        />

        <ProductShowcaseModal
          isOpen={showProductShowcase}
          onClose={() => setShowProductShowcase(false)}
        />
      </div>
    );
  }

  // Helper for two-line stacked navigation labels (halves horizontal footprint)
  const renderStackedNav = (fullText: string) => {
    const parts = fullText.split(/[\s-]+/);
    if (parts.length >= 2) {
      return (
        <span className="flex flex-col items-center justify-center leading-none text-center">
          <span className="text-[11px] font-bold tracking-tight text-slate-700 group-hover:text-indigo-600">{parts[0]}</span>
          <span className="text-[10px] font-semibold text-slate-500 group-hover:text-indigo-600 tracking-tight mt-0.5">{parts.slice(1).join(' ')}</span>
        </span>
      );
    }
    return <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{fullText}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <header className="sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 py-1.5 md:px-5">
            {/* Left: Brand + Two-Line Stacked Nav */}
            <div className="flex items-center gap-2.5 lg:gap-3.5 min-w-0">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0" title="PRERNA Sanctuary Home">
                <PrernaLogo variant="compact" size="sm" />
              </Link>
              
              <nav className="hidden lg:flex items-center gap-1 md:gap-1.5 min-w-0">
                <Link to="/quests" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Life Quests">
                  {renderStackedNav(t('nav.life_quests', 'Life Quests'))}
                </Link>
                <Link to="/arena" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Skill Arena">
                  {renderStackedNav(t('nav.skill_arena', 'Skill Arena'))}
                </Link>
                <Link to="/mood" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Mood Mirror">
                  {renderStackedNav(t('nav.mood_mirror', 'Mood Mirror'))}
                </Link>
                <Link to="/social" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Social Compass">
                  {renderStackedNav(t('nav.social_compass', 'Social Compass'))}
                </Link>
                <Link to="/mentor" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="AI Mentor">
                  {renderStackedNav(t('nav.ai_mentor', 'AI Mentor'))}
                </Link>
                <Link to="/evolution" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Self-Evolution">
                  <span className="flex flex-col items-center justify-center leading-none text-center">
                    <span className="text-[11px] font-bold tracking-tight text-slate-700 group-hover:text-indigo-600">Self</span>
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-indigo-600 tracking-tight mt-0.5">Evolution</span>
                  </span>
                </Link>
                <Link to="/vitality" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Kaya Kalpa: Physical Vitality, Circadian Rhythm & Sleep Sanctuary">
                  <span className="flex flex-col items-center justify-center leading-none text-center">
                    <span className="text-[11px] font-bold tracking-tight text-slate-700 group-hover:text-emerald-700">Kaya</span>
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-emerald-700 tracking-tight mt-0.5">Kalpa</span>
                  </span>
                </Link>
                <Link to="/profile" className="px-2 py-1 rounded-xl hover:bg-slate-100/90 transition-colors group flex items-center justify-center flex-shrink-0" title="Teen Dash">
                  {renderStackedNav(t('nav.profile', 'Teen Dash'))}
                </Link>
                
                {/* Fast Access Somatic Coherence Pacer (Two-Line Stacked) */}
                <Link 
                  to="/breathe" 
                  className="px-2 py-1 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200/80 shadow-2xs group flex flex-col items-center justify-center flex-shrink-0"
                  title="432 Hz Somatic Coherence Pacer"
                >
                  <span className="text-[10px] font-bold leading-none flex items-center gap-0.5">
                    <span>🫁</span>
                    <span>432Hz</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 leading-none mt-0.5">Breathe</span>
                </Link>
              </nav>
            </div>
            
            {/* Right: Actions, Language, Persona & Auth (Two-Line Stacked Compact Items) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Atma-Jnana Vision & Creed */}
              <button
                onClick={() => setShowAtmaModal(true)}
                className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer group"
                title="आत्मज्ञान: Origin, Kabir's Creed & Vision"
              >
                <span className="text-[11px] leading-none">🪷</span>
                <span className="text-[9px] font-bold leading-tight text-amber-900 mt-0.5">आत्मज्ञान</span>
              </button>

              {/* Developer Profile */}
              <button
                onClick={() => setShowDevModal(true)}
                className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer group"
                title="Meet the Developer: Harsh Kumar Gupta"
              >
                <span className="text-[11px] leading-none">👨‍💻</span>
                <span className="text-[9px] font-bold leading-tight text-indigo-900 mt-0.5">Developer</span>
              </button>

              {/* Multi-Persona Ecosystem Tour */}
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setShowPersonaTour(true);
                }}
                className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer group"
                title="Ecosystem Tour: 4 Sovereign Personas"
              >
                <span className="text-[11px] leading-none">🧭</span>
                <span className="text-[9px] font-bold leading-tight text-amber-900 mt-0.5">Tour</span>
              </button>

              {/* Product Showcase & Pitch Deck */}
              <button
                onClick={() => setShowProductShowcase(true)}
                className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors shadow-2xs cursor-pointer group"
                title="Product Showcase & Pitch Deck"
              >
                <span className="text-[11px] leading-none">✨</span>
                <span className="text-[9px] font-bold leading-tight text-violet-900 mt-0.5">Showcase</span>
              </button>
              
              {/* Confidential Helplines */}
              <Link
                to="/support"
                className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs group"
                title="Always-on confidential helplines and calming tools"
              >
                <HeartHandshake size={12} className="text-rose-600" />
                <span className="text-[9px] font-bold leading-tight text-rose-800 mt-0.5">{t('nav.support', 'Helplines')}</span>
              </Link>
              
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none pl-2 pr-5 py-1.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold transition-colors border border-indigo-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Select language"
                >
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-indigo-700">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {/* Persona Switcher */}
              <button
                onClick={() => setShowPersonaModal(true)}
                className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                title="Click to securely switch persona (Teen, Parent, or Educator)"
              >
                <span className="text-[10px] font-bold leading-none">👤 Teen</span>
                <span className="text-[9px] text-indigo-500 font-normal leading-tight">(Switch)</span>
              </button>

              {/* Log out */}
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                aria-label="Log out"
              >
                <LogOut size={15} />
              </button>

              {/* Mobile Menu Toggle (screens < lg) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Toggle navigation"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer (visible when mobileMenuOpen is true on small screens) */}
          {mobileMenuOpen && (
            <div className="lg:hidden w-full border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-3 py-3 shadow-lg animate-fade-in-down">
              <div className="grid grid-cols-3 gap-2">
                <Link onClick={() => setMobileMenuOpen(false)} to="/quests" className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800">Life Quests</span>
                  <span className="text-[10px] text-slate-500">Adventures</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/arena" className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800">Skill Arena</span>
                  <span className="text-[10px] text-slate-500">Badges & XP</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/mood" className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800">Mood Mirror</span>
                  <span className="text-[10px] text-slate-500">Balance</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/social" className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800">Social Compass</span>
                  <span className="text-[10px] text-slate-500">Peers</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/mentor" className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800">AI Mentor</span>
                  <span className="text-[10px] text-slate-500">Guidance</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/evolution" className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800">Self-Evolution</span>
                  <span className="text-[10px] text-slate-500">Journal</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/vitality" className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-emerald-800">Kaya Kalpa</span>
                  <span className="text-[10px] text-emerald-600">Vitality & Sleep</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/breathe" className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200/80 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-teal-800">🫁 432Hz</span>
                  <span className="text-[10px] text-teal-600">Breathe</span>
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/profile" className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-indigo-800">Teen Dash</span>
                  <span className="text-[10px] text-indigo-600">Milestones</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowProductShowcase(true);
                  }}
                  className="p-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200/80 flex flex-col items-center text-center cursor-pointer"
                >
                  <span className="text-xs font-bold text-violet-800">✨ Showcase</span>
                  <span className="text-[10px] text-violet-600">Pitch Deck</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBetaFeedback(true);
                  }}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 flex flex-col items-center text-center cursor-pointer"
                >
                  <span className="text-xs font-bold text-emerald-800">💌 Feedback</span>
                  <span className="text-[10px] text-emerald-600">Beta Journal</span>
                </button>
              </div>
            </div>
          )}
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
          <Route path="/tour" element={<MultiPersonaTourModal isOpen={true} onClose={() => window.history.back()} onSelectPersona={handleRoleAuthorize} currentRole={user.role} />} />
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
        </div>
      </main>

      {/* Global Sanctuary Footer & Hold the Light Anchor */}
      <SanctuaryFooter
        onOpenBetaFeedback={() => setShowBetaFeedback(true)}
        onOpenProductShowcase={() => setShowProductShowcase(true)}
        onOpenPersonaTour={() => setShowPersonaTour(true)}
      />

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

      {/* Global Persona Authentication Modal */}
      <PersonaAuthModal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        onAuthorize={handleRoleAuthorize}
      />

      {/* Global Zero-Telemetry Beta Feedback Modal */}
      <BetaFeedbackModal
        isOpen={showBetaFeedback}
        onClose={() => setShowBetaFeedback(false)}
      />

      {/* Global Product Showcase & Pitch Deck Modal */}
      <ProductShowcaseModal
        isOpen={showProductShowcase}
        onClose={() => setShowProductShowcase(false)}
      />

      {/* Global Multi-Persona Ecosystem Tour Modal */}
      <MultiPersonaTourModal
        isOpen={showPersonaTour}
        onClose={() => setShowPersonaTour(false)}
        onSelectPersona={handleRoleAuthorize}
        currentRole={user.role}
      />
    </div>
  );
}

export default App;
