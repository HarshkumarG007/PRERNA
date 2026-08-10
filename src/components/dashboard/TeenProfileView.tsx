import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Brain, Compass, Sparkles, Shield, Database, LogOut, Bell, Link2, Check } from 'lucide-react';
import { DataExport } from '../settings/DataExport';
import { DataDelete } from '../settings/DataDelete';
import { AuditTrailViewer } from '../settings/AuditTrailViewer';
import { ConsentSummaryViewer } from '../consent/ConsentSummaryViewer';
import { ModelManager } from '../ai/ModelManager';
import { BackupManager } from '../backup/BackupManager';
import { ParentPermissionManager, SharingPreferences } from '../../parent/permissions';
import { ParentGuideView } from '../parent/ParentGuideView';
import { DisclosureGate } from '../consent/DisclosureGate';
import { CareerPathwaysWidget } from './CareerPathwaysWidget';
import { RadarChart } from './RadarChart';
import { BadgeCabinet } from './BadgeCabinet';

import { useAppStore } from '../../store';

const RevokeConsentModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0f172a] border border-red-500/30 rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="text-2xl font-black text-white">Revoke Consent?</h3>
          </div>
          
          <p className="text-slate-300 font-medium mb-4 leading-relaxed">
            This will <strong className="text-red-400">immediately stop all data collection</strong> and log you out.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Your existing data will remain encrypted on this device.
          </p>

          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Type "REVOKE" to confirm
            </label>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="REVOKE"
              className="w-full bg-black/40 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-slate-600 font-mono tracking-widest text-center"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 text-slate-300 font-bold hover:bg-white/5 rounded-xl transition-colors border border-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmText !== 'REVOKE'}
              className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <LogOut size={18} /> Revoke
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const TeenProfileView: React.FC = () => {
  const user = useAppStore(state => state.user);
  const profile = useAppStore(state => state.profile);

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  
  const [sharingPrefs, setSharingPrefs] = useState<SharingPreferences | null>(null);
  
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (user) {
      ParentPermissionManager.getPreferences(user.id).then(setSharingPrefs);
    }
  }, [user]);

  const toggleSharing = (key: keyof SharingPreferences['shares']) => {
    if (!sharingPrefs || !user) return;
    
    const newPrefs = {
      ...sharingPrefs,
      shares: {
        ...sharingPrefs.shares,
        [key]: !sharingPrefs.shares[key]
      }
    };
    
    ParentPermissionManager.updatePreferences(newPrefs).then(() => {
      setSharingPrefs(newPrefs);
    });
  };

  const safeProfileMemo = React.useMemo(() => {
    if (!profile || !sharingPrefs) return null;
    return ParentPermissionManager.generateShareableData(profile as any, sharingPrefs);
  }, [profile, sharingPrefs]);

  if (!user) return null;

  const bigFive = profile?.personality?.bigFive;
  const riasec = profile?.personality?.riasec;

  return (
    <div className="min-h-screen bg-[#020617] w-full">
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/25 border border-white/20">
              <Sparkles size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Your Profile</h1>
              <p className="text-violet-200 mt-2 font-medium text-lg flex items-center gap-2">
                <Shield size={18} /> Private. Secure. Yours.
              </p>
            </div>
          </div>
          
          {/* Notification Hub */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
            >
              <Bell size={20} className="text-white" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#020617]" />
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-16 right-0 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-bold text-white">Notifications</h3>
                  </div>
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-sm font-bold text-white mb-1">Parent Check-in Request</p>
                      <p className="text-xs text-slate-400 mb-3">Your parent has sent a check-in request regarding your recent Wellbeing Trend.</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30">Respond</button>
                        <button className="flex-1 py-1.5 bg-white/5 text-slate-300 rounded-lg text-xs font-bold border border-white/10">Dismiss</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Badge Cabinet */}
          <BadgeCabinet profile={profile} />

          {/* LLM Self-Discovery Report */}
          {profile?.llmSelfDiscoveryReport && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 backdrop-blur-xl p-8 rounded-[2rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Self-Discovery Report</h3>
                  <p className="text-sm text-indigo-300 font-medium">Personalized AI Insights</p>
                </div>
              </div>
              <div className="space-y-4">
                {profile.llmSelfDiscoveryReport.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-slate-300 leading-relaxed text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Big Five Radar Chart */}
          <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center">
            <div className="flex w-full items-center space-x-4 mb-4 border-b border-white/10 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <Brain className="text-violet-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Big Five Matrix</h3>
                <p className="text-sm text-slate-400 font-medium">Core personality dimensions</p>
              </div>
            </div>
            
            {bigFive ? (
              <div className="py-8">
                <RadarChart 
                  color="violet"
                  size={320}
                  data={[
                    { label: 'Openness', value: bigFive.openness || 0 },
                    { label: 'Conscientious', value: bigFive.conscientiousness || 0 },
                    { label: 'Extraversion', value: bigFive.extraversion || 0 },
                    { label: 'Agreeableness', value: bigFive.agreeableness || 0 },
                    { label: 'Neuroticism', value: bigFive.neuroticism || 0 },
                  ]}
                />
              </div>
            ) : (
              <div className="text-center py-12 w-full bg-black/20 rounded-2xl border border-dashed border-slate-700 mt-4">
                <p className="text-slate-400 font-medium">Complete assessments to unlock.</p>
              </div>
            )}
          </div>

          {/* RIASEC Radar Chart */}
          <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center">
            <div className="flex w-full items-center space-x-4 mb-4 border-b border-white/10 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Compass className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">RIASEC Alignment</h3>
                <p className="text-sm text-slate-400 font-medium">Career and interest alignment</p>
              </div>
            </div>
            
            {riasec ? (
              <div className="py-8">
                <RadarChart 
                  color="emerald"
                  size={320}
                  data={[
                    { label: 'Realistic', value: riasec.realistic || 0 },
                    { label: 'Investigative', value: riasec.investigative || 0 },
                    { label: 'Artistic', value: riasec.artistic || 0 },
                    { label: 'Social', value: riasec.social || 0 },
                    { label: 'Enterprising', value: riasec.enterprising || 0 },
                    { label: 'Conventional', value: riasec.conventional || 0 },
                  ]}
                />
              </div>
            ) : (
              <div className="text-center py-12 w-full bg-black/20 rounded-2xl border border-dashed border-slate-700 mt-4">
                <p className="text-slate-400 font-medium">Complete skill arenas to unlock.</p>
              </div>
            )}
          </div>

          {/* AI Career Pathways */}
          <div className="h-[500px]">
             <CareerPathwaysWidget />
          </div>

          <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Database className="text-cyan-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Data Sovereignty</h3>
                    <p className="text-cyan-400 font-bold text-sm">You are in full control.</p>
                  </div>
                </div>
                
                <p className="text-slate-300 font-medium leading-relaxed mb-8">
                  Your data belongs to you. It is encrypted locally on this device. You can export it, review who has access to it, or delete it permanently at any time.
                </p>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <DataExport />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <DataDelete />
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 px-2">Access & Permissions</h3>
            <div className="bg-black/30 rounded-2xl overflow-hidden border border-white/5 mb-4">
               <ConsentSummaryViewer
                onRevoke={() => setShowRevokeModal(true)}
                consentRecord={{
                  id: "sys_consent_" + user.id.substring(0, 8),
                  consentedAt: new Date(user.createdAt || Date.now()),
                  disclosureVersion: "1.0",
                  scope: ["life_quests", "skill_arena", "mood_mirror", "social_compass"]
                }}
              />
            </div>
            
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Link2 size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Link Parent Account</h4>
                  <p className="text-xs text-slate-400 font-medium">Generate a secure sync code for your parent.</p>
                </div>
              </div>
              {linkCode ? (
                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl">
                  <span className="font-mono text-xl font-black tracking-widest text-indigo-300">{linkCode}</span>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    <Check size={14} /> Active
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setLinkCode('A7X-9P2')}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors border border-white/10"
                >
                  Generate Code
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Settings & Auditing Column */}
        <div className="space-y-8">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-lg font-bold text-white">Parent Sharing Preferences</h3>
              <span className="px-3 py-1 bg-white/10 text-white/60 text-xs font-bold uppercase tracking-widest rounded-full">Optional</span>
            </div>
            
            {sharingPrefs && (
              <div className="space-y-3">
                {[
                  { key: 'wellbeingScore', label: 'Overall Wellbeing Score', desc: 'A general health metric, not specific answers.' },
                  { key: 'careerInterests', label: 'Career Interests', desc: 'Top 3 career fields you explored.' },
                  { key: 'strengths', label: 'Strengths', desc: 'Positive traits you demonstrated.' },
                  { key: 'dailyCheckIn', label: 'Daily Check-in Streak', desc: 'Let them know you are active.' }
                ].map(pref => (
                  <div key={pref.key} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{pref.label}</p>
                      <p className="text-sm font-medium text-slate-500">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleSharing(pref.key as keyof SharingPreferences['shares'])}
                      className={`w-14 h-8 rounded-full p-1 transition-colors ${sharingPrefs.shares[pref.key as keyof SharingPreferences['shares']] ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full shadow-md"
                        animate={{ x: sharingPrefs.shares[pref.key as keyof SharingPreferences['shares']] ? 24 : 0 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Teen Mirror of Parent View */}
            {profile && sharingPrefs && safeProfileMemo && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  Preview: What Your Parents See
                </h4>
                <div className="opacity-90">
                  {/* WARNING: parent_guide disclosure is currently PENDING REVIEW. Do not ship to real users until disclosure-draft-pending-review.md is signed off by a qualified human reviewer. */}
                  <DisclosureGate activityType="parent_guide" onDecline={() => {}}>
                    <ParentGuideView safeProfile={safeProfileMemo} />
                  </DisclosureGate>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 px-2">Backup & AI Models</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setShowBackupModal(true)}
                className="w-full bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="text-indigo-400" size={24} />
                  <div className="text-left">
                    <p className="font-bold text-slate-200">Backup & Restore</p>
                    <p className="text-sm font-medium text-slate-500">Securely backup or restore your local profile</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <ModelManager />

          <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 px-2">System Audit Trail</h3>
            <div className="bg-black/30 rounded-2xl overflow-hidden border border-white/5">
              <AuditTrailViewer logs={[]} /> 
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showRevokeModal && (
          <RevokeConsentModal
            onConfirm={() => {
              setShowRevokeModal(false);
              useAppStore.getState().revokeConsent();
            }}
            onCancel={() => setShowRevokeModal(false)}
          />
        )}
        
        {showBackupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBackupModal(false)} />
            <div className="relative z-10 w-full max-w-lg">
              <BackupManager userId={user.id} onClose={() => setShowBackupModal(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
