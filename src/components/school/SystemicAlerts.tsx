import React from 'react';
import { Users, ShieldAlert } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: 'bullying' | 'academic_stress' | 'isolation' | 'substance';
  description: string;
  affectedCohort: string;
  timestamp: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alt_1',
    severity: 'high',
    type: 'bullying',
    description: 'Elevated linguistic patterns indicating cyberbullying vectors detected in unstructured peer interactions.',
    affectedCohort: 'Grade 10 - Section B',
    timestamp: '2 hours ago'
  },
  {
    id: 'alt_2',
    severity: 'medium',
    type: 'academic_stress',
    description: 'Systemic increase in cognitive load and sleep deprivation markers surrounding upcoming midterm examinations.',
    affectedCohort: 'Grade 11 (Aggregate)',
    timestamp: '1 day ago'
  },
  {
    id: 'alt_3',
    severity: 'low',
    type: 'isolation',
    description: 'Slight decrease in Social Compass engagement among transfer students.',
    affectedCohort: 'New Admissions Cohort',
    timestamp: '3 days ago'
  }
];

export const SystemicAlerts: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert size={18} className="text-rose-500" /> Systemic Risk Vectors
        </h3>
        <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
          {MOCK_ALERTS.length} Active
        </span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {MOCK_ALERTS.map((alert) => (
          <div key={alert.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-rose-500' : 
                  alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{alert.type.replace('_', ' ')}</span>
              </div>
              <span className="text-xs font-medium text-slate-400">{alert.timestamp}</span>
            </div>
            
            <p className="text-sm font-medium text-slate-700 leading-relaxed mb-3">
              {alert.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
              <Users size={12} /> {alert.affectedCohort}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 text-center font-medium">
        All alerts are derived from aggregate NLP models. No PII is exposed.
      </div>
    </div>
  );
};
