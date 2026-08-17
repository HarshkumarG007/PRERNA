import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, MessageCircle, ArrowLeft, Settings, ChevronRight } from 'lucide-react';
import { ParentSafeProfile, ParentPermissionManager } from '../../parent/permissions';
import { DisclosureGate } from '../consent/DisclosureGate';
import { invoke } from '@tauri-apps/api/core';
import { ConversationGuides } from './ConversationGuides';
import { ParentingGuide } from './ParentingGuide';
import { ParentGuideView } from './ParentGuideView';

interface ParentDashboardProps {
  onExit: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onExit }) => {
  const [profile, setProfile] = useState<ParentSafeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'settings'>('overview');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState<string>('');

  useEffect(() => {
    loadParentView();
  }, []);

  const loadParentView = async () => {
    try {
      const response: any = await invoke('get_parent_view');

      if (response.has_access && response.profile) {
        // Hydrate with permission-based starters
        const safeProfile: ParentSafeProfile = {
          lastUpdated: response.profile.last_active,
          teenName: 'Your Teen',
          wellbeing: {
            score: response.profile.wellbeing_score,
            trend: 'stable',
            interpretation: response.profile.wellbeing_score > 60 ? 'Doing well' : 'Needs support'
          },
          careerInterests: response.profile.career_interests.map((c: string) => ({
            field: c,
            role: 'Explorer',
            why: 'Aligned with strengths'
          })),
          strengths: response.profile.strengths,
          lastActive: response.profile.last_active,
          checkInStreak: 5,
          bigFive: {
            Openness: 85,
            Conscientiousness: 70,
            Extraversion: 60,
            Agreeableness: 80,
            Neuroticism: 40
          },
          riasec: {
            Investigative: 90,
            Artistic: 85,
            Social: 70,
            Realistic: 60,
            Enterprising: 50,
            Conventional: 40
          },
          conversationStarters: [
            'I noticed your interest in these new areas. Tell me more?',
            'I see your strengths shining through lately.',
            'How can I support you better this week?'
          ]
        };
        
        
        // Use the safeProfile whether we got it from Tauri or we're running locally in a web browser
        setProfile(safeProfile);
      } else {
        // Backend returned success but no access
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to load parent view from backend (likely running in web browser):", e);
      // Fallback mock profile for web preview
      const fallbackProfile: ParentSafeProfile = {
          lastUpdated: new Date().toISOString(),
          teenName: 'Your Teen',
          wellbeing: {
            score: 85,
            trend: 'improving',
            interpretation: 'Doing well'
          },
          careerInterests: [
            { field: 'Technology', role: 'Developer', why: 'Loves problem solving' },
            { field: 'Design', role: 'UX Designer', why: 'Creative and empathetic' }
          ],
          strengths: ['Resilience', 'Curiosity', 'Empathy'],
          lastActive: new Date().toISOString(),
          checkInStreak: 5,
          bigFive: {
            Openness: 85,
            Conscientiousness: 70,
            Extraversion: 60,
            Agreeableness: 80,
            Neuroticism: 40
          },
          riasec: {
            Investigative: 90,
            Artistic: 85,
            Social: 70,
            Realistic: 60,
            Enterprising: 50,
            Conventional: 40
          },
          conversationStarters: [
            'I noticed your interest in these new areas. Tell me more?',
            'I see your strengths shining through lately.',
            'How can I support you better this week?'
          ]
      };
      setProfile(fallbackProfile);
    }
    setLoading(false);
  };

  const requestMoreAccess = (type: string) => {
    setRequestType(type);
    setShowRequestDialog(true);
  };

  const sendRequest = async () => {
    const approved = await ParentPermissionManager.requestApproval();
    
    if (approved) {
      alert('Access granted! Refreshing...');
      loadParentView();
    } else {
      alert('Your teen will review this request.');
    }
    
    setShowRequestDialog(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] p-4">
        <div className="text-center">
          <Shield size={64} className="text-white/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">No Data Shared Yet</h2>
          <p className="text-white/50 mb-6">Your teen hasn't set up sharing preferences.</p>
          <button onClick={onExit} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors">
            Exit Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto">
      {/* Ambient Frost Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="bg-[#0b1120]/80 backdrop-blur-xl shadow-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button onClick={onExit} className="text-white/50 hover:text-emerald-400 flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} /> Exit to Main App
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">Parent Dashboard</h1>
              <p className="text-emerald-400 font-medium">Connected to {profile.teenName}</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Active now
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-4">
            {[
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'conversations', label: 'Conversations', icon: MessageCircle },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 pb-20">
        {activeTab === 'overview' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Heart className="text-emerald-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">PRERNA Parenting Intelligence</h2>
                <p className="text-emerald-400/70 text-sm font-medium">Personalised for {profile.teenName}</p>
              </div>
            </div>
            <ParentingGuide
              childName={profile.teenName}
              archetype={profile.bigFive ? {
                name: 'Your Teen',
                emoji: '🌟',
                description: 'Profile derived from personality assessment.',
                coreStrengths: profile.strengths ?? [],
              } : undefined}
              bigFive={profile.bigFive as any}
              wellbeingScore={profile.wellbeing?.score || 50}
              wellbeingTrend={profile.wellbeing?.trend === 'improving' ? 'rising' : profile.wellbeing?.trend === 'declining' ? 'falling' : 'stable'}
              lastActive={profile.lastActive ? new Date(profile.lastActive).toLocaleString() : undefined}
              activityStatus={(profile.checkInStreak ?? 0) > 0 ? `Active — ${profile.checkInStreak} day check-in streak` : 'Not recently active'}
              checkInStreak={profile.checkInStreak || 0}
              strengths={profile.strengths || []}
            />

            <div className="mt-8">
              {/* WARNING: parent_guide disclosure is currently PENDING REVIEW. Do not ship to real users until disclosure-draft-pending-review.md is signed off by a qualified human reviewer. */}
              <DisclosureGate activityType="parent_guide" onDecline={() => {}}>
                <ParentGuideView safeProfile={profile} />
              </DisclosureGate>
            </div>
          </div>
        )}
        {activeTab === 'conversations' && <ConversationsTab profile={profile} />}
        {activeTab === 'settings' && (
          <SettingsTab onRequestAccess={requestMoreAccess} />
        )}
      </div>

      {/* Request Dialog */}
      {showRequestDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-black mb-2 text-gray-800">Request Access</h3>
            <p className="text-gray-600 mb-6 font-medium">
              You're requesting access to: <strong className="text-indigo-600">{requestType}</strong>
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
              <p className="text-sm text-gray-500">
                Your teen will receive a notification and can approve or decline this request. Respecting their boundaries builds trust.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRequestDialog(false)}
                className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendRequest}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-600/30"
              >
                Send Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};



