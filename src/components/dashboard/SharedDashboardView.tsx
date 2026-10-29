import React, { useState } from 'react';
import { ShieldCheck, Eye, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { UnifiedProfile } from '../../synthesis/fusionEngine';
import { ParentPermissionManager, ParentSafeProfile, SharingPreferences } from '../../parent/permissions';

export interface DashboardData {
  userId?: string;
  bigFive?: any;
  riasec?: any;
  lastMoodLog?: Date | null;
}

export interface SharedDashboardProps {
  data?: DashboardData;
  profile?: UnifiedProfile;
  initialPreferences?: SharingPreferences;
  onPreferencesChange?: (prefs: SharingPreferences) => void;
}

export const SharedDashboardView: React.FC<SharedDashboardProps> = ({
  data,
  profile,
  initialPreferences,
  onPreferencesChange,
}) => {
  const [activePerspective, setActivePerspective] = useState<'teen' | 'parent' | 'parity'>('parity');

  // Provide realistic fallback data if profile not passed
  const currentProfile: any = profile || {
    userId: data?.userId || 'teen-current-user',
    generatedAt: new Date().toISOString(),
    personality: {
      bigFive: data?.bigFive || {
        openness: 82,
        conscientiousness: 68,
        extraversion: 74,
        agreeableness: 80,
        neuroticism: 38,
      },
      riasec: data?.riasec || {
        realistic: 45,
        investigative: 78,
        artistic: 85,
        social: 72,
        enterprising: 60,
        conventional: 40,
      },
      emotional: {
        resilience: 75,
        empathy: 82,
        emotionalAwareness: 80,
        impulseControl: 70,
        socialIntuition: 75,
      },
    },
    cognition: {
      logicalReasoning: 78,
      verbalFluency: 84,
      spatialIntelligence: 70,
      creativeDivergence: 88,
      processingSpeed: 75,
      workingMemory: 72,
      learningStyle: 'visual',
    },
    careerMatches: [
      {
        field: 'Space Sciences & Astrophysics',
        role: 'Research Scientist',
        confidence: 0.92,
        whyFit: ['High Investigative curiosity paired with strong creative divergence'],
        pathways: ['IISc Bengaluru', 'ISRO / IIST'],
        category: 'academic',
      },
      {
        field: 'Digital Product Design & HCI',
        role: 'Creative Technologist',
        confidence: 0.88,
        whyFit: ['High Artistic expression and visual learning style'],
        pathways: ['NID Ahmedabad', 'IIT Bombay IDC'],
        category: 'creative_tech',
      },
      {
        field: 'Public Policy & Developmental Economics',
        role: 'Policy Researcher',
        confidence: 0.84,
        whyFit: ['Strong social empathy and verbal fluency'],
        pathways: ['St. Stephen’s College', 'JNU / DSE'],
        category: 'social_impact',
      },
    ],
    strengths: ['Intellectual Curiosity', 'Empathetic Perspective Taking', 'Creative Divergence', 'Analytical Focus'],
    growthAreas: ['Balancing deep focus with regular rest intervals'],
    wellbeingScore: 78,
    riskFactors: [],
    confidenceScore: 0.89,
  };

  const [preferences, setPreferences] = useState<SharingPreferences>(
    initialPreferences || {
      userId: currentProfile.userId,
      lastUpdated: new Date().toISOString(),
      shares: {
        wellbeingScore: true,
        careerInterests: true,
        strengths: true,
        dailyCheckIn: true,
        concerns: false,
      },
      requiresApproval: {
        fullProfile: true,
        chatHistory: true,
        riskAlerts: true,
      },
    }
  );

  const toggleShare = (key: keyof SharingPreferences['shares']) => {
    const updated: SharingPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
      shares: {
        ...preferences.shares,
        [key]: !preferences.shares[key],
      },
    };
    setPreferences(updated);
    if (onPreferencesChange) {
      onPreferencesChange(updated);
    }
  };

  // Derive the exact single-query parent safe profile
  const parentData: ParentSafeProfile = ParentPermissionManager.generateShareableData(
    currentProfile,
    preferences
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in-up" data-testid="shared-dashboard-view">
      {/* Transparency Guarantee Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> DPDP Section 9 Invariant
              </span>
              <span className="text-xs text-indigo-200">Single Source of Truth</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Shared Self-Discovery Transparency
            </h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl leading-relaxed">
              In PRERNA, what you see is exactly what your parent sees. There is zero secret surveillance,
              no covert behavioral tracking, and no silent divergence between views.
            </p>
          </div>

          {/* Perspective Selector */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActivePerspective('parity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePerspective === 'parity'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Side-by-Side Parity
            </button>
            <button
              onClick={() => setActivePerspective('teen')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePerspective === 'teen'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Teen Perspective
            </button>
            <button
              onClick={() => setActivePerspective('parent')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePerspective === 'parent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Parent Perspective
            </button>
          </div>
        </div>
      </div>

      {/* Teen Control Granular Permissions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Sharing Controls</h3>
            <p className="text-xs text-slate-500">
              You decide which growth metrics to share with your linked guardian.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Consent Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'wellbeingScore', label: 'Wellbeing Score', val: preferences.shares.wellbeingScore },
            { key: 'careerInterests', label: 'Career Exploration', val: preferences.shares.careerInterests },
            { key: 'strengths', label: 'Positive Strengths', val: preferences.shares.strengths },
            { key: 'dailyCheckIn', label: 'Daily Streak', val: preferences.shares.dailyCheckIn },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => toggleShare(item.key as any)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                item.val
                  ? 'border-indigo-300 bg-indigo-50/60 text-indigo-900'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">{item.label}</span>
                <span className="text-[11px] opacity-80">{item.val ? 'Shared' : 'Private'}</span>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.val ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {item.val ? '✓' : '—'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison Panels */}
      <div
        className={`grid gap-6 ${
          activePerspective === 'parity' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Teen View Column */}
        {(activePerspective === 'teen' || activePerspective === 'parity') && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6" data-testid="teen-view-panel">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Teen Self-Discovery View</h3>
                  <p className="text-xs text-slate-500">Your full personal growth journey</p>
                </div>
              </div>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                Full Profile
              </span>
            </div>

            {/* Big Five Dimensions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Big Five Personality Traits
              </h4>
              <div className="space-y-3">
                {Object.entries(currentProfile.personality.bigFive).map(([trait, val]) => (
                  <div key={trait}>
                    <div className="flex justify-between text-xs font-bold mb-1 capitalize">
                      <span className="text-slate-700">{trait}</span>
                      <span className="text-indigo-600">{Number(val)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${Number(val)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Discovered Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {(currentProfile.strengths || []).map((str: string) => (
                  <span
                    key={str}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" /> {str}
                  </span>
                ))}
              </div>
            </div>

            {/* Career Matches */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Explored Career Pathways
              </h4>
              <div className="space-y-2">
                {(currentProfile.careerMatches || []).map((c: any) => (
                  <div key={c.field} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block">{c.field}</span>
                    <span className="text-slate-500">{c.role} • {c.whyFit?.[0] || 'Aligned'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Parent View Column */}
        {(activePerspective === 'parent' || activePerspective === 'parity') && (
          <div className="bg-slate-50/80 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6" data-testid="parent-view-panel">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Linked Guardian View</h3>
                  <p className="text-xs text-slate-500">Filtered strictly by teen sharing choices</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Supportive Framing
              </span>
            </div>

            {/* Wellbeing */}
            {parentData.wellbeing ? (
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overall Wellbeing
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    {parentData.wellbeing.score}/100
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {parentData.wellbeing.interpretation}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-white/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                Wellbeing score kept private by teen
              </div>
            )}

            {/* Strengths Shared */}
            {parentData.strengths ? (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Recognized Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parentData.strengths.map((str) => (
                    <span
                      key={str}
                      className="px-3 py-1 bg-white text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {str}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Career Interests Shared */}
            {parentData.careerInterests ? (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  What Your Teen Is Curious About
                </h4>
                <div className="space-y-2">
                  {parentData.careerInterests.map((c) => (
                    <div key={c.field} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-900 block">{c.field}</span>
                      <span className="text-slate-600">{c.role} — {c.why}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Conversation Starters (India culturally tailored) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Meaningful Conversation Starters
              </h4>
              <div className="space-y-2">
                {parentData.conversationStarters.slice(0, 2).map((starter, i) => (
                  <div
                    key={i}
                    className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 italic"
                  >
                    "{starter}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
