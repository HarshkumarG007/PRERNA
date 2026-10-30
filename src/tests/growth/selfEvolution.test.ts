import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateSelfImageComparison, 
  MITIGATION_STRATEGIES 
} from '../../engine/growth/selfEvolutionEngine';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';
import { useAppStore } from '../../store';

describe('Self-Evolution Engine & Mitigation Strategies', () => {
  it('contains 6 evidence-based behavioral mitigation strategies with bilingual titles', () => {
    expect(MITIGATION_STRATEGIES.length).toBe(6);
    
    MITIGATION_STRATEGIES.forEach(strategy => {
      expect(strategy.id).toBeTruthy();
      expect(strategy.title).toBeTruthy();
      expect(strategy.hindiTitle).toBeTruthy();
      expect(strategy.tagline).toBeTruthy();
      expect(strategy.targetFriction).toBeTruthy();
      expect(strategy.psychologicalMechanism).toBeTruthy();
      expect(strategy.stepByStep.length).toBeGreaterThanOrEqual(3);
      expect(strategy.quickMantra).toBeTruthy();
    });

    const strategyIds = MITIGATION_STRATEGIES.map(s => s.id);
    expect(strategyIds).toContain('five-minute-micro-start');
    expect(strategyIds).toContain('thought-vs-fact-detangler');
    expect(strategyIds).toContain('three-second-pause');
    expect(strategyIds).toContain('seventy-percent-release');
    expect(strategyIds).toContain('respectful-boundary-script');
    expect(strategyIds).toContain('evidence-jar-victories');
  });

  it('generates rich personalized self-image comparison based on 16 personality types', () => {
    const sixteenType = deriveSixteenType({
      openness: 85,
      conscientiousness: 78,
      extraversion: 30,
      agreeableness: 45,
      neuroticism: 35
    });

    const comparison = generateSelfImageComparison(sixteenType, 'Arya Stark');
    
    expect(comparison.currentSelf.title).toContain('Arya');
    expect(comparison.currentSelf.title).toContain(sixteenType.fullCode);
    expect(comparison.currentSelf.dominantStates.length).toBeGreaterThan(0);
    expect(comparison.currentSelf.frictionPoints.length).toBeGreaterThan(0);
    expect(comparison.currentSelf.energySources.length).toBeGreaterThan(0);

    expect(comparison.evolvedSelf.title).toContain('Arya');
    expect(comparison.evolvedSelf.unlockedCapacities.length).toBeGreaterThan(0);
    expect(comparison.evolvedSelf.habitsToCultivate.length).toBeGreaterThan(0);
    expect(comparison.evolvedSelf.guidingVision).toContain('Arya');

    expect(comparison.steppingStones.length).toBe(3);
    expect(comparison.steppingStones[0].phase).toContain('Stage 1');
    expect(comparison.steppingStones[1].phase).toContain('Stage 2');
    expect(comparison.steppingStones[2].phase).toContain('Stage 3');
  });

  it('gracefully handles missing sixteenType and username with empowering defaults', () => {
    const comparison = generateSelfImageComparison(null, undefined);
    
    expect(comparison.currentSelf.title).toContain('You');
    expect(comparison.evolvedSelf.title).toContain('You');
    expect(comparison.steppingStones.length).toBe(3);
  });
});

describe('Growth Journal & Mitigation Store State', () => {
  beforeEach(() => {
    useAppStore.setState({
      journalEntries: [],
      completedMitigations: {}
    });
  });

  it('logs strength and growth edge reflections correctly', () => {
    const { addJournalEntry, deleteJournalEntry } = useAppStore.getState();

    addJournalEntry({
      type: 'strength',
      title: 'Helped my peer with Physics',
      reflection: 'I was able to explain the concept calmly even when it took 3 tries.',
      tags: ['Empathy', 'Communication', 'Science'],
      moodRating: 5
    });

    addJournalEntry({
      type: 'growth_edge',
      title: 'Delayed project presentation prep',
      reflection: 'Felt nervous about speaking in front of class so kept putting off slides.',
      tags: ['Procrastination', 'Presentation'],
      mitigationUsed: 'five-minute-micro-start',
      moodRating: 3
    });

    const entries = useAppStore.getState().journalEntries;
    expect(entries.length).toBe(2);
    expect(entries[0].title).toBe('Delayed project presentation prep');
    expect(entries[0].type).toBe('growth_edge');
    expect(entries[0].id).toBeTruthy();
    expect(entries[0].createdAt).toBeTruthy();

    expect(entries[1].title).toBe('Helped my peer with Physics');
    expect(entries[1].type).toBe('strength');

    // Test deletion
    deleteJournalEntry(entries[0].id);
    const updatedEntries = useAppStore.getState().journalEntries;
    expect(updatedEntries.length).toBe(1);
    expect(updatedEntries[0].title).toBe('Helped my peer with Physics');
  });

  it('tracks mitigation strategy repetitions and streaks', () => {
    const { toggleMitigation } = useAppStore.getState();

    toggleMitigation('five-minute-micro-start');
    toggleMitigation('five-minute-micro-start');
    toggleMitigation('three-second-pause');

    const completed = useAppStore.getState().completedMitigations;
    expect(completed['five-minute-micro-start']).toBe(2);
    expect(completed['three-second-pause']).toBe(1);
    expect(completed['seventy-percent-release']).toBeUndefined();
  });
});
