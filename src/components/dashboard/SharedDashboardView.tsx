import React from 'react';
import { BigFiveProfile } from '../../engine/assessment/bigFive';
import { RiasecProfile } from '../../engine/assessment/riasec';
import { Brain, Compass, HeartPulse } from 'lucide-react';

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
      <div className="glass-panel p-8">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
          <Brain className="w-8 h-8 text-indigo-500" />
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Decision-Making Style (Big Five)</h3>
        </div>
        {data.bigFive ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">Openness</div>
              <div className="text-3xl font-black text-indigo-600 group-hover:scale-110 transition-transform">{data.bigFive.openness}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-1">Conscientious</div>
              <div className="text-3xl font-black text-blue-600 group-hover:scale-110 transition-transform">{data.bigFive.conscientiousness}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-purple-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">Extraversion</div>
              <div className="text-3xl font-black text-purple-600 group-hover:scale-110 transition-transform">{data.bigFive.extraversion}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-teal-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-teal-400 font-bold mb-1">Agreeableness</div>
              <div className="text-3xl font-black text-teal-600 group-hover:scale-110 transition-transform">{data.bigFive.agreeableness}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-rose-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">Neuroticism</div>
              <div className="text-3xl font-black text-rose-600 group-hover:scale-110 transition-transform">{data.bigFive.neuroticism}</div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-500">Not enough Life Quests data yet.</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-8">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
          <Compass className="w-8 h-8 text-emerald-500" />
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Skill Arena Profile (RIASEC)</h3>
        </div>
        {data.riasec ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Realistic</div>
              <div className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data.riasec.realistic}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Investigate</div>
              <div className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data.riasec.investigative}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Artistic</div>
              <div className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data.riasec.artistic}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Social</div>
              <div className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data.riasec.social}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Enterprise</div>
              <div className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data.riasec.enterprising}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow group">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Convention</div>
              <div className="text-2xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data.riasec.conventional}</div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-500">Not enough Skill Arena data yet.</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-8">
        <div className="flex items-center space-x-3 mb-2">
          <HeartPulse className="w-8 h-8 text-rose-500 animate-pulse-soft" />
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Mood Mirror Activity</h3>
        </div>
        <p className="text-sm text-slate-600 font-medium pl-11">
          {data.lastMoodLog 
            ? `Last check-in was on ${data.lastMoodLog.toLocaleDateString()}` 
            : 'No check-ins recorded yet.'}
        </p>
      </div>
    </div>
  );
};
