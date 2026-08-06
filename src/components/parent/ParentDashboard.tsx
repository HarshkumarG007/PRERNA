import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, MessageCircle, Shield, Settings, ChevronRight, ArrowLeft } from 'lucide-react';
import { ParentSafeProfile, ParentPermissionManager } from '../../parent/permissions';
import { invoke } from '@tauri-apps/api/core';

interface ParentDashboardProps {
  teenId: string; // The teen being viewed
  onExit: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ teenId, onExit }) => {
  const [profile, setProfile] = useState<ParentSafeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'settings'>('overview');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState<string>('');

  useEffect(() => {
    loadParentView();
  }, [teenId]);

  const loadParentView = async () => {
    try {
      const response: any = await invoke('get_parent_view', { 
        request: { teen_id: teenId, parent_id: 'parent-123' }
      });

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
          conversationStarters: [
            'I noticed your interest in these new areas. Tell me more?',
            'I see your strengths shining through lately.',
            'How can I support you better this week?'
          ]
        };
        setProfile(safeProfile);
      }
    } catch (e) {
      console.error("Failed to load parent view from backend:", e);
      // Fallback to mock data if backend fails
      const mockProfile: ParentSafeProfile = {
        lastUpdated: new Date().toISOString(),
        teenName: 'Your Teen',
        wellbeing: {
          score: 72,
          trend: 'stable',
          interpretation: 'Doing well - some areas to nurture',
        },
        careerInterests: [
          { field: 'Technology', role: 'AI/ML Engineer', why: 'Strong logical reasoning suits complex problem-solving' },
          { field: 'Design', role: 'UX Designer', why: 'Creative approach to novel solutions' },
        ],
        strengths: ['Analytical problem-solving', 'Creative ideation', 'Understanding others'],
        lastActive: new Date().toISOString(),
        checkInStreak: 5,
        conversationStarters: [
          'I noticed you\'re interested in Technology. Want to tell me more about what draws you to it?',
          'I\'ve seen how you understand others. That\'s a real gift. How do you feel about it?',
          'I want to support you better. What\'s one thing I could do differently?',
        ],
      };
      setProfile(mockProfile);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Shield size={64} className="text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Data Shared Yet</h2>
          <p className="text-gray-500 mb-6">Your teen hasn't set up sharing preferences.</p>
          <button onClick={onExit} className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-bold">
            Exit Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onExit} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-wider transition-colors">
            <ArrowLeft size={16} /> Exit to Main App
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-800 mb-1">Parent Dashboard</h1>
              <p className="text-gray-500 font-medium">Connected to {profile.teenName}</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active now
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="max-w-4xl mx-auto px-4">
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
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {activeTab === 'overview' && <OverviewTab profile={profile} />}
        {activeTab === 'conversations' && <ConversationsTab profile={profile} />}
        {activeTab === 'settings' && (
          <SettingsTab teenId={teenId} onRequestAccess={requestMoreAccess} />
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

// Sub-components
const OverviewTab: React.FC<{ profile: ParentSafeProfile }> = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Wellbeing Card */}
      {profile.wellbeing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 md:col-span-2"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Heart className="text-emerald-600" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-xl">Wellbeing</h3>
                <p className="text-sm font-medium text-gray-500">{profile.wellbeing.interpretation}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-emerald-600">{profile.wellbeing.score}</div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">/ 100</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
            <TrendingUp size={18} className="text-emerald-500" />
            <span className="text-gray-600 font-medium">Trend: </span>
            <span className={`font-bold ${
              profile.wellbeing.trend === 'improving' ? 'text-emerald-600' :
              profile.wellbeing.trend === 'declining' ? 'text-amber-600' :
              'text-gray-600'
            }`}>
              {profile.wellbeing.trend.charAt(0).toUpperCase() + profile.wellbeing.trend.slice(1)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Activity */}
      {profile.lastActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-gray-800 text-xl mb-1">Activity</h3>
            <p className="text-sm font-medium text-gray-500">
              Last active: {new Date(profile.lastActive).toLocaleDateString()}
            </p>
          </div>
          {profile.checkInStreak && profile.checkInStreak > 0 && (
            <div className="text-center mt-6">
              <div className="text-5xl font-black text-orange-500 mb-2">{profile.checkInStreak}</div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Day Streak 🔥</span>
            </div>
          )}
        </motion.div>
      )}
    </div>

    {/* Career Interests */}
    {profile.careerInterests && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
      >
        <h3 className="font-black text-gray-800 text-xl mb-6">Emerging Interests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.careerInterests.map((interest, idx) => (
            <div key={idx} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                {idx === 0 ? '🌟' : idx === 1 ? '💫' : '✨'}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">{interest.role}</h4>
                <p className="text-sm font-medium text-indigo-600 mb-2">{interest.field}</p>
                <p className="text-sm text-gray-600 font-medium">{interest.why}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
          <p className="text-sm text-indigo-800 font-medium flex items-center gap-2">
            💡 These are exploratory interests, not commitments. Support their curiosity!
          </p>
        </div>
      </motion.div>
    )}

    {/* Strengths */}
    {profile.strengths && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
      >
        <h3 className="font-black text-gray-800 text-xl mb-6">Noticed Strengths</h3>
        <div className="flex flex-wrap gap-3">
          {profile.strengths.map((strength) => (
            <span
              key={strength}
              className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm"
            >
              {strength}
            </span>
          ))}
        </div>
      </motion.div>
    )}
  </div>
);

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
  teenId: string;
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
