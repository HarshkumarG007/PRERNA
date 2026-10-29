import { describe, it, expect } from 'vitest';
import { classifyCareerPathways } from './careerClassifier';
import { BigFiveProfile } from '../engine/assessment/bigFive';
import { RiasecProfile } from '../engine/assessment/riasec';

describe('Real Career Pathway Classifier (O*NET & India NCS Vector Matching)', () => {
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
    
    expect(pathways[0].category).toBe('startup');
    expect(pathways[0].id).toBe('startup-founder-operator');
    expect(pathways[0].matchScore).toBeGreaterThanOrEqual(85);
    expect(pathways[0].entranceExams).toBeDefined();
    expect(pathways[0].topInstitutes).toContain('BITS Pilani');
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
    
    // Top matches should be Physician or Clinical Psychologist
    expect(['clinical-physician', 'clinical-psychologist']).toContain(pathways[0].id);
    expect(pathways[0].matchScore).toBeGreaterThanOrEqual(85);
    expect(pathways[0].indianStream).toBeDefined();
  });

  it('should recommend AI / Machine Learning for high Investigative/Openness/Conscientiousness', () => {
    const bigFive: BigFiveProfile = {
      openness: 90,
      conscientiousness: 92,
      extraversion: 40,
      agreeableness: 50,
      neuroticism: 30
    };
    
    const riasec: RiasecProfile = {
      realistic: 50,
      investigative: 98,
      artistic: 40,
      social: 25,
      enterprising: 35,
      conventional: 70
    };

    const pathways = classifyCareerPathways(bigFive, riasec);
    
    expect(pathways[0].id).toBe('ai-ml-engineer');
    expect(pathways[0].entranceExams).toContain('JEE Main / JEE Advanced');
    expect(pathways[0].topInstitutes).toContain('IITs (Bombay, Delhi, Madras)');
  });

  it('should recommend Academic & Pure Science Research for high Investigative / Openness profile', () => {
    const bigFive: BigFiveProfile = {
      openness: 95,
      conscientiousness: 88,
      extraversion: 30,
      agreeableness: 60,
      neuroticism: 25,
    };

    const riasec: RiasecProfile = {
      realistic: 65,
      investigative: 98,
      artistic: 45,
      social: 30,
      enterprising: 30,
      conventional: 60,
    };

    const pathways = classifyCareerPathways(bigFive, riasec);
    const academicPathway = pathways.find(p => p.category === 'academic');
    expect(academicPathway).toBeDefined();
    expect(academicPathway?.matchScore).toBeGreaterThanOrEqual(80);
    expect(academicPathway?.topInstitutes).toBeDefined();
    expect(academicPathway?.reasoning).toBeDefined();
  });
});
