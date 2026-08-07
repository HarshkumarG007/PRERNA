import { describe, it, expect } from 'vitest';
import { classifyCareerPathways } from './careerClassifier';
import { BigFiveProfile } from '../engine/assessment/bigFive';
import { RiasecProfile } from '../engine/assessment/riasec';

describe('Career Pathway Classifier', () => {
  it('should recommend Startup/Innovator for high Openness/Enterprising profile', () => {
    const bigFive: BigFiveProfile = {
      openness: 90,
      conscientiousness: 60,
      extraversion: 85,
      agreeableness: 50,
      neuroticism: 40
    };
    
    const riasec: RiasecProfile = {
      realistic: 30,
      investigative: 50,
      artistic: 60,
      social: 70,
      enterprising: 95,
      conventional: 40
    };

    const pathways = classifyCareerPathways(bigFive, riasec);
    
    // The startup score calculation is: (openness + enterprising + extraversion) / 3
    // (90 + 95 + 85) / 3 = 90
    expect(pathways[0].category).toBe('startup');
    expect(pathways[0].matchScore).toBe(90);
  });

  it('should recommend Healthcare/Medicine for high Social/Investigative/Agreeableness profile', () => {
    const bigFive: BigFiveProfile = {
      openness: 60,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 95,
      neuroticism: 30
    };
    
    const riasec: RiasecProfile = {
      realistic: 40,
      investigative: 90,
      artistic: 30,
      social: 95,
      enterprising: 40,
      conventional: 60
    };

    const pathways = classifyCareerPathways(bigFive, riasec);
    
    // Check if healthcare is the top recommendation
    expect(pathways[0].title).toBe('Healthcare & Medicine (NEET, Allied Health)');
  });
});
