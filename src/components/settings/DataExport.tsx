import React, { useState } from 'react';

export const DataExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // In production: fetch all rows for this user from SQLite, encrypt if needed, or just generate JSON.
      const mockExportData = {
        user: { id: 'u123', age_declared: 16 },
        trait_snapshots: [{ openness: 70, conscientiousness: 60 }],
        sessions: [{ type: 'life_quests', date: new Date() }]
      };
      
      const blob = new Blob([JSON.stringify(mockExportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prerna_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleExport} 
        disabled={isExporting}
        className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
      >
        {isExporting ? 'Preparing Download...' : 'Download My Data (JSON)'}
      </button>
    </div>
  );
};
