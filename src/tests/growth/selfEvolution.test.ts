import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateSelfImageComparison, 
  generatePersonalizedSelfManagementPlan,
  MITIGATION_STRATEGIES,
  GrowthJournalEntry
} from '../../engine/growth/selfEvolutionEngine';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';
import { useAppStore, UnifiedProfile, User } from '../../store';

describe('Self-Evolution Engine & Mitigation Strategies', () => {
  it('contains 10 comprehensive evidence-based behavioral mitigation strategies with bilingual titles', () => {
    expect(MITIGATION_STRATEGIES.length).toBe(10);
    
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
    expect(strategyIds).toContain('dopamine-chunking-sprint');
    expect(strategyIds).toContain('eisenhower-focus-funnel');
    expect(strategyIds).toContain('thought-vs-fact-detangler');
    expect(strategyIds).toContain('somatic-vagal-reset');
    expect(strategyIds).toContain('three-second-pause');
    expect(strategyIds).toContain('energy-shield-introvert');
    expect(strategyIds).toContain('respectful-boundary-script');
    expect(strategyIds).toContain('seventy-percent-release');
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

describe('Personalized Self-Management Strategy Engine', () => {
  const mockUser: User = {
    id: 'user-teen-42',
    name: 'Kabir Sharma',
    ageRange: '16-17',
    region: 'North',
    language: 'en',
    createdAt: new Date().toISOString()
  };

  it('deeply personalizes recommendations for a low-conscientiousness, kinesthetic learner with procrastination friction', () => {
    const mockProfile: Partial<UnifiedProfile> = {
      userId: 'user-teen-42',
      personality: {
        bigFive: {
          openness: 80,
          conscientiousness: 32, // low conscientiousness
          extraversion: 40,
          agreeableness: 55,
          neuroticism: 40
        },
        riasec: { realistic: 50, investigative: 50, artistic: 70, social: 40, enterprising: 60, conventional: 30 },
        emotional: { resilience: 60, empathy: 60, emotionalAwareness: 60, impulseControl: 45, socialIntuition: 50 }
      },
      cognition: {
        logicalReasoning: 65,
        verbalFluency: 60,
        spatialIntelligence: 75,
        creativeDivergence: 85,
        processingSpeed: 70,
        workingMemory: 50,
        learningStyle: 'kinesthetic' // kinesthetic
      },
      wellbeingScore: 74
    };

    const pastJournal: GrowthJournalEntry[] = [
      {
        id: 'j-1',
        createdAt: new Date().toISOString(),
        type: 'growth_edge',
        title: 'Delayed starting physics chapter again',
        reflection: 'Kept checking my phone because reading text while sitting felt boring.',
        tags: ['Procrastination', 'Focus', 'Physics'],
        moodRating: 2
      }
    ];

    const plan = generatePersonalizedSelfManagementPlan(
      mockProfile as UnifiedProfile,
      mockUser,
      pastJournal,
      { 'dopamine-chunking-sprint': 2 }
    );

    expect(plan.userTitle).toBe('Kabir');
    expect(plan.learningStyleGuidance.style).toBe('kinesthetic');
    expect(plan.learningStyleGuidance.actionableTip).toContain('standing');
    expect(plan.ageTierGuidance.tier).toBe('16-17');

    // The top recommended strategies should prioritize task-initiation & kinesthetic sprints
    const topStrategyIds = plan.recommendedStrategies.slice(0, 3).map(r => r.strategy.id);
    expect(topStrategyIds).toContain('five-minute-micro-start');
    expect(topStrategyIds).toContain('dopamine-chunking-sprint');

    // Match scores should be high (> 80%)
    const microStart = plan.recommendedStrategies.find(r => r.strategy.id === 'five-minute-micro-start');
    expect(microStart?.matchScore).toBeGreaterThanOrEqual(80);
    expect(microStart?.matchReason).toContain('procrastination');

    const dopamineSprint = plan.recommendedStrategies.find(r => r.strategy.id === 'dopamine-chunking-sprint');
    expect(dopamineSprint?.matchScore).toBeGreaterThanOrEqual(80);
    expect(dopamineSprint?.matchReason).toContain('kinesthetic');
  });

  it('prioritizes emotional calm and defusion for high neuroticism with overthinking reflections', () => {
    const sensitiveProfile: Partial<UnifiedProfile> = {
      userId: 'user-teen-99',
      personality: {
        bigFive: {
          openness: 60,
          conscientiousness: 70,
          extraversion: 35,
          agreeableness: 75,
          neuroticism: 72 // high neuroticism
        },
        riasec: { realistic: 30, investigative: 60, artistic: 60, social: 70, enterprising: 40, conventional: 60 },
        emotional: { resilience: 45, empathy: 80, emotionalAwareness: 85, impulseControl: 55, socialIntuition: 70 }
      },
      cognition: {
        logicalReasoning: 70,
        verbalFluency: 75,
        spatialIntelligence: 60,
        creativeDivergence: 65,
        processingSpeed: 60,
        workingMemory: 65,
        learningStyle: 'visual'
      },
      wellbeingScore: 62
    };

    const pastJournal: GrowthJournalEntry[] = [
      {
        id: 'j-2',
        createdAt: new Date().toISOString(),
        type: 'growth_edge',
        title: 'Could not sleep worrying about marks',
        reflection: 'Kept replaying tomorrow test in my head.',
        tags: ['Overthinking', 'Exams', 'Self-Talk'],
        moodRating: 2
      }
    ];

    const plan = generatePersonalizedSelfManagementPlan(
      sensitiveProfile as UnifiedProfile,
      { ...mockUser, name: 'Ananya' },
      pastJournal
    );

    expect(plan.userTitle).toBe('Ananya');
    expect(plan.archetypeTitle).toContain('Perfectionist');
    expect(plan.dailyKeystoneRoutine.eveningReflection).toContain('Evidence Jar');

    const topStrategies = plan.recommendedStrategies.slice(0, 3).map(r => r.strategy.id);
    expect(topStrategies).toContain('thought-vs-fact-detangler');
    expect(topStrategies).toContain('somatic-vagal-reset');
  });
});

describe('Growth Journal & Custom Mitigation Store State', () => {
  beforeEach(() => {
    useAppStore.setState({
      journalEntries: [],
      completedMitigations: {},
      customMitigations: []
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

  it('supports creating and deleting personalized custom self-management strategies', () => {
    const { addCustomMitigation, deleteCustomMitigation } = useAppStore.getState();

    addCustomMitigation({
      title: 'Math Water-Sip Reset',
      hindiTitle: 'जल विराम नियम',
      category: 'focus',
      tagline: 'Drink 3 sips of cold water whenever a calculus problem gets stuck.',
      targetFriction: 'Stuck on tough equations, wanting to quit immediately.',
      psychologicalMechanism: 'Cold sensory trigeminal stimulation breaks cognitive fixation.',
      stepByStep: [
        'Place water bottle on right side of desk.',
        'When stuck for 3 minutes, pause pencil and take 3 deliberate sips.',
        'Reread problem from scratch.'
      ],
      quickMantra: 'Cool the mind, see the line.'
    });

    const customList = useAppStore.getState().customMitigations;
    expect(customList.length).toBe(1);
    expect(customList[0].id).toContain('custom_');
    expect(customList[0].isCustom).toBe(true);
    expect(customList[0].title).toBe('Math Water-Sip Reset');

    deleteCustomMitigation(customList[0].id);
    expect(useAppStore.getState().customMitigations.length).toBe(0);
  });
});
