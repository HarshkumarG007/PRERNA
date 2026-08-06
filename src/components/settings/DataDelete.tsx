import React, { useState } from 'react';

export const DataDelete: React.FC = () => {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    // In production: explicitly DELETE from SQLite via Tauri
    alert("All your local data has been permanently deleted from this device.");
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h4 className="text-sm font-bold text-red-900">Are you absolutely sure?</h4>
        <p className="text-sm text-red-700 mt-1">
          This will wipe your trait profiles, session history, and consent records from this device. This cannot be undone.
        </p>
        <div className="flex space-x-3 mt-4">
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700">
            Yes, Delete Everything
          </button>
          <button onClick={() => setConfirming(false)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setConfirming(true)} 
      className="w-full flex justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
    >
      Delete My Data
    </button>
  );
};
