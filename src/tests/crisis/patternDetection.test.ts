import { describe, it, expect } from 'vitest';
import {
  evaluateTextDistress,
  evaluateMoodTrajectory,
  detectCrisisSignals,
} from '../../engine/crisis/patternDetection';

describe('Crisis Pattern Detection Engine (P4-2)', () => {
  describe('Text Distress Evaluation & True Positives', () => {
    it('detects explicit suicidal ideation and self-harm in English', () => {
      const phrases = [
        'I want to kill myself, I cannot take this anymore',
        'I am thinking of committing suicide tonight',
        'Nobody cares if I die, I want to end my life',
        'I have been cutting my wrists in secret',
      ];

      for (const phrase of phrases) {
        const result = evaluateTextDistress(phrase);
        expect(result.flagged).toBe(true);
        expect(result.severity).toBe('high');
      }
    });

    it('detects Hinglish distress expressions', () => {
      const hinglishPhrases = [
        'Main ab marna chahta hoon, sab khatam ho gaya',
        'Zindagi se tang aa gaya hoon, mar jaunga',
        'Jaan de dunga agar marks nahi aaye toh',
        'Mujhe zeher khana hai',
      ];

      for (const phrase of hinglishPhrases) {
        const result = evaluateTextDistress(phrase);
        expect(result.flagged).toBe(true);
        expect(result.severity).toBe('high');
      }
    });

    it('detects abuse, threats, and exploitation indicators', () => {
      const abusePhrases = [
        'Someone is touching me inappropriately and I am scared',
        'He threatened to beat me if I tell anyone',
        'They are blackmailing me and leaked my private photos',
      ];

      for (const phrase of abusePhrases) {
        const result = evaluateTextDistress(phrase);
        expect(result.flagged).toBe(true);
        expect(result.severity).toBe('high');
      }
    });

    it('detects substance misuse mentions with medium severity', () => {
      const substancePhrases = [
        'I took a pills overdose yesterday',
        'Friends are forcing me to buy weed and ganja',
      ];

      for (const phrase of substancePhrases) {
        const result = evaluateTextDistress(phrase);
        expect(result.flagged).toBe(true);
        expect(result.severity).toBe('medium');
      }
    });
  });

  describe('Negative Controls (Adolescent Slang & Benign Colloquialisms)', () => {
    it('does NOT flag benign idioms and humorous hyperbole', () => {
      const benignPhrases = [
        'OMG I am dying of laughter from that reel!',
        'That math exam completely killed me today haha',
        'This extra spicy chili sauce hurts so good',
        'I am literally dead after that workout',
        'I am dying to see the new movie this Friday',
        'Just sick and tired of homework today',
        'Going to kill two birds with one stone',
      ];

      for (const phrase of benignPhrases) {
        const result = evaluateTextDistress(phrase);
        expect(result.flagged).toBe(false);
      }
    });
  });

  describe('Longitudinal Mood Trajectory Pattern Detection', () => {
    it('triggers review flag when 3 consecutive sessions are in severe distress (<= 25)', () => {
      const severeDepressionSequence = [20, 15, 10];
      const result = evaluateMoodTrajectory(severeDepressionSequence);

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.reason).toContain('3 consecutive sessions');
    });

    it('triggers review flag when a precipitous mood collapse occurs (> 40 point drop to <= 25)', () => {
      const collapseSequence = [80, 50, 20];
      const result = evaluateMoodTrajectory(collapseSequence);

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.reason).toContain('collapse');
    });

    it('does NOT flag stable, normal, or recovering mood sequences', () => {
      const normalSequences = [
        [50, 60, 75], // Improving
        [75, 70, 80], // High thriving
        [50, 45, 55], // Normal neutral fluctuation
        [20, 40, 60], // Recovery from low
      ];

      for (const seq of normalSequences) {
        const result = evaluateMoodTrajectory(seq);
        expect(result.flagged).toBe(false);
      }
    });
  });

  describe('End-to-End detectCrisisSignals', () => {
    it('generates a flagged result for combined severe inputs without autonomous guardian contact', async () => {
      const result = await detectCrisisSignals({
        userId: 'user-audit-123',
        content: 'I want to die, nothing matters anymore',
        recentMoodScores: [20, 15, 10],
      });

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('high');
    });

    it('returns flagged=false for healthy everyday interactions', async () => {
      const result = await detectCrisisSignals({
        userId: 'user-audit-123',
        content: 'I had a wonderful study session with my friends today!',
        recentMoodScores: [60, 70, 80],
      });

      expect(result.flagged).toBe(false);
    });
  });
});

