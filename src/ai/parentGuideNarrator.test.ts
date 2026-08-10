import { describe, it, expect } from 'vitest';
import { parseAndValidateParentGuide } from './parentGuideNarrator';
import { ParentSafeProfile } from '../parent/permissions';

describe('Parent Guide Narrator Citation Check (PG-4)', () => {
  const mockProfile: ParentSafeProfile = {
    lastUpdated: new Date().toISOString(),
    teenName: 'Test Teen',
    bigFive: { openness: 80, conscientiousness: 70, extraversion: 60, agreeableness: 50 },
    riasec: { realistic: 30, investigative: 40, artistic: 50, social: 60, enterprising: 70, conventional: 80 },
    conversationStarters: []
  };

  it('strips clinical/neuroticism claims and retains valid safe traits', () => {
    const rawOutput = `Your teen is highly creative [cite: bigFive.openness]. They are anxious [cite: bigFive.neuroticism]. They are organized [cite: bigFive.conscientiousness].`;
    
    const result = parseAndValidateParentGuide(rawOutput, mockProfile);
    
    // The neuroticism claim should be stripped because it is explicitly blocked
    expect(result.sentences.length).toBe(2);
    expect(result.sentences[0].text).toBe('Your teen is highly creative.');
    expect(result.sentences[1].text).toBe('They are organized.');
    expect(result.isSafeToDisplay).toBe(true);
  });
});
