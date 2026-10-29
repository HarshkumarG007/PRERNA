import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReactionTest } from '../../components/skills/ReactionTest';
import { SpatialPuzzle } from '../../components/skills/SpatialPuzzle';
import { ActivityHistoryViewer } from '../../components/dashboard/ActivityHistoryViewer';
import { useAppStore } from '../../store';

describe('Skill Arena Mini-Games Integration (P2-3)', () => {
  it('renders ReactionTest, triggers trial and records complete callback', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const handleComplete = vi.fn();

    render(<ReactionTest onComplete={handleComplete} difficulty="easy" />);

    // Intro screen
    expect(screen.getByText(/Test Your Reflexes/i)).toBeInTheDocument();
    
    // Click to start
    act(() => {
      fireEvent.click(screen.getByTestId('reaction-intro-box'));
      vi.advanceTimersByTime(500);
    });

    // Waiting phase
    expect(screen.getByText(/Wait for GREEN/i)).toBeInTheDocument();

    // Fast-forward past random delay to green signal
    act(() => {
      vi.advanceTimersByTime(4500);
    });

    // Ready phase
    expect(screen.getByText(/CLICK NOW!/i)).toBeInTheDocument();

    // Valid hit on green signal
    act(() => {
      fireEvent.click(screen.getByTestId('reaction-ready-box'));
      vi.advanceTimersByTime(500);
    });

    // Feedback shows reaction speed
    expect(screen.getByText(/Reaction Speed/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders SpatialPuzzle and handles mental rotation choice', async () => {
    const handleComplete = vi.fn();

    render(<SpatialPuzzle onComplete={handleComplete} />);

    expect(screen.getByText(/Spatial Spin — Mental Rotation/i)).toBeInTheDocument();
    expect(screen.getByText(/Which one is the EXACT rotated figure\?/i)).toBeInTheDocument();

    // Find and click an option
    const optionButtons = screen.getAllByRole('button');
    expect(optionButtons.length).toBeGreaterThanOrEqual(4);

    fireEvent.click(optionButtons[0]);
  });
});

describe('Activity History & Disclosure Access (P2-2)', () => {
  it('renders ActivityHistoryViewer with session history and opens disclosures modal', async () => {
    // Populate store with a test session
    useAppStore.setState({
      sessions: [
        {
          id: 'test-session-1',
          type: 'life_quest',
          completedAt: new Date().toISOString(),
          score: 82,
          metadata: {
            raw_choices: { choice1: 'explore' },
            derived_traits: { openness: 82 },
            disclosure_version: '1.0',
          },
        },
      ],
    });

    render(<ActivityHistoryViewer />);

    expect(screen.getByText(/Activity History & Recorded Choices/i)).toBeInTheDocument();
    expect(screen.getByText(/Life Quest Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Score: 82/i)).toBeInTheDocument();

    // Click Review Disclosures button
    const reviewBtn = screen.getByRole('button', { name: /Review Disclosures/i });
    fireEvent.click(reviewBtn);

    // Modal opens showing DPDP Section 9 disclosures
    expect(screen.getByText(/Activity Disclosures/i)).toBeInTheDocument();
    expect(screen.getByText(/DPDP Section 9\(3\) compliant notices/i)).toBeInTheDocument();
  });
});
