import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UnifiedProfile, ProfileFusionEngine } from '../../synthesis/fusionEngine';
import { TraitProfile } from '../../assessment/engine';
import { CognitiveProfile } from '../../assessment/skills/engine';
import { Sparkles, Target, Brain, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface ProfileDashboardProps {
  userId: string;
  personalityProfile: TraitProfile | null;
  cognitiveProfile: CognitiveProfile | null;
  onExit: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  userId,
  personalityProfile,
  cognitiveProfile,
  onExit
}) => {
  const [unifiedProfile, setUnifiedProfile] = useState<UnifiedProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'learning' | 'actions'>('overview');

  useEffect(() => {
    if (personalityProfile && cognitiveProfile) {
      const engine = new ProfileFusionEngine(personalityProfile, cognitiveProfile);
      const profile = engine.synthesize(userId);
      setUnifiedProfile(profile);
      
      // Save it to backend
      invoke('save_unified_profile', {
        userId,
        profileData: JSON.stringify(profile)
      }).catch(console.error);
    }
  }, [userId, personalityProfile, cognitiveProfile]);

  if (!unifiedProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          <p>Synthesizing your complete profile...</p>
        </div>
      </div>
    );
  }

  const { archetype, topCareer, learningProfile, wellbeingScore, strengths, growthAreas, recommendedActions } = unifiedProfile;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <Sparkles className="text-yellow-400" size={32} />
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">
                Your Complete Profile
              </h1>
            </motion.div>
            <p className="text-white/60 font-medium">Generated {new Date(unifiedProfile.generatedAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors border border-white/10"
          >
            Close Synthesis
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: Brain },
            { id: 'career', label: 'Career Path', icon: Target },
            { id: 'learning', label: 'Learning Style', icon: BookOpen },
            { id: 'actions', label: 'Action Plan', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-900 shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6 pb-20">
          {activeTab === 'overview' && (
            <OverviewTab archetype={archetype} wellbeingScore={wellbeingScore} strengths={strengths} growthAreas={growthAreas} />
          )}
          {activeTab === 'career' && <CareerTab career={topCareer} matches={unifiedProfile.careerMatches} />}
          {activeTab === 'learning' && <LearningTab profile={learningProfile} />}
          {activeTab === 'actions' && <ActionsTab actions={recommendedActions} risks={unifiedProfile.riskFactors} />}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const OverviewTab: React.FC<{
  archetype: UnifiedProfile['archetype'];
  wellbeingScore: number;
  strengths: string[];
  growthAreas: string[];
}> = ({ archetype, wellbeingScore, strengths, growthAreas }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
      
      <h2 className="text-2xl font-black text-white/50 tracking-widest uppercase mb-6">Your Archetype</h2>
      <div className="text-7xl mb-6">🎭</div>
      <h3 className="text-3xl font-black text-emerald-400 mb-4">{archetype.name}</h3>
      <p className="text-white/80 text-lg mb-8 font-medium leading-relaxed">{archetype.description}</p>
      
      <div className="space-y-6">
        <div>
          <span className="text-white/50 text-sm font-bold uppercase tracking-widest">Key Traits</span>
          <div className="flex flex-wrap gap-2 mt-3">
            {archetype.traits.map((trait) => (
              <span key={trait} className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-bold border border-emerald-500/30">
                {trait}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <span className="text-white/50 text-sm font-bold uppercase tracking-widest">Famous Examples</span>
          <p className="text-white/90 text-sm mt-3 font-medium bg-white/5 p-4 rounded-xl border border-white/5">
            {archetype.famousExamples.join(', ')}
          </p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden flex flex-col"
    >
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
      
      <h2 className="text-2xl font-black text-white/50 tracking-widest uppercase mb-8">Wellbeing Score</h2>
      <div className="flex items-center justify-center mb-10">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
            <motion.circle
              cx="80" cy="80" r="70"
              stroke={wellbeingScore > 70 ? '#10b981' : wellbeingScore > 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12" fill="none"
              strokeDasharray={`${wellbeingScore * 4.4} 440`}
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 440" }}
              animate={{ strokeDasharray: `${wellbeingScore * 4.4} 440` }}
              transition={{ duration: 1.5, type: "spring" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-5xl font-black text-white">{wellbeingScore}</span>
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">/ 100</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
          <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Strengths
          </h4>
          <ul className="space-y-3">
            {strengths.slice(0, 3).map((s) => (
              <li key={s} className="text-white/80 text-sm font-medium flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
          <h4 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
            <Target size={18} /> Growth Areas
          </h4>
          <ul className="space-y-3">
            {growthAreas.slice(0, 3).map((g) => (
              <li key={g} className="text-white/80 text-sm font-medium flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span> {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  </div>
);

const CareerTab: React.FC<{
  career: UnifiedProfile['topCareer'];
  matches: UnifiedProfile['careerMatches'];
}> = ({ career, matches }) => (
  <div className="space-y-6">
    {/* Top Match */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-emerald-500/30 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 text-9xl opacity-10 blur-sm pointer-events-none">🎯</div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <span className="inline-block px-4 py-1.5 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-500/50">Top Match</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2">{career.role}</h2>
          <p className="text-emerald-400 text-xl font-bold">{career.field}</p>
        </div>
        <div className="text-left md:text-right bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="text-5xl font-black text-emerald-400 mb-1">{career.matchScore}<span className="text-2xl text-emerald-400/50">%</span></div>
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Match Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="text-emerald-400" size={20} /> Why This Fits You
          </h4>
          <ul className="space-y-4">
            {career.whyFit.map((reason, i) => (
              <li key={i} className="text-white/80 font-medium flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div> 
                {reason}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
          <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="text-blue-400" size={20} /> Indian Context
          </h4>
          <div className="space-y-4 font-medium">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-white/50 text-xs uppercase tracking-widest block mb-1">Entrance Exams</span>
              <span className="text-white">{career.indianContext.entranceExams.join(', ')}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-white/50 text-xs uppercase tracking-widest block mb-1">Top Colleges</span>
              <span className="text-white">{career.indianContext.topColleges.slice(0, 3).join(', ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/50 text-xs uppercase tracking-widest block mb-1">Salary</span>
                <span className="text-emerald-400">{career.indianContext.salaryRange}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/50 text-xs uppercase tracking-widest block mb-1">Outlook</span>
                <span className="text-blue-400">{career.indianContext.growthOutlook.split(' - ')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Other Matches */}
    <h3 className="text-xl font-bold text-white/70 px-2 mt-8">Other Strong Matches</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.slice(1, 3).map((match, idx) => (
        <motion.div
          key={match.role}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">{match.role}</h3>
              <p className="text-white/50 text-sm font-medium">{match.field}</p>
            </div>
            <div className="bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
              <span className="text-emerald-400 font-bold">{match.matchScore}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {match.whyFit.slice(0, 2).map((reason, i) => (
              <span key={i} className="text-xs font-medium text-white/70 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 line-clamp-1">
                {reason}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const LearningTab: React.FC<{ profile: UnifiedProfile['learningProfile'] }> = ({ profile }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-bl-full pointer-events-none" />
      <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
        <Brain size={28} className="text-purple-400" /> Your Learning DNA
      </h2>
      
      <div className="space-y-8">
        <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-2">Optimal Study Time</span>
          <p className="text-white font-black text-xl">{profile.optimalStudyTime}</p>
        </div>
        
        <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-end mb-3">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Natural Attention Span</span>
            <span className="text-purple-400 font-black text-xl">{profile.attentionSpan} <span className="text-sm font-medium text-purple-400/70">min</span></span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(profile.attentionSpan / 60) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>
        
        <div>
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-4">Best Learning Modes</span>
          <div className="flex flex-wrap gap-3">
            {profile.bestLearningModes.map((mode) => (
              <span key={mode} className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-xl text-sm font-bold border border-purple-500/30">
                {mode}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
    >
      <h2 className="text-2xl font-black text-white mb-8">Study Strategies</h2>
      
      <div className="space-y-8">
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
          <h4 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
            <BookOpen size={20} /> Retention Techniques
          </h4>
          <ul className="space-y-4">
            {profile.retentionStrategies.map((strategy) => (
              <li key={strategy} className="text-white/90 font-medium flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
                {strategy}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
          <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <Zap size={20} /> Motivation Triggers
          </h4>
          <ul className="space-y-4">
            {profile.motivationTriggers.map((trigger) => (
              <li key={trigger} className="text-white/90 font-medium flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                {trigger}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  </div>
);

const ActionsTab: React.FC<{
  actions: UnifiedProfile['recommendedActions'];
  risks: UnifiedProfile['riskFactors'];
}> = ({ actions, risks }) => (
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Risk Alerts */}
    {risks.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-amber-400" size={24} />
          <h3 className="text-amber-400 font-black text-xl">Attention Needed</h3>
        </div>
        <div className="space-y-4">
          {risks.map((risk, idx) => (
            <div key={idx} className="bg-black/20 p-4 rounded-xl border border-amber-500/10">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-2 ${
                risk.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {risk.category} Risk • {risk.severity}
              </span>
              <p className="text-white/90 font-medium mb-1">{risk.indicator}</p>
              <p className="text-white/50 text-sm">Action: {risk.recommendedIntervention}</p>
            </div>
          ))}
        </div>
      </motion.div>
    )}

    {/* Action Items */}
    <div className="grid grid-cols-1 gap-4">
      {actions.map((action, idx) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors group"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${
                  action.category === 'daily' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                  action.category === 'weekly' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                  action.category === 'monthly' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                }`}>
                  {action.category} Action
                </span>
                <span className={`text-xs font-bold ${
                  action.difficulty === 'easy' ? 'text-emerald-400' :
                  action.difficulty === 'medium' ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {action.difficulty.toUpperCase()}
                </span>
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{action.title}</h4>
              <p className="text-white/60 font-medium mb-4">{action.description}</p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-4 py-2 rounded-xl inline-flex border border-emerald-500/20">
                <span>🎯</span> Expected: {action.expectedOutcome}
              </div>
            </div>
            <div className="text-left md:text-right bg-black/20 px-4 py-3 rounded-xl border border-white/5">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1">Time Req</span>
              <span className="text-white font-bold">{action.estimatedTime}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
