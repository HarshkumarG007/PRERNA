import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClinicianLogin } from '../../components/clinical/ClinicianLogin';

describe('ClinicianLogin Server-Authenticated Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('rejects non-reviewer roles (e.g. teen) even with valid password', async () => {
    const onSuccess = vi.fn();
    render(<ClinicianLogin onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Reviewer Username/i), { target: { value: 'aarav' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'demo123' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate Reviewer/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Registered clinical reviewer credentials required/i);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('rejects invalid credentials cleanly without any hardcoded backdoor passcode', async () => {
    const onSuccess = vi.fn();
    render(<ClinicianLogin onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Reviewer Username/i), { target: { value: 'clinician' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'CLINICIAN-007' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate Reviewer/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Invalid reviewer username or password/i);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('authenticates genuine reviewer account via backend and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    render(<ClinicianLogin onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Reviewer Username/i), { target: { value: 'clinician' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'demo123' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate Reviewer/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('handles 2FA MFA challenge when enabled on reviewer account', async () => {
    // Enable MFA on reviewer account in mock DB
    const dbRaw = localStorage.getItem('prerna_mock_db');
    if (dbRaw) {
      const db = JSON.parse(dbRaw);
      const rev = db.users.find((u: any) => u.username === 'clinician');
      if (rev) rev.mfaEnabled = true;
      localStorage.setItem('prerna_mock_db', JSON.stringify(db));
    } else {
      // Seed mock DB first via rejected check or direct write; easier to trigger getMockDb via a render or preset
      localStorage.setItem(
        'prerna_mock_db',
        JSON.stringify({
          users: [
            {
              id: 'demo-reviewer-001',
              username: 'clinician',
              password_hash: 'demo123',
              role: 'reviewer',
              mfaEnabled: true,
            },
          ],
          profiles: {},
          sessions: [],
          crisisEvents: [],
          deliveryRecords: [],
        })
      );
    }

    const onSuccess = vi.fn();
    render(<ClinicianLogin onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Reviewer Username/i), { target: { value: 'clinician' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'demo123' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate Reviewer/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/6-Digit TOTP Code/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/6-Digit TOTP Code/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & Enter Portal/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });
});

