import React from 'react';
import { Activity, Brain } from 'lucide-react';

export const CohortAnalytics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Aggregate RIASEC */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Brain size={18} className="text-indigo-600" /> Aggregate RIASEC Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-1">N=452 (Grade 10 Cohort)</p>
          </div>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md border border-slate-200">Export CSV</span>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Social', value: 78, color: 'bg-emerald-500' },
            { label: 'Enterprising', value: 65, color: 'bg-blue-500' },
            { label: 'Investigative', value: 52, color: 'bg-indigo-500' },
            { label: 'Artistic', value: 48, color: 'bg-purple-500' },
            { label: 'Realistic', value: 34, color: 'bg-orange-500' },
            { label: 'Conventional', value: 29, color: 'bg-slate-500' }
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>{stat.label}</span>
                <span>{stat.value}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregate Wellbeing */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" /> Institutional Wellbeing Index
            </h3>
            <p className="text-xs text-slate-500 mt-1">Trailing 30 Days (School-wide)</p>
          </div>
        </div>
        
        <div className="flex items-end h-48 gap-2 mt-4">
          {[40, 45, 42, 50, 55, 60, 58, 62, 65, 70, 72, 68, 75, 78, 80].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end group relative">
              <div 
                className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-400 group-hover:opacity-100 opacity-80" 
                style={{ height: `${val}%` }} 
              />
              {/* Tooltip mock */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                Score: {val}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase">
          <span>Sept 1</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
