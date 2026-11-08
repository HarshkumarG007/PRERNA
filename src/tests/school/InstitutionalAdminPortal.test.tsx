import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstitutionalAdminPortal } from '../../components/school/InstitutionalAdminPortal';
import { useSubscriptionStore } from '../../store/subscriptionStore';

// Mock audio
vi.mock('../../utils/audioSynthesis', () => ({
  somaticAudio: {
    playStarBeaconChime: vi.fn(),
    playSoftChime: vi.fn(),
  }
}));

describe('InstitutionalAdminPortal Component', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      schoolLicense: 'campus_annual',
      schoolPilotDaysRemaining: 0,
    });
    vi.clearAllMocks();
  });

  it('renders VidyaPeeth Institutional Portal header and capacity metrics', () => {
    render(<InstitutionalAdminPortal />);

    expect(screen.getByText(/VidyaPeeth Institutional Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/PRERNA VidyaPeeth Secondary Campus/i)).toBeInTheDocument();
    expect(screen.getByText(/DPS-VK-2026-DELHI-CAMPUS/i)).toBeInTheDocument();
    expect(screen.getByText(/Licensed Seat Capacity/i)).toBeInTheDocument();
    expect(screen.getByText(/1,500/i)).toBeInTheDocument();
    expect(screen.getByText(/Enrolled Anonymous Peers/i)).toBeInTheDocument();
  });

  it('generates pseudonymous batch tokens without any student PII', async () => {
    render(<InstitutionalAdminPortal />);

    const generateBtn = screen.getByRole('button', { name: /Generate Tokens/i });
    fireEvent.click(generateBtn);

    // Verify token table renders
    await waitFor(() => {
      expect(screen.getAllByText(/Pseudonymous Activation Token/i).length).toBeGreaterThan(0);
    });

    // Check presence of pseudonymous token pattern
    expect(screen.getAllByText(/PRERNA-Grade9-SectionA-/i).length).toBeGreaterThan(0);
  });

  it('downloads GST Tax Invoice with SAC 998431 breakdown', async () => {
    render(<InstitutionalAdminPortal />);

    const invoiceBtn = screen.getByRole('button', { name: /Download GST Receipt/i });
    fireEvent.click(invoiceBtn);

    await waitFor(() => {
      expect(screen.getByText(/Tax invoice downloaded with 18% GST breakdown/i)).toBeInTheDocument();
    });
  });

  it('displays DPDP Act §9 Differential Privacy Guarantee ($k >= 5)', () => {
    render(<InstitutionalAdminPortal />);

    expect(screen.getByText(/Statutory Differential Privacy Guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/Tele-MANAS Toll-Free:/i)).toBeInTheDocument();
    expect(screen.getByText(/14416/i)).toBeInTheDocument();
    expect(screen.getByText(/1098/i)).toBeInTheDocument();
  });

  it('opens printable classroom handout sheet modal and toggles token claimed status', async () => {
    render(<InstitutionalAdminPortal />);

    const generateBtn = screen.getByRole('button', { name: /Generate Tokens/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Print Handout Sheet/i })).toBeInTheDocument();
    });

    // Open print handout modal
    const printBtn = screen.getByRole('button', { name: /Print Handout Sheet/i });
    fireEvent.click(printBtn);

    expect(screen.getByText(/Printable Student Token Cards/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Cut Here/i).length).toBeGreaterThan(0);

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Printable Student Token Cards/i)).not.toBeInTheDocument();

    // Toggle claimed status
    const statusPill = screen.getAllByRole('button', { name: /available/i })[0];
    fireEvent.click(statusPill);

    expect(screen.getAllByRole('button', { name: /claimed/i }).length).toBeGreaterThan(0);
  });
});
