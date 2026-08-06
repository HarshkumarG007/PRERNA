// src/ai/careerClassifier.ts

import { BigFiveProfile } from '../engine/assessment/bigFive';
import { RiasecProfile } from '../engine/assessment/riasec';

export interface CareerPathway {
  category: 'startup' | 'government' | 'corporate' | 'creative';
  title: string;
  description: string;
  matchScore: number; // 0-100
}

/**
 * A heuristic classifier that maps a combined trait profile to Indian-contextualized career pathways.
 */
export function classifyCareerPathways(
  bigFive: BigFiveProfile,
  riasec: RiasecProfile
): CareerPathway[] {
  const pathways: CareerPathway[] = [];

  // 1. Startup / Entrepreneurship (High Openness, Enterprising, Extraversion)
  let startupScore = (bigFive.openness + riasec.enterprising + bigFive.extraversion) / 3;
  pathways.push({
    category: 'startup',
    title: 'Startup Founder / Innovator',
    description: 'You enjoy taking risks, meeting people, and building things from scratch. India’s fast-growing startup ecosystem might be a great fit for you.',
    matchScore: Math.round(startupScore)
  });

  // 2. Government / Public Sector (High Conscientiousness, Social, Conventional)
  let govtScore = (bigFive.conscientiousness + riasec.social + riasec.conventional) / 3;
  pathways.push({
    category: 'government',
    title: 'Public Service / Administration (UPSC, etc.)',
    description: 'You are highly organized, empathetic, and value stability and community impact. A role in public administration or civil services aligns well with this.',
    matchScore: Math.round(govtScore)
  });

  // 3. Corporate / Tech (High Conscientiousness, Investigative, Realistic)
  let corporateScore = (bigFive.conscientiousness + riasec.investigative + riasec.realistic) / 3;
  pathways.push({
    category: 'corporate',
    title: 'Engineering & Data Science',
    description: 'You love solving complex problems methodically and enjoy hands-on technical work. Corporate engineering roles or research could be your calling.',
    matchScore: Math.round(corporateScore)
  });

  // 4. Creative / Media (High Openness, Artistic, low Conscientiousness tolerance)
  let creativeScore = (bigFive.openness + riasec.artistic + (100 - bigFive.conscientiousness) * 0.5) / 2.5;
  pathways.push({
    category: 'creative',
    title: 'Design, Media & Content Creation',
    description: 'You are highly imaginative and prefer unstructured environments where you can express yourself freely. Design, journalism, or content creation are strong options.',
    matchScore: Math.round(Math.min(100, creativeScore))
  });

  // 5. Healthcare / Medical (High Social, Investigative, Agreeableness)
  let healthcareScore = (bigFive.agreeableness + riasec.social + riasec.investigative) / 3;
  pathways.push({
    category: 'government', // grouping under stable/service
    title: 'Healthcare & Medicine (NEET, Allied Health)',
    description: 'You have high empathy and an investigative mind. The medical and allied healthcare fields offer a direct way to help people while solving complex biological problems.',
    matchScore: Math.round(healthcareScore)
  });

  // 6. Commerce & Finance (High Conventional, Enterprising, Conscientiousness)
  let financeScore = (bigFive.conscientiousness + riasec.conventional + riasec.enterprising) / 3;
  pathways.push({
    category: 'corporate',
    title: 'Finance, Accounting & Commerce (CA, Fintech)',
    description: 'You are highly structured, detail-oriented, and driven. A career in Chartered Accountancy, banking, or the booming Fintech sector aligns perfectly with your traits.',
    matchScore: Math.round(financeScore)
  });

  // Sort by highest match score
  return pathways.sort((a, b) => b.matchScore - a.matchScore);
}
