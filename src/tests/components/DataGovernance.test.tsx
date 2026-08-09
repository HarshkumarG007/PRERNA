import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataDelete } from '../../components/settings/DataDelete';
import { DataExport } from '../../components/settings/DataExport';

describe('DataGovernance UI Components', () => {
  describe('DataDelete', () => {
    it('requires a two-step confirmation to delete data', () => {
      render(<DataDelete />);
      
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

    it('triggers delete flow when confirmed', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<DataDelete />);
      
      fireEvent.click(screen.getByText('Delete My Data'));
      fireEvent.click(screen.getByText('Yes, Delete Everything'));
      
      expect(alertMock).toHaveBeenCalledWith('All your local data has been permanently deleted from this device.');
      alertMock.mockRestore();
    });
  });

  describe('DataExport', () => {
    it('provides a button to download data', () => {
      // Mock URL methods
      window.URL.createObjectURL = vi.fn(() => 'blob:test');
      window.URL.revokeObjectURL = vi.fn();
      
      render(<DataExport />);
      
      const downloadButton = screen.getByText('Download My Data (JSON)');
      expect(downloadButton).toBeInTheDocument();
      
      // Click download
      fireEvent.click(downloadButton);
      
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
