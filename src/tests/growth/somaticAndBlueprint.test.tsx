import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { somaticAudio } from '../../utils/audioSynthesis';
import { SomaticBreathingCompanion } from '../../components/growth/SomaticBreathingCompanion';
import { LifeBlueprintExport } from '../../components/growth/LifeBlueprintExport';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';

describe('Somatic Audio Synthesizer (432 Hz Offline Oscillator)', () => {
  beforeEach(() => {
    somaticAudio.setMuted(false);
  });

  it('allows toggling mute state reliably', () => {
    expect(somaticAudio.getMuted()).toBe(false);
    somaticAudio.setMuted(true);
    expect(somaticAudio.getMuted()).toBe(true);
    somaticAudio.setMuted(false);
    expect(somaticAudio.getMuted()).toBe(false);
  });

  it('safely handles audio tone methods in headless test environments without throwing', () => {
    expect(() => somaticAudio.playSingingBowl(432, 1)).not.toThrow();
    expect(() => somaticAudio.playInhaleTone(2)).not.toThrow();
    expect(() => somaticAudio.playHoldTone(2)).not.toThrow();
    expect(() => somaticAudio.playExhaleTone(2)).not.toThrow();
  });
});

describe('Somatic Breathing Companion Component', () => {
  it('renders the default 4-7-8 Somatic Vagal Reset protocol', () => {
    render(<SomaticBreathingCompanion initialProtocol="vagal-478" isModal={false} />);
    
    expect(screen.getByText(/4-7-8 Somatic Vagal Reset/i)).toBeInTheDocument();
    expect(screen.getByText(/Inhale through nose/i)).toBeInTheDocument();
    expect(screen.getByText(/Begin Exercise/i)).toBeInTheDocument();
    expect(screen.getByText(/432 Hz Harmonic/i)).toBeInTheDocument();
  });

  it('allows switching to Box Breathing and 3-Second Active Pause protocols', () => {
    render(<SomaticBreathingCompanion isModal={false} />);
    
    // Switch to Box Breathing
    const boxBtn = screen.getByText(/समवृत्ति प्राणायम/i);
    fireEvent.click(boxBtn);
    expect(screen.getByText(/Box Breathing \(Samavritti\)/i)).toBeInTheDocument();

    // Switch to 3-Second Pause
    const pauseBtn = screen.getByText(/३-सेकंड सक्रिय विराम/i);
    fireEvent.click(pauseBtn);
    expect(screen.getByText(/3-Second Impulse Break/i)).toBeInTheDocument();
  });

  it('starts and pauses the breathing cycle upon button click', () => {
    render(<SomaticBreathingCompanion isModal={false} />);
    
    const startBtn = screen.getByText(/Begin Exercise/i);
    fireEvent.click(startBtn);

    expect(screen.getByText(/Pause/i)).toBeInTheDocument();
    
    const pauseBtn = screen.getByText(/Pause/i);
    fireEvent.click(pauseBtn);

    expect(screen.getByText(/Begin Exercise/i)).toBeInTheDocument();
  });
});

describe('Life Blueprint Portfolio Export Component', () => {
  const mockUser = {
    id: 'user_teen_test',
    username: 'aarav_test',
    name: 'Aarav Sharma',
    ageRange: '16-17' as const,
    region: 'North India',
    language: 'en',
    hasCompletedQuestionnaire: true,
    createdAt: new Date().toISOString(),
  };

  const mockProfile = {
    userId: 'user_teen_test',
    generatedAt: new Date().toISOString(),
    personality: {
      bigFive: { openness: 82, conscientiousness: 78, extraversion: 65, agreeableness: 80, neuroticism: 32 },
      riasec: { realistic: 45, investigative: 85, artistic: 72, social: 75, enterprising: 58, conventional: 50 },
      emotional: { resilience: 78, empathy: 82, emotionalAwareness: 80, impulseControl: 74, socialIntuition: 76 },
    },
    cognition: {
      logicalReasoning: 80,
      verbalFluency: 78,
      spatialIntelligence: 72,
      creativeDivergence: 84,
      processingSpeed: 76,
      workingMemory: 78,
      learningStyle: 'mixed' as const,
    },
    archetype: {
      name: 'The Visionary Architect',
      description: 'You envision future systems with depth and empathy.',
      traits: ['Visionary', 'Empathetic', 'Analytical'],
    },
    wellbeingScore: 84,
    strengths: ['Systems Vision', 'Empathy', 'Creative Reasoning'],
    growthAreas: ['Micro-patience', 'Setting Boundaries'],
  };

  const derived16 = deriveSixteenType(mockProfile.personality.bigFive);

  it('renders adolescent name, 16 personalities code, and foundational Atma-Jnana creed', () => {
    render(
      <LifeBlueprintExport
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        profile={mockProfile}
        sixteenType={derived16}
      />
    );

    expect(screen.getByText(/Aarav Sharma’s Life Blueprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Self-Realisation is God's Realisation/i)).toBeInTheDocument();
    expect(screen.getByText(/जैसे मृगा नाभि कस्तूरी/i)).toBeInTheDocument();
    expect(screen.getByText(/Psychological Archetype & Cognitive Functions/i)).toBeInTheDocument();
    expect(screen.getByText(/IPIP Big Five Psychometric Dimensions/i)).toBeInTheDocument();
    expect(screen.getByText(/Baseline Foundation vs. Evolved Potential/i)).toBeInTheDocument();
    expect(screen.getByText(/High-Fit Indian Career Pathways/i)).toBeInTheDocument();
  });

  it('renders Print and Download action buttons', () => {
    render(
      <LifeBlueprintExport
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        profile={mockProfile}
        sixteenType={derived16}
      />
    );

    expect(screen.getByText(/Print \/ Save to PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Download HTML/i)).toBeInTheDocument();
  });
});
