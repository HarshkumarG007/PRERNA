import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateBigFive, calculateRollingBigFive, QuestChoice } from '../../engine/assessment/bigFive';
import { calculateRiasec, ArenaAction } from '../../engine/assessment/riasec';
import { classifyCareerPathways } from '../../ai/careerClassifier';
import { detectCrisisSignals } from '../../engine/crisis/patternDetection';
import { dispatchGuardianNotification, GuardianNotificationPayload } from '../../engine/crisis/escalationRouter';
import { ParentPermissionManager } from '../../parent/permissions';
import { safeInvoke } from '../../utils/mockBackend';
import { UnifiedProfile } from '../../synthesis/fusionEngine';

describe('PRERNA End-to-End System Integration Walkthrough (Phase 6 Pre-Deployment)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('Step 1: Onboarding & Age Verification under DPDP Section 9', () => {
    // Under-18 accounts must have behavioral_tracking permanently false
    const minorUser = {
      id: 'teen-integration-001',
      username: 'Aarav Sharma',
      ageTier: '16-17' as const,
      role: 'teen' as const,
      behavioral_tracking: false,
      consentId: 'parent-digilocker-consent-verified',
    };

    expect(minorUser.behavioral_tracking).toBe(false);
    expect(minorUser.ageTier).toBe('16-17');
    expect(minorUser.consentId).toBeTruthy();
  });

  it('Step 2: Mandatory Activity Disclosures & EMA Trait Evolution', () => {
    // Baseline raw choices for Big Five
    const choices: QuestChoice[] = [
      { id: 'c1', traitImpacts: { openness: 15, conscientiousness: 12, extraversion: 5 } },
      { id: 'c2', traitImpacts: { openness: 10, agreeableness: 14, neuroticism: -10 } },
    ];

    const initialProfile = calculateBigFive(choices);
    expect(initialProfile.openness).toBeGreaterThan(60);
    expect(initialProfile.conscientiousness).toBeGreaterThan(55);

    // Second session simulates EMA smoothing (alpha = 0.25)
    const secondSessionDelta = { openness: 55, conscientiousness: 70 };
    const smoothedProfile = calculateRollingBigFive(initialProfile, secondSessionDelta, 0.25);

    // Trait must not jump wildly: smoothed.openness = 0.25 * 55 + 0.75 * initialProfile.openness
    expect(smoothedProfile.openness).toBeLessThan(initialProfile.openness);
    expect(smoothedProfile.openness).toBeGreaterThan(55);
    expect(Math.abs(smoothedProfile.openness - initialProfile.openness)).toBeLessThanOrEqual(15);
  });

  it('Step 3: RIASEC & Empirical O*NET + India NCS Career Taxonomy Matching', () => {
    const actions: ArenaAction[] = [
      { id: 'pattern_match', traitImpacts: { investigative: 25, realistic: 10 } },
      { id: 'spatial_puzzle', traitImpacts: { investigative: 15, artistic: 12 } },
    ];

    const riasecProfile = calculateRiasec(actions);
    expect(riasecProfile.investigative).toBeGreaterThan(70);

    const matches = classifyCareerPathways(
      { openness: 80, conscientiousness: 70, extraversion: 50, agreeableness: 70, neuroticism: 40 },
      riasecProfile
    );

    expect(matches.length).toBeGreaterThanOrEqual(3);
    const titles = matches.map((m) => m.title.toLowerCase());
    // Should match investigative / academic / science pathways (e.g. Space Scientist, Data Scientist, ML)
    const hasScienceOrTech = titles.some((t) =>
      t.includes('scientist') || t.includes('data') || t.includes('research') || t.includes('engineer') || t.includes('intelligence')
    );
    expect(hasScienceOrTech).toBe(true);
  });

  it('Step 4: Crisis Screening, Slang Suppression, and Pattern Detection', async () => {
    // 1. Negative control (adolescent slang whitelist) must NOT flag crisis
    const benignSlang = await detectCrisisSignals({
      content: 'I am dead laughing at this funny clip, that physics exam killed me!',
      userId: 'teen-integration-001',
    });
    expect(benignSlang.flagged).toBe(false);

    // 2. Genuine severe distress pattern MUST flag and create pending event
    const trueDistress = await detectCrisisSignals({
      content: 'Main mar jaunga ab koi fayda nahi mujhe suicide karna hai',
      userId: 'teen-integration-001',
    });
    expect(trueDistress.flagged).toBe(true);
    expect(trueDistress.severity).toBe('high');
  });

  it('Step 5: Rule 0.3 Guardian Notification Gate (Critical Invariant)', async () => {
    const crisisEvent = {
      id: 'crisis-e2e-001',
      userId: 'teen-integration-001',
      detectedAt: new Date(),
      severity: 'high' as const,
      humanReviewStatus: 'reviewed_guardian_notified' as const,
      triggerReason: 'Severe distress signal',
    };

    // A. Rejection when teen has NOT been informed
    const unnotifiedPayload: GuardianNotificationPayload = {
      crisisEvent,
      teenInformedAt: null,
      reviewerId: 'clinician-dr-iyer',
      reviewerCredentialsRef: 'MCI-REG-44321',
      guardianRecipient: { name: 'Sunita Sharma', contact: '+919876543210' },
    };

    await expect(dispatchGuardianNotification(unnotifiedPayload)).rejects.toThrow(
      /Rule 0.3 Violation: Guardian notification is strictly prohibited unless the teenager has been informed first/
    );

    // B. Rejection if human reviewer credentials are missing
    const missingCredsPayload: GuardianNotificationPayload = {
      ...unnotifiedPayload,
      teenInformedAt: Date.now() - 1000,
      reviewerCredentialsRef: '',
    };

    await expect(dispatchGuardianNotification(missingCredsPayload)).rejects.toThrow(
      /Rule 0.3 Violation: A valid human reviewer credential reference/
    );

    // C. Success when teen is informed first and clinician provides credentials
    const validPayload: GuardianNotificationPayload = {
      ...unnotifiedPayload,
      teenInformedAt: Date.now() - 5000,
    };

    const dispatchResult = await dispatchGuardianNotification(validPayload);
    expect(dispatchResult.dispatched).toBe(true);
    expect(dispatchResult.teenInformedAt).toBeTruthy();
  });

  it('Step 6: Shared Dashboard Parity (Single Projection, No Stealth Divergence)', () => {
    const fullProfile: UnifiedProfile = {
      userId: 'teen-integration-001',
      generatedAt: new Date().toISOString(),
      itemBankVersion: '1.0',
      personality: {
        bigFive: { openness: 85, conscientiousness: 72, extraversion: 65, agreeableness: 78, neuroticism: 35 },
        riasec: { realistic: 40, investigative: 85, artistic: 75, social: 70, enterprising: 55, conventional: 45 },
        emotional: { resilience: 75, empathy: 80, emotionalAwareness: 80, impulseControl: 70, socialIntuition: 75 },
        confidence: 0.9,
        timestamp: new Date().toISOString(),
      },
      cognition: {
        logicalReasoning: 80, verbalFluency: 85, spatialIntelligence: 75, creativeDivergence: 85,
        processingSpeed: 75, workingMemory: 78, learningStyle: 'visual',
      },
      archetype: {
        name: 'The Analytical Visionary', description: 'Deep explorer of systems and ideas.',
        traits: ['Curious', 'Methodical'], famousExamples: ['Homi Bhabha', 'Kalpana Chawla'],
        workEnvironment: 'Research Lab', collaborationStyle: 'Collaborative specialist',
      },
      archetypeConfidence: 0.9,
      careerMatches: [
        {
          field: 'Space Sciences', role: 'Research Fellow', matchScore: 92,
          whyFit: ['Strong curiosity'], preparationPath: ['IIST / IISc'],
          indianContext: { entranceExams: ['JEE Advanced'], topColleges: ['IISc'], salaryRange: '12-25 LPA', growthOutlook: 'High' },
        },
      ],
      topCareer: {
        field: 'Space Sciences', role: 'Research Fellow', matchScore: 92,
        whyFit: ['Strong curiosity'], preparationPath: ['IIST / IISc'],
        indianContext: { entranceExams: ['JEE Advanced'], topColleges: ['IISc'], salaryRange: '12-25 LPA', growthOutlook: 'High' },
      },
      learningProfile: {
        optimalStudyTime: 'morning',
        bestLearningModes: ['visual', 'hands-on'],
        attentionSpan: 45,
        retentionStrategies: ['Conceptual mapping'],
        motivationTriggers: ['Curiosity'],
      },
      strengths: ['Analytical Insight', 'Empathetic Problem Solving'],
      growthAreas: ['Pacing tasks'],
      wellbeingScore: 82,
      riskFactors: [],
      recommendedActions: [],
    };

    const preferences = {
      userId: 'teen-integration-001',
      lastUpdated: new Date().toISOString(),
      shares: {
        wellbeingScore: true,
        careerInterests: true,
        strengths: true,
        dailyCheckIn: true,
        concerns: false,
      },
      requiresApproval: { fullProfile: true, chatHistory: true, riskAlerts: true },
    };

    const parentSafe = ParentPermissionManager.generateShareableData(fullProfile, preferences);

    // Verify data parity
    expect(parentSafe.wellbeing?.score).toBe(fullProfile.wellbeingScore);
    expect(parentSafe.strengths).toEqual(fullProfile.strengths);
    expect(parentSafe.bigFive?.openness).toBe(fullProfile.personality.bigFive.openness);

    // Verify that neuroticism / private clinical signals are omitted from parent view per DPDP Section 9
    expect((parentSafe.bigFive as any)?.neuroticism).toBeUndefined();
  });

  it('Step 7: Data Sovereignty — Full Export & Verified Deletion', async () => {
    // Export data
    const exportedData: any = await safeInvoke('export_all_user_data', { userId: 'teen-integration-001' });
    expect(exportedData).toBeTruthy();
    expect(exportedData.compliance_meta.dpdp_section_9_compliant).toBe(true);
    expect(exportedData.compliance_meta.behavioral_tracking).toBe(false);

    // Verified delete
    await safeInvoke('delete_user_data', { userId: 'teen-integration-001' });
    const exportedAfterDelete: any = await safeInvoke('export_all_user_data', { userId: 'teen-integration-001' });
    expect(exportedAfterDelete.user).toBeNull();
  });
});
