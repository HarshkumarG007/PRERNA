import ipipItems from './items/ipip-bigfive-adapted.json';
import onetItems from './items/onet-riasec-adapted.json';
import { z } from 'zod';

export type TraitSnapshot = z.infer<typeof FusionSchema>;
export interface FusionItem {
  id: string;
  source: 'IPIP' | 'ONET';
  domain: string;
  keyed: 'positive' | 'negative' | 'neutral'; // ONET is usually just scored directly, let's treat it as positive
  text: string;
}

export interface RawFusionResponse {
  itemId: string;
  score: number; // 1-5 Likert
}

export const FusionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  snapshot_date: z.string(),
  item_bank_version: z.string(),
  big_five: z.object({
    openness: z.number(),
    conscientiousness: z.number(),
    extraversion: z.number(),
    agreeableness: z.number(),
    neuroticism: z.number(),
  }),
  riasec: z.object({
    realistic: z.number(),
    investigative: z.number(),
    artistic: z.number(),
    social: z.number(),
    enterprising: z.number(),
    conventional: z.number(),
  }),
  multiple_intel: z.record(z.string(), z.any()).optional(),
  emotional_profile: z.record(z.string(), z.any()).optional(),
  confidence_score: z.number(),
});

/**
 * Generates an assessment combining IPIP and O*NET items, dynamically loaded from the item bank.
 */
export function generateAssessment(): FusionItem[] {
  const combined: FusionItem[] = [];

  // Map IPIP
  for (const item of ipipItems as any[]) {
    combined.push({
      id: item.item_id,
      source: 'IPIP',
      domain: item.domain.toLowerCase(),
      keyed: item.keyed || 'positive',
      text: item.adapted_english || item.original_english,
    });
  }

  // Map ONET
  for (const item of onetItems as any[]) {
    combined.push({
      id: item.item_id,
      source: 'ONET',
      domain: item.domain.toLowerCase(),
      keyed: 'positive',
      text: item.adapted_english || item.original_english,
    });
  }

  // Randomize presentation to prevent section bias
  return combined.sort(() => Math.random() - 0.5);
}

/**
 * Parses raw JSON responses and scores them according to the published O*NET and IPIP formulas.
 */
export function scoreFusionProfile(responses: RawFusionResponse[], oldProfileFallback?: any): TraitSnapshot {
  if (responses.length === 0 && oldProfileFallback) {
    return oldProfileFallback as TraitSnapshot;
  }

  // Map the responses for easy lookup
  const responseMap = new Map<string, number>(responses.map(r => [r.itemId, r.score]));

  // Re-generate the full list to know what's what
  const items = generateAssessment();

  const sums: Record<string, number> = {
    // Big Five
    openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0,
    // RIASEC
    realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0,
  };
  const counts: Record<string, number> = { ...sums };

  for (const item of items) {
    const raw = responseMap.get(item.id);
    if (raw === undefined) continue;

    // Likert 1-5. Reverse score for 'negative' IPIP items.
    const score = item.keyed === 'negative' ? (6 - raw) : raw;
    
    if (sums[item.domain] !== undefined) {
      sums[item.domain] += score;
      counts[item.domain] += 1;
    }
  }

  // Normalise 1-5 avg to 0-100 scale
  const normalise = (domain: string): number => {
    if (counts[domain] === 0) return 50;
    const avg = sums[domain] / counts[domain];
    const scaled = ((avg - 1) / 4) * 100;
    return Math.round(Math.max(0, Math.min(100, scaled)));
  };

  const rawSnapshot = {
    id: "generated-id",
    user_id: "user",
    snapshot_date: new Date().toISOString(),
    item_bank_version: "1.0",
    big_five: {
      openness: normalise('openness'),
      conscientiousness: normalise('conscientiousness'),
      extraversion: normalise('extraversion'),
      agreeableness: normalise('agreeableness'),
      neuroticism: normalise('neuroticism'),
    },
    riasec: {
      realistic: normalise('realistic'),
      investigative: normalise('investigative'),
      artistic: normalise('artistic'),
      social: normalise('social'),
      enterprising: normalise('enterprising'),
      conventional: normalise('conventional'),
    },
    multiple_intel: {},
    emotional_profile: {},
    confidence_score: 0.9,
  };

  // Validate with Zod before returning (FE-1 schema logic requirement)
  return FusionSchema.parse(rawSnapshot);
}
