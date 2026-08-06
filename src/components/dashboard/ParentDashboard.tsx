import React from 'react';
import { SharedDashboardView, DashboardData } from './SharedDashboardView';

interface ParentDashboardProps {
  data: DashboardData;
  teenName: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ data, teenName }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Parent Dashboard</h1>
        <p className="text-slate-600 mt-2">
          You are viewing exactly what {teenName} sees about themselves. 
          PRERNA believes in transparent self-discovery together.
        </p>
      </div>

      <SharedDashboardView data={data} />
      
      <div className="mt-8 p-4 bg-white border border-slate-200 rounded-lg">
        <h3 className="text-md font-bold text-slate-800">Need Help?</h3>
        <p className="text-sm text-slate-600 mt-1">
          If you have concerns about your child's well-being, our crisis resources are available 24/7.
          Check the Crisis Protocol documentation for how we handle imminent risk.
        </p>
      </div>
    </div>
  );
};
