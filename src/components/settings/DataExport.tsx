import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../store';

export const DataExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const user = useAppStore.getState().user;
      if (!user) throw new Error("Not logged in");
      
      const exportData = await invoke('export_all_user_data', { userId: user.id });
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
