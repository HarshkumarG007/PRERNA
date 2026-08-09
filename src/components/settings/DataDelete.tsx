import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../store';
import { useToast } from '../common/Toast';

export const DataDelete: React.FC = () => {
  const { success, error } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const user = useAppStore.getState().user;
      if (user) {
        await invoke('delete_user_data', { userId: user.id });
        useAppStore.getState().logout();
      }
      success('Data Deleted', 'All your local data has been permanently removed from this device.');
    } catch (err: any) {
      error('Deletion Failed', err.message);
    } finally {
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h4 className="text-sm font-bold text-red-900">Are you absolutely sure?</h4>
        <p className="text-sm text-red-700 mt-1">
          This will wipe your trait profiles, session history, and consent records from this device. This cannot be undone.
        </p>
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={isDeleting}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
          >
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
