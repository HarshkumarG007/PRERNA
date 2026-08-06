import React from 'react';
import { BigFiveProfile } from '../../engine/assessment/bigFive';
import { RiasecProfile } from '../../engine/assessment/riasec';
import { Brain, Compass, HeartPulse } from 'lucide-react';
import { ModelManager } from '../ai/ModelManager';
import { MentorChat } from '../ai/MentorChat';

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
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* AI Mentor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ModelManager />
          <div className="h-full min-h-[600px]">
            <MentorChat userId={data.userId} />
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center space-x-3 mb-4 border-b border-slate-100 pb-4">
              <Brain className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Big Five</h3>
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
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500 text-center py-4">No data yet.</p>
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
