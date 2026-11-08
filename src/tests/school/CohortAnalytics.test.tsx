import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CohortAnalytics } from '../../components/school/CohortAnalytics';

vi.mock('../../utils/audioSynthesis', () => ({
  somaticAudio: {
    playStarBeaconChime: vi.fn(),
    playSoftChime: vi.fn(),
  }
}));

describe('CohortAnalytics Component', () => {
  beforeEach(() => {
    (window as any).__MOCK_PRIVACY_BUDGET__ = 10;
    (window as any).__MOCK_PAST_QUERIES__ = [];
    vi.clearAllMocks();
  });

  it('renders cohort differential privacy engine and default whole school cohort', async () => {
    render(<CohortAnalytics />);

    expect(screen.getByText(/DPDP Section 9 Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Cohort Differential Privacy Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Whole School Cohort/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Top Vocational Horizons/i)).toBeInTheDocument();
      expect(screen.getByText(/Institutional Wellbeing Index/i)).toBeInTheDocument();
    });
  });

  it('displays real differential privacy noise and remaining budget for cohorts >= 5', async () => {
    render(<CohortAnalytics />);

    await waitFor(() => {
      expect(screen.getByText(/DP Noise Active/i)).toBeInTheDocument();
      expect(screen.getByText(/\/ 10 remaining/i)).toBeInTheDocument();
    });
  });

  it('suppresses metrics and shows lock icon when small-cell cohort (< 5) is selected', async () => {
    render(<CohortAnalytics />);

    // Click Grade 10 Section A (N=2)
    const smallCohortBtn = screen.getByRole('button', { name: /Grade 10 Section A/i });
    fireEvent.click(smallCohortBtn);

    await waitFor(() => {
      expect(screen.getByText(/Small-Cell Privacy Threshold Not Met/i)).toBeInTheDocument();
      expect(screen.getByText(/Wellbeing Metric Suppressed/i)).toBeInTheDocument();
      expect(screen.getByText(/below the statutory \$k \\ge 5\$ threshold/i)).toBeInTheDocument();
    });
  });

  it('exports aggregate CSV and JSON when export buttons are clicked', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();

    render(<CohortAnalytics />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /CSV/i })).toBeInTheDocument();
    });

    const csvBtn = screen.getByRole('button', { name: /CSV/i });
    fireEvent.click(csvBtn);

    expect(createObjectURLSpy).toHaveBeenCalled();

    const jsonBtn = screen.getByRole('button', { name: /JSON/i });
    fireEvent.click(jsonBtn);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(2);

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});

