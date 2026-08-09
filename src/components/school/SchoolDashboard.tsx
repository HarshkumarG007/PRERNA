import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, ArrowUpRight } from 'lucide-react';
import { CohortAnalytics } from './CohortAnalytics';
import { SystemicAlerts } from './SystemicAlerts';

export const SchoolDashboard: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Aggregate analytics for Westview High School. Data is anonymized.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Students', value: '1,204', icon: <Users size={20} className="text-blue-500" />, trend: '+12% this month' },
            { label: 'Completed Quests', value: '45.2k', icon: <BookOpen size={20} className="text-emerald-500" />, trend: '+5.4% this week' },
            { label: 'Skill Arenas Mastered', value: '8,902', icon: <GraduationCap size={20} className="text-indigo-500" />, trend: '+18% this month' },
            { label: 'Systemic Health Index', value: 'A-', icon: <ArrowUpRight size={20} className="text-purple-500" />, trend: 'Stable' }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {kpi.icon}
                </div>
                <span className="text-sm font-bold text-slate-500">{kpi.label}</span>
              </div>
              <div className="text-3xl font-black text-slate-800">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-400 mt-2">{kpi.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Analytics Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <CohortAnalytics />
            
            {/* Curriculum Suggestions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Curriculum Integration Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                  <h4 className="font-bold text-indigo-900 text-sm mb-1">Push: Resilience Training</h4>
                  <p className="text-xs text-indigo-700/70 mb-3">Grade 11 cohort shows 15% drop in resilience metrics prior to midterms.</p>
                  <button className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors">Deploy Module</button>
                </div>
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <h4 className="font-bold text-emerald-900 text-sm mb-1">Push: Career Discovery</h4>
                  <p className="text-xs text-emerald-700/70 mb-3">Grade 10 cohort shows high "Investigative" skew. Recommend STEM speaker series.</p>
                  <button className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">Deploy Module</button>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Column (1/3 width) */}
          <div className="lg:col-span-1">
            <SystemicAlerts />
          </div>

        </div>

      </div>
    </div>
  );
};
