import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataDelete } from '../../components/settings/DataDelete';
import { DataExport } from '../../components/settings/DataExport';
import { ToastProvider } from '../../components/common/Toast';
import { useAppStore } from '../../store';
import { waitFor } from '@testing-library/react';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({ user: {}, sessions: [], snapshots: [] })
}));

describe('DataGovernance UI Components', () => {
  describe('DataDelete', () => {
    it('requires a two-step confirmation to delete data', () => {
      render(
        <ToastProvider>
          <DataDelete />
        </ToastProvider>
      );
      
      const initialButton = screen.getByText('Delete My Data');
      expect(initialButton).toBeInTheDocument();
      
      // Step 1: Click initial button
      fireEvent.click(initialButton);
      
      // Confirmation UI should appear
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
      const confirmButton = screen.getByText('Yes, Delete Everything');
      const cancelButton = screen.getByText('Cancel');
      
      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      
      // Step 2: Cancel returns to initial state
      fireEvent.click(cancelButton);
      expect(screen.queryByText('Are you absolutely sure?')).not.toBeInTheDocument();
      expect(screen.getByText('Delete My Data')).toBeInTheDocument();
    });

    it('triggers delete flow when confirmed', async () => {
      render(
        <ToastProvider>
          <DataDelete />
        </ToastProvider>
      );
      
      useAppStore.setState({ user: { id: 'test_user', age_range: '16-18', region: 'us', language: 'en' }, isAuthenticated: true, logout: vi.fn() } as any);
      fireEvent.click(screen.getByText('Delete My Data'));
      fireEvent.click(screen.getByText('Yes, Delete Everything'));
      
      await waitFor(() => {
        expect(screen.getByText('Data Deleted')).toBeInTheDocument();
      });
    });
  });

  describe('DataExport', () => {
    it('provides a button to download data', async () => {
      useAppStore.setState({ user: { id: 'test_user', age_range: '16-18', region: 'us', language: 'en' }, isAuthenticated: true } as any);
      // Mock URL methods
      window.URL.createObjectURL = vi.fn(() => 'blob:test');
      window.URL.revokeObjectURL = vi.fn();
      
      render(<DataExport />);
      
      const downloadButton = screen.getByText('Download My Data (JSON)');
      expect(downloadButton).toBeInTheDocument();
      
      // Click download
      fireEvent.click(downloadButton);
      
      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      });
    });
  });
});
