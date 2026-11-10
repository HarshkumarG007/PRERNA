import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewDashboard } from '../../components/clinical/ReviewDashboard';
import { ParentDashboard } from '../../components/parent/ParentDashboard';
import { safeInvoke } from '../../utils/mockBackend';
import { useAppStore } from '../../store';

vi.mock('../../utils/audioSynthesis', () => ({
  somaticAudio: {
    playStarBeaconChime: vi.fn(),
    playSoftChime: vi.fn(),
  },
}));

describe('End-to-End Guardian Crisis Escalation & Delivery Audit Flow (WP-S-16 UI)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAppStore.setState({
      user: {
        id: 'demo-parent-001',
        name: 'Rajesh Sharma',
        username: 'rajesh',
        ageRange: '18+',
        region: 'India - Delhi',
        language: 'en',
        role: 'parent',
        hasCompletedQuestionnaire: true,
        createdAt: new Date().toISOString(),
      },
    } as any);
  });

  it('enforces Rule 0.3 confirmation in ReviewDashboard, creates delivery audit record, and surfaces alert in ParentDashboard', async () => {
    // 1. Seed a pending crisis event for Aarav (demo-teen-001)
    const eventId = await safeInvoke<string>('create_crisis_event', {
      userId: 'demo-teen-001',
      severity: 'high',
      detectedAt: Date.now(),
    });
    expect(eventId).toMatch(/^crisis-/);

    // 2. Render Clinician ReviewDashboard
    render(<ReviewDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/1 Pending/i)).toBeInTheDocument();
    });

    // Click pending event in queue
    fireEvent.click(screen.getByText(/demo-teen-00/i));

    // Rule 0.3 Guard: "Notify Guardian" must be disabled until teenInformedAt checkbox is checked
    const notifyBtn = screen.getByRole('button', { name: /Notify Guardian/i });
    expect(notifyBtn).toBeDisabled();

    // Enter clinical credentials reference
    const credInput = screen.getByLabelText(/Clinical Reviewer Credentials Reference/i);
    fireEvent.change(credInput, { target: { value: 'RCI-CLIN-99412' } });

    // Confirm Rule 0.3 teen notification checkbox
    const rule03Checkbox = screen.getByRole('checkbox');
    fireEvent.click(rule03Checkbox);

    expect(notifyBtn).not.toBeDisabled();
    fireEvent.click(notifyBtn);

    // Verify Delivery Audit Trail appears in ReviewDashboard
    await waitFor(() => {
      expect(screen.getByText(/Delivery Audit Trail/i)).toBeInTheDocument();
      expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
      expect(screen.getByText(/demo-parent-001/i)).toBeInTheDocument();
    });

    // 3. Switch to Parent (Rajesh Sharma) and render ParentDashboard
    localStorage.setItem('prerna_last_user', 'demo-parent-001');
    render(<ParentDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('guardian-emergency-alerts-section')).toBeInTheDocument();
    });

    expect(screen.getByText(/Urgent Clinical Guardian Alert/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Clinician Wellbeing Escalation/i)).toBeInTheDocument();
    expect(screen.getByText(/Tele-MANAS 14416/i)).toBeInTheDocument();

    // Acknowledge alert
    const ackBtn = screen.getByRole('button', { name: /Acknowledge Alert/i });
    fireEvent.click(ackBtn);

    expect(screen.getByText(/Safety Alert Acknowledged/i)).toBeInTheDocument();
  });
});

