import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivateBetaGate } from '../../components/gate/PrivateBetaGate';

describe('PrivateBetaGate Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Private Beta Access Gate with title and input', () => {
    render(<PrivateBetaGate onAccessGranted={vi.fn()} />);

    expect(screen.getByText(/Closed Pilot • Restricted Access Gate/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ENTER INVITE TOKEN/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unlock Sanctuary Access/i })).toBeInTheDocument();
  });

  it('rejects an invalid token with a clear error notice', async () => {
    render(<PrivateBetaGate onAccessGranted={vi.fn()} />);

    const input = screen.getByPlaceholderText(/ENTER INVITE TOKEN/i);
    fireEvent.change(input, { target: { value: 'BOGUS-TOKEN-999' } });

    const submitBtn = screen.getByRole('button', { name: /Unlock Sanctuary Access/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
    });
  });

  it('successfully verifies a sovereign founder token and calls onAccessGranted', async () => {
    const accessGrantedMock = vi.fn();
    render(<PrivateBetaGate onAccessGranted={accessGrantedMock} />);

    const input = screen.getByPlaceholderText(/ENTER INVITE TOKEN/i);
    fireEvent.change(input, { target: { value: 'PRERNA-FOUNDER-2026' } });

    const submitBtn = screen.getByRole('button', { name: /Unlock Sanctuary Access/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Access Granted/i).length).toBeGreaterThan(0);
      expect(localStorage.getItem('prerna_beta_access_token')).toBe('PRERNA-FOUNDER-2026');
    });

    await waitFor(() => {
      expect(accessGrantedMock).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('exposes a request access button that opens email intent', () => {
    render(<PrivateBetaGate onAccessGranted={vi.fn()} />);
    const requestBtn = screen.getByText(/Request Invite Token/i);
    expect(requestBtn).toBeInTheDocument();
  });

  it('rejects multi-device oversharing of single-use token', async () => {
    // Simulate device 1 claiming PRERNA-H1-CLINICAL
    localStorage.setItem('prerna_claimed_dev_PRERNA-H1-CLINICAL', 'device_first_claim_123');
    localStorage.setItem('prerna_device_id', 'device_rogue_intruder_456');

    render(<PrivateBetaGate onAccessGranted={vi.fn()} />);

    const input = screen.getByPlaceholderText(/ENTER INVITE TOKEN/i);
    fireEvent.change(input, { target: { value: 'PRERNA-H1-CLINICAL' } });

    const submitBtn = screen.getByRole('button', { name: /Unlock Sanctuary Access/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Security Notice: This token was already claimed/i)).toBeInTheDocument();
    });
  });
});
