import React from 'react';
import { SharedDashboardView, DashboardData } from './SharedDashboardView';
import { DataExport } from '../settings/DataExport';
import { DataDelete } from '../settings/DataDelete';
import { AuditTrailViewer } from '../settings/AuditTrailViewer';

interface TeenProfileViewProps {
  data: DashboardData;
}

export const TeenProfileView: React.FC<TeenProfileViewProps> = ({ data }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Here is exactly what PRERNA knows about you.</p>
      </div>

      <SharedDashboardView data={data} />

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data & Privacy Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Data Sovereignty</h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">You have full control over your data, independently of your parent/guardian.</p>
              <DataExport />
              <div className="mt-4">
                <DataDelete />
              </div>
            </div>
          </div>
          
          <div>
            <AuditTrailViewer logs={[]} /> {/* In production, fetch from DB */}
          </div>
        </div>
      </div>
    </div>
  );
};