const ConversationsTab: React.FC<{ profile: ParentSafeProfile }> = ({ profile }) => (
  <div className="space-y-6 max-w-2xl">
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
      <h3 className="font-black text-indigo-900 text-lg mb-2">Build Connection</h3>
      <p className="text-indigo-800 text-sm font-medium leading-relaxed">
        These conversation starters are based on {profile.teenName}'s interests and strengths. 
        Use them to connect organically. Remember: listen more than you advise.
      </p>
    </div>

    <div className="space-y-4">
      {profile.conversationStarters.map((starter, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-indigo-500 group"
        >
          <p className="text-gray-800 font-medium text-lg mb-4">{starter}</p>
          <button
            onClick={() => navigator.clipboard.writeText(starter)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-widest transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          >
            Copy to clipboard
          </button>
        </motion.div>
      ))}
    </div>
    
    <ConversationGuides profile={profile} />

    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm mt-8">
      <h4 className="font-black text-amber-800 mb-2 flex items-center gap-2">
        <span className="text-xl">💡</span> Tip
      </h4>
      <p className="text-amber-700 font-medium">
        The best conversations happen when you're curious, not corrective. 
        Focus on understanding their perspective before sharing yours.
      </p>
    </div>
  </div>
);

const SettingsTab: React.FC<{
  onRequestAccess: (type: string) => void;
}> = ({ onRequestAccess }) => (
  <div className="space-y-8 max-w-3xl">
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="font-black text-gray-800 text-xl mb-6">Current Access Level</h3>
      <div className="space-y-4">
        {[
          { label: 'Wellbeing overview', status: 'shared', icon: '✓' },
          { label: 'Career interests', status: 'shared', icon: '✓' },
          { label: 'Strengths', status: 'shared', icon: '✓' },
          { label: 'Daily activity', status: 'shared', icon: '✓' },
          { label: 'Detailed assessments', status: 'restricted', icon: '🔒' },
          { label: 'Chat history', status: 'restricted', icon: '🔒' },
          { label: 'Risk alerts', status: 'restricted', icon: '🔒' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <span className="text-gray-700 font-medium">{item.label}</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-lg flex items-center gap-2 ${
              item.status === 'shared' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}>
              {item.icon} {item.status === 'shared' ? 'Shared' : 'Restricted'}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="font-black text-gray-800 text-xl mb-2">Request Additional Access</h3>
      <p className="text-gray-500 font-medium mb-6">
        Your teen controls what they share. Requesting access sends them a notification.
      </p>
      <div className="space-y-4">
        {[
          { key: 'fullProfile', label: 'Detailed assessment results', reason: 'To better understand their strengths' },
          { key: 'riskAlerts', label: 'Wellbeing alerts', reason: 'To support them during difficult times' },
        ].map((request) => (
          <button
            key={request.key}
            onClick={() => onRequestAccess(request.key)}
            className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-100 text-left group"
          >
            <div>
              <h4 className="font-bold text-gray-800 mb-1">{request.label}</h4>
              <p className="text-sm font-medium text-gray-500">{request.reason}</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-indigo-50 transition-colors">
              <ChevronRight className="text-indigo-400 group-hover:text-indigo-600" size={20} />
            </div>
          </button>
        ))}
      </div>
    </div>

    <div className="bg-red-50 border border-red-100 rounded-3xl p-8 shadow-sm">
      <h4 className="font-black text-red-800 text-xl mb-4">Emergency Contacts</h4>
      <p className="text-red-700 font-medium mb-6">
        If you're genuinely concerned about your teen's safety, please contact:
      </p>
      <ul className="text-sm text-red-700 font-bold space-y-3">
        <li className="flex items-center gap-3 bg-red-100/50 p-3 rounded-xl">📞 iCall Psychosocial Helpline: 022-25521111</li>
        <li className="flex items-center gap-3 bg-red-100/50 p-3 rounded-xl">📞 Snehi: 91-22-2772 6778</li>
        <li className="flex items-center gap-3 bg-red-100/50 p-3 rounded-xl">📞 Vandrevala Foundation: 1860 2662 345</li>
      </ul>
    </div>
  </div>
);
