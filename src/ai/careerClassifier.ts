// src/ai/careerClassifier.ts

import { BigFiveProfile } from '../engine/assessment/bigFive';
import { RiasecProfile } from '../engine/assessment/riasec';
import { REAL_CAREER_TAXONOMY, CareerEntry } from '../data/careers/careerTaxonomy';

export interface CareerPathway {
  id: string;
  onetCode?: string;
  category: 'startup' | 'government' | 'corporate' | 'creative' | 'academic';
  subSector?: string;
  title: string;
  description: string;
  matchScore: number; // 0-100
  indianStream?: string;
  entranceExams?: string[];
  topInstitutes?: string[];
  futureOutlook?: string;
  reasoning?: string;
}

/**
 * Computes standard Cosine Similarity between two numerical vectors of equal length.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Classifies and ranks real occupations from O*NET and India National Career Service (NCS)
 * against an adolescent's empirical RIASEC & Big Five profiles.
 */
export function classifyCareerPathways(
  bigFive: BigFiveProfile,
  riasec: RiasecProfile,
  limit?: number
): CareerPathway[] {
  // User RIASEC vector
  const uR = [
    riasec.realistic,
    riasec.investigative,
    riasec.artistic,
    riasec.social,
    riasec.enterprising,
    riasec.conventional,
  ];

  // User Big Five vector
  const uB = [
    bigFive.openness,
    bigFive.conscientiousness,
    bigFive.extraversion,
    bigFive.agreeableness,
    100 - bigFive.neuroticism, // emotional resilience
  ];

  const results: CareerPathway[] = REAL_CAREER_TAXONOMY.map((career: CareerEntry) => {
    const cR = [
      career.riasec.realistic,
      career.riasec.investigative,
      career.riasec.artistic,
      career.riasec.social,
      career.riasec.enterprising,
      career.riasec.conventional,
    ];

    const cB = [
      career.bigFive.openness,
      career.bigFive.conscientiousness,
      career.bigFive.extraversion,
      career.bigFive.agreeableness,
      100 - career.bigFive.neuroticism,
    ];

    const simRiasec = cosineSimilarity(uR, cR);
    const simBigFive = cosineSimilarity(uB, cB);

    // Vocational psychologists heavily weight RIASEC (70%) with Work Styles (30%)
    const compositeSim = 0.70 * simRiasec + 0.30 * simBigFive;

    // Rescale cosine similarity to an intuitive 0-100 score
    // In human psychometrics vectors, positive vectors typically range from 0.60 to 0.99
    const matchScore = Math.round(
      Math.min(100, Math.max(15, ((compositeSim - 0.60) / 0.38) * 100))
    );

    // Explainable rationale synthesis (PRD §6.4 requirement)
    const reasons: string[] = [];
    if (riasec.investigative >= 70 && career.riasec.investigative >= 75) {
      reasons.push('Analytical & investigative curiosity');
    }
    if (riasec.enterprising >= 70 && career.riasec.enterprising >= 75) {
      reasons.push('High leadership & enterprising vision');
    }
    if (riasec.artistic >= 70 && career.riasec.artistic >= 75) {
      reasons.push('Creative ideation & design thinking');
    }
    if (riasec.social >= 70 && career.riasec.social >= 75) {
      reasons.push('Empathy & human-centered dedication');
    }
    if (riasec.realistic >= 70 && career.riasec.realistic >= 75) {
      reasons.push('Hands-on technical & mechanical aptitude');
    }
    if (riasec.conventional >= 70 && career.riasec.conventional >= 75) {
      reasons.push('Structured detail orientation & precision');
    }
    if (bigFive.openness >= 75 && career.bigFive.openness >= 75) {
      reasons.push('Openness to novel & breakthrough paradigms');
    }
    if (bigFive.conscientiousness >= 80 && career.bigFive.conscientiousness >= 85) {
      reasons.push('High execution discipline');
    }

    const reasoning = reasons.length > 0
      ? reasons.slice(0, 2).join(' • ')
      : 'Harmonious alignment across vocational interests and work styles.';

    return {
      id: career.id,
      onetCode: career.onetCode,
      category: career.category,
      subSector: career.subSector,
      title: career.title,
      description: career.description,
      matchScore,
      indianStream: career.indianStream,
      entranceExams: career.entranceExams,
      topInstitutes: career.topInstitutes,
      futureOutlook: career.futureOutlook,
      reasoning,
    };
  });

  // Sort descending by highest alignment
  results.sort((a, b) => b.matchScore - a.matchScore);

  return limit ? results.slice(0, limit) : results;
}
