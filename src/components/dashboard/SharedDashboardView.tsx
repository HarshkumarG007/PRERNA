import React from 'react';
import { BigFiveProfile } from '../../engine/assessment/bigFive';
import { RiasecProfile } from '../../engine/assessment/riasec';
import { Brain, Compass, HeartPulse, Gamepad2, Sparkles } from 'lucide-react';
import { ModelManager } from '../ai/ModelManager';
import { MentorChat } from '../ai/MentorChat';
import { SkillArena } from '../skills/SkillArena';
import { ProfileDashboard } from '../synthesis/ProfileDashboard';
import { TeenPrivacyControls } from '../parent/TeenPrivacyControls';
import { BackupManager } from '../backup/BackupManager';
import { Shield, Settings } from 'lucide-react';
import { useState } from 'react';

export interface DashboardData {
  userId: string;
  bigFive: BigFiveProfile | null;
  riasec: RiasecProfile | null;
  lastMoodLog: Date | null;
}

interface SharedDashboardViewProps {
  data: DashboardData;
}

export const SharedDashboardView: React.FC<SharedDashboardViewProps> = ({ data }) => {
  const [showArena, setShowArena] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  if (showBackup) {
    return <BackupManager userId={data.userId} onClose={() => setShowBackup(false)} />;
  }

  if (showPrivacy) {
    return <TeenPrivacyControls userId={data.userId} onClose={() => setShowPrivacy(false)} />;
  }

  if (showArena) {
    return <SkillArena onExit={() => setShowArena(false)} />;
  }
  
  if (showSynthesis) {
    // Inject mock data for demonstration
    const mockPersonality = {
      bigFive: { openness: 85, conscientiousness: 60, extraversion: 45, agreeableness: 75, neuroticism: 40 },
      riasec: { realistic: 30, investigative: 70, artistic: 85, social: 60, enterprising: 50, conventional: 35 },
      emotional: { resilience: 70, empathy: 80, emotionalAwareness: 75, impulseControl: 65, socialIntuition: 70 },
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    };
    
    const mockCognitive = {
      logicalReasoning: 75,
      verbalFluency: 90,
      spatialIntelligence: 60,
      creativeDivergence: 85,
      processingSpeed: 70,
      workingMemory: 75,
      learningStyle: 'visual' as const,
    };
    
    return <ProfileDashboard 
      userId={data.userId} 
      personalityProfile={mockPersonality} 
      cognitiveProfile={mockCognitive} 
      onExit={() => setShowSynthesis(false)} 
    />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* AI Mentor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ModelManager />
          <div className="h-full min-h-[600px]">
            <MentorChat />
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center space-x-3 mb-4 border-b border-slate-100 pb-4">
              <Brain className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Big Five</h3>
            </div>
            
            <div className="space-y-2 mb-6">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Shield size={16} /> Privacy Settings
              </button>
              
              <button 
                onClick={() => setShowBackup(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Settings size={16} /> Backup & Sync
              </button>
            </div>
            
            {data.bigFive ? (
              <div className="space-y-4">
                {Object.entries(data.bigFive).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                      <span className="text-slate-500">{trait}</span>
                      <span className="text-indigo-600">{score}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500 text-center py-4">No data yet.</p>
            )}
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center space-x-3 mb-4 border-b border-slate-100 pb-4">
              <Compass className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">RIASEC</h3>
            </div>
            {data.riasec ? (
              <div className="space-y-4">
                {Object.entries(data.riasec).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                      <span className="text-slate-500">{trait}</span>
                      <span className="text-emerald-600">{score}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowSynthesis(true)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles size={18} />
                  View Full Synthesis
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm font-medium text-slate-500 mb-4">No cognitive data yet.</p>
                <button 
                  onClick={() => setShowArena(true)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Gamepad2 size={18} />
                  Enter Skill Arena
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center space-x-3 mb-2">
              <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse-soft" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Mood</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-2">
              {data.lastMoodLog 
                ? `Last check-in: ${data.lastMoodLog.toLocaleDateString()}` 
                : 'No check-ins recorded yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
