import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdultDashboard } from '../../components/adult/AdultDashboard';
import { useAppStore } from '../../store';

vi.mock('../../utils/audioSynthesis', () => ({
  somaticAudio: {
    playStarBeaconChime: vi.fn(),
    playSoftChime: vi.fn(),
  },
}));

describe('AdultDashboard Interactive Modules', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAppStore.setState({
      user: {
        id: 'demo-adult-001',
        name: 'Priya Verma',
        username: 'priya',
        ageRange: '18+',
        region: 'India - Maharashtra',
        language: 'en',
        role: 'adult',
        hasCompletedQuestionnaire: true,
        createdAt: new Date().toISOString(),
      },
      profile: {
        userId: 'demo-adult-001',
        wellbeingScore: 84,
        archetype: {
          name: 'The Navigator',
          description: 'Purposeful insight and calm curiosity.',
          traits: ['Curious', 'Empathetic'],
        },
        personality: {
          bigFive: { openness: 78, conscientiousness: 74, extraversion: 65, agreeableness: 80, neuroticism: 32 },
          riasec: { realistic: 50, investigative: 82, artistic: 76, social: 74, enterprising: 60, conventional: 50 },
          emotional: { resilience: 80, empathy: 82, emotionalAwareness: 78, impulseControl: 75, socialIntuition: 74 },
        },
        strengths: ['Insight', 'Resilience'],
        growthAreas: ['Rest'],
        generatedAt: new Date().toISOString(),
      },
    } as any);
  });

  it('renders Adult Sanctuary greeting, Partners gateway, and interactive pillar triggers', () => {
    render(
      <AdultDashboard
        onEnterPartners={vi.fn()}
        onSwitchPersona={vi.fn()}
      />
    );

    expect(screen.getByText(/Welcome, Priya Verma/i)).toBeInTheDocument();
    expect(screen.getByText(/PRERNA for Partners/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Launch Maslow Compass/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Kaya Kalpa Lab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Journal/i })).toBeInTheDocument();
  });

  it('launches Maslow Needs Compass, Kaya Kalpa Vitality Lab, and Swadharma Journal from cards/tabs', async () => {
    render(
      <AdultDashboard
        onEnterPartners={vi.fn()}
        onSwitchPersona={vi.fn()}
      />
    );

    // 1. Launch Maslow Compass via card CTA
    fireEvent.click(screen.getByRole('button', { name: /Launch Maslow Compass/i }));
    await waitFor(() => {
      expect(screen.getByText(/Needs & Desires Compass/i)).toBeInTheDocument();
    });

    // 2. Switch to Kaya Kalpa Vitality Lab via top navigation tab
    fireEvent.click(screen.getByRole('button', { name: /Kaya Kalpa Vitality Lab/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Kaya Kalpa/i).length).toBeGreaterThan(0);
    });

    // 3. Switch to Swadharma & Journal via top navigation tab
    fireEvent.click(screen.getByRole('button', { name: /Swadharma & Journal/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Evolution|Journal/i).length).toBeGreaterThan(0);
    });
  });

  it('opens Life Blueprint PDF modal directly from Adult Sanctuary banner', async () => {
    render(
      <AdultDashboard
        onEnterPartners={vi.fn()}
        onSwitchPersona={vi.fn()}
      />
    );

    const blueprintBtn = screen.getByRole('button', { name: /Life Blueprint PDF/i });
    fireEvent.click(blueprintBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Life Blueprint/i).length).toBeGreaterThan(1);
    });
  });
});
