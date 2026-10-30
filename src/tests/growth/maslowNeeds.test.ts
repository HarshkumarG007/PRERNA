import { describe, it, expect, beforeEach } from 'vitest';
import { 
  MASLOW_TIERS, 
  discernWantVsNeed, 
  calculateMaslowAudit,
  MaslowTier
} from '../../engine/growth/maslowNeedsEngine';
import { useAppStore, UnifiedProfile, User } from '../../store';

describe('Maslow Needs Hierarchy & Wants Discernment Engine', () => {
  it('defines all 5 adolescent Maslow tiers with rich empirical metadata and bilingual titles', () => {
    const tierKeys: MaslowTier[] = ['physiological', 'safety', 'belonging', 'esteem', 'self_actualization'];
    
    tierKeys.forEach(tierKey => {
      const tier = MASLOW_TIERS[tierKey];
      expect(tier).toBeDefined();
      expect(tier.id).toBe(tierKey);
      expect(tier.title).toBeTruthy();
      expect(tier.hindiTitle).toBeTruthy();
      expect(tier.tagline).toBeTruthy();
      expect(tier.coreNeeds.length).toBeGreaterThanOrEqual(3);
      expect(tier.commonDisguisedWants.length).toBeGreaterThanOrEqual(2);
      expect(tier.healthyRootFulfillments.length).toBeGreaterThanOrEqual(3);
      expect(tier.iconEmoji).toBeTruthy();
    });

    expect(MASLOW_TIERS.physiological.level).toBe(1);
    expect(MASLOW_TIERS.safety.level).toBe(2);
    expect(MASLOW_TIERS.belonging.level).toBe(3);
    expect(MASLOW_TIERS.esteem.level).toBe(4);
    expect(MASLOW_TIERS.self_actualization.level).toBe(5);
  });

  it('accurately discerns midnight reels scrolling as a physiological dopamine trap', () => {
    const result = discernWantVsNeed('I want to keep scrolling Instagram reels at 11:30 PM');
    
    expect(result.rootTier).toBe('physiological');
    expect(result.classification).toBe('dopamine_trap');
    expect(result.rootExplanation).toContain('exhausted');
    expect(result.nourishingAlternative).toContain('screens');
    expect(result.discerningQuestions.length).toBeGreaterThan(0);
  });

  it('accurately discerns exam avoidance as a safety anxiety trap', () => {
    const result = discernWantVsNeed('I feel like delaying and avoiding my chemistry exam prep');
    
    expect(result.rootTier).toBe('safety');
    expect(result.classification).toBe('dopamine_trap');
    expect(result.rootExplanation).toContain('nervous system');
    expect(result.nourishingAlternative).toContain('Micro-Start');
  });

  it('accurately discerns learning music or code as a healthy self-actualization desire', () => {
    const result = discernWantVsNeed('I want to learn guitar chords and write a song');
    
    expect(result.rootTier).toBe('self_actualization');
    expect(result.classification).toBe('healthy_desire');
    expect(result.nourishingAlternative).toBeTruthy();
  });

  it('calculates personalized Maslow fulfillment audit and detects lowest hungry tier', () => {
    const mockProfile: Partial<UnifiedProfile> = {
      userId: 'test-user-maslow',
      personality: {
        bigFive: {
          openness: 75,
          conscientiousness: 60,
          extraversion: 40,
          agreeableness: 65,
          neuroticism: 70 // High neuroticism -> safety hunger
        },
        riasec: { realistic: 50, investigative: 50, artistic: 50, social: 50, enterprising: 50, conventional: 50 },
        emotional: { resilience: 50, empathy: 60, emotionalAwareness: 60, impulseControl: 50, socialIntuition: 50 }
      },
      cognition: {
        logicalReasoning: 60, verbalFluency: 60, spatialIntelligence: 60, creativeDivergence: 60,
        processingSpeed: 60, workingMemory: 60, learningStyle: 'visual'
      },
      wellbeingScore: 58
    };

    const mockUser: User = {
      id: 'test-user-maslow',
      name: 'Rohan Mehra',
      ageRange: '16-17',
      region: 'West',
      language: 'en',
      createdAt: new Date().toISOString()
    };

    const audit = calculateMaslowAudit(
      mockProfile as UnifiedProfile,
      mockUser,
      [
        {
          id: 'j-1',
          createdAt: new Date().toISOString(),
          type: 'growth_edge',
          title: 'Panic before test',
          reflection: 'Exam anxiety kept me awake.',
          tags: ['Anxiety', 'Exam', 'Panic'],
          moodRating: 2
        }
      ]
    );

    expect(audit.userTitle).toBe('Rohan');
    expect(audit.tierScores.physiological).toBeDefined();
    expect(audit.tierScores.safety).toBeDefined();
    expect(audit.hungryTier).toBeDefined();
    // High anxiety + low wellbeing -> safety tier will be flagged as hungry or fragile
    expect(audit.tierScores.safety.status === 'starved' || audit.tierScores.safety.status === 'fragile').toBe(true);
    expect(audit.distractionRiskLevel).toBe('high');
    expect(audit.guidingInsight).toContain('Rohan');
  });
});

describe('Maslow Needs & Desires Store State', () => {
  beforeEach(() => {
    useAppStore.setState({
      trackedNeeds: []
    });
  });

  it('adds, redirects, and deletes tracked need items correctly', () => {
    const { addTrackedNeed, updateTrackedNeedStatus, deleteTrackedNeed } = useAppStore.getState();

    addTrackedNeed({
      expressedWant: 'Eat 3 bags of chips while watching Netflix',
      rootNeedTier: 'physiological',
      rootNeedExplanation: 'Physical sensory exhaustion masquerading as hunger.',
      classification: 'dopamine_trap',
      nourishingAlternative: 'Drink lemon water and do a 5-minute stretch.',
      status: 'active',
      tags: ['Snack', 'Sensory']
    });

    const items = useAppStore.getState().trackedNeeds;
    expect(items.length).toBe(1);
    expect(items[0].id).toContain('need_');
    expect(items[0].expressedWant).toContain('chips');
    expect(items[0].status).toBe('active');

    // Update status to redirected
    updateTrackedNeedStatus(items[0].id, 'redirected', 'Drank water and felt refreshed within 5 minutes!');
    const updated = useAppStore.getState().trackedNeeds;
    expect(updated[0].status).toBe('redirected');
    expect(updated[0].userNotes).toContain('refreshed');

    // Delete item
    deleteTrackedNeed(items[0].id);
    expect(useAppStore.getState().trackedNeeds.length).toBe(0);
  });
});
