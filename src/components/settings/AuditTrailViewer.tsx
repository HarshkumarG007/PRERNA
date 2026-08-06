import React from 'react';

export interface AuditLogEntry {
  id: string;
  accessedBy: 'self' | 'parent_dashboard' | 'system_process';
  dataScope: string;
  accessedAt: Date;
}

interface AuditTrailViewerProps {
  logs: AuditLogEntry[];
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        No access logs found.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Data Access Audit Trail</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          A transparent log of exactly what data has been accessed and by whom.
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {logs.map((log) => (
          <li key={log.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate capitalize">
                  Accessed By: {log.accessedBy.replace('_', ' ')}
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {log.dataScope}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {log.accessedAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
