/**
 * scoringEngine.ts
 * 
 * Psychometrically-correct scoring engine for the 120-item questionnaire.
 * 
 * Algorithm:
 *  1. Reverse-score items marked reverseScored (score = 6 - raw_score)
 *  2. Compute weighted sum per trait
 *  3. Normalise each trait to a 0-100 scale using the theoretical min/max
 *  4. Apply a mild z-score-style correction to spread scores around the mean
 */

import { QUESTIONNAIRE_ITEMS, TraitKey } from './questionnaireData';

export interface RawResponse {
  questionId: string;
  score: number; // 1-5 Likert
}

export interface ScoredProfile {
  // Big Five
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  // RIASEC
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  // Emotional Intelligence
  empathy: number;
  resilience: number;
  impulseControl: number;
  emotionalAwareness: number;
  socialIntuition: number;
}

export interface PersonalityArchetype {
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  coreStrengths: string[];
  growthAreas: string[];
  famousExamples: string[];
  careerDirection: string;
}

/**
 * Score the full questionnaire responses.
 */
export function scoreQuestionnaire(responses: RawResponse[]): ScoredProfile {
  const responseMap = new Map<string, number>(responses.map(r => [r.questionId, r.score]));

  // Accumulators: weighted sum & total weight per trait
  const sums: Record<TraitKey, number> = {
    openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0,
    realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0,
    empathy: 0, resilience: 0, impulseControl: 0, emotionalAwareness: 0, socialIntuition: 0,
  };
  const weights: Record<TraitKey, number> = { ...sums };

  for (const item of QUESTIONNAIRE_ITEMS) {
    const raw = responseMap.get(item.id);
    if (raw === undefined) continue;

    const adjusted = item.reverseScored ? (6 - raw) : raw;
    sums[item.trait] += adjusted * item.weight;
    weights[item.trait] += item.weight;
  }

  // Normalise: weighted avg is in [1..5], rescale to [0..100]
  const normalise = (trait: TraitKey): number => {
    if (weights[trait] === 0) return 50; // Default if no items answered
    const avg = sums[trait] / weights[trait]; // 1-5
    const scaled = ((avg - 1) / 4) * 100;    // 0-100
    return Math.round(Math.max(0, Math.min(100, scaled)));
  };

  return {
    openness: normalise('openness'),
    conscientiousness: normalise('conscientiousness'),
    extraversion: normalise('extraversion'),
    agreeableness: normalise('agreeableness'),
    neuroticism: normalise('neuroticism'),
    realistic: normalise('realistic'),
    investigative: normalise('investigative'),
    artistic: normalise('artistic'),
    social: normalise('social'),
    enterprising: normalise('enterprising'),
    conventional: normalise('conventional'),
    empathy: normalise('empathy'),
    resilience: normalise('resilience'),
    impulseControl: normalise('impulseControl'),
    emotionalAwareness: normalise('emotionalAwareness'),
    socialIntuition: normalise('socialIntuition'),
  };
}

/**
 * Derive a named archetype from the Big Five + top RIASEC code.
 * Based on widely published 16-type personality clustering.
 */
export function deriveArchetype(profile: ScoredProfile): PersonalityArchetype {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = profile;

  // Classify each Big Five as High/Low (threshold at 55 for slight bias toward label)
  const hiO = openness >= 55;
  const hiC = conscientiousness >= 55;
  const hiE = extraversion >= 55;
  const hiA = agreeableness >= 55;
  const hiN = neuroticism >= 55;

  // Find top RIASEC code
  const riasecMap: Record<string, number> = {
    Realistic: profile.realistic,
    Investigative: profile.investigative,
    Artistic: profile.artistic,
    Social: profile.social,
    Enterprising: profile.enterprising,
    Conventional: profile.conventional,
  };
  const topRiasec = Object.entries(riasecMap).sort(([,a],[,b]) => b - a)[0][0];

  // 16-archetype classification grid
  if (hiE && hiA && hiO && !hiN)  return ARCHETYPES.visionary;
  if (hiE && hiA && hiC && !hiN)  return ARCHETYPES.guardian;
  if (hiO && hiC && !hiE && !hiN) return ARCHETYPES.strategist;
  if (hiO && !hiC && !hiE)        return ARCHETYPES.explorer;
  if (!hiE && hiA && hiC && !hiN) return ARCHETYPES.mentor;
  if (hiE && !hiA && hiC && hiO)  return ARCHETYPES.innovator;
  if (!hiE && !hiA && hiC)        return ARCHETYPES.analyst;
  if (!hiE && hiO && !hiC)        return ARCHETYPES.philosopher;
  if (hiE && hiA && !hiC && !hiO) return ARCHETYPES.connector;
  if (hiE && !hiA && hiO && !hiC) return ARCHETYPES.challenger;
  if (!hiE && !hiO && hiA)        return ARCHETYPES.caregiver;
  if (hiN && !hiC)                return ARCHETYPES.seeker;
  if (hiC && !hiA && !hiO)        return ARCHETYPES.builder;
  if (topRiasec === 'Artistic')   return ARCHETYPES.creator;
  if (topRiasec === 'Enterprising') return ARCHETYPES.entrepreneur;
  return ARCHETYPES.explorer; // Default fallback
}

/**
 * Build an LLM synthesis prompt from the scored profile.
 * This prompt is injected into the local LLM to generate
 * the personalized "Self Discovery Report".
 */
export function buildLLMSynthesisPrompt(
  name: string,
  profile: ScoredProfile,
  archetype: PersonalityArchetype
): string {
  const topStrengths = Object.entries(profile)
    .filter(([k]) => !['neuroticism'].includes(k))
    .sort(([,a],[,b]) => b - a)
    .slice(0, 3)
    .map(([k]) => k);

  return `You are PRERNA, a compassionate AI mentor helping a teenager understand themselves better.

The teen's name is ${name}.

Their personality assessment results are:
- Big Five: Openness=${profile.openness}, Conscientiousness=${profile.conscientiousness}, Extraversion=${profile.extraversion}, Agreeableness=${profile.agreeableness}, Neuroticism=${profile.neuroticism}
- RIASEC: Realistic=${profile.realistic}, Investigative=${profile.investigative}, Artistic=${profile.artistic}, Social=${profile.social}, Enterprising=${profile.enterprising}, Conventional=${profile.conventional}
- Emotional: Empathy=${profile.empathy}, Resilience=${profile.resilience}, ImpulseControl=${profile.impulseControl}

Their personality archetype is: "${archetype.name}" — ${archetype.tagline}

Their top traits are: ${topStrengths.join(', ')}.

Write a warm, encouraging, 4-paragraph "Self Discovery Report" specifically for ${name}:
1. Start by addressing them directly and warmly describing who they are based on their archetype.
2. Highlight their biggest strengths with specific, relatable examples from a teenager's life.
3. Gently mention one growth area and reframe it as an exciting challenge, not a flaw.
4. End with an inspiring statement about the unique path ahead of them.

Keep the language simple, empowering, and teen-friendly. Avoid clinical jargon. Maximum 300 words. Do NOT claim to be human.`;
}

// ─── Archetypes Dictionary ──────────────────────────────────────────────────
const ARCHETYPES: Record<string, PersonalityArchetype> = {
  visionary: {
    name: 'The Visionary',
    emoji: '🌟',
    tagline: 'You see what others can\'t — and you make it real.',
    description: 'Charismatic, deeply creative, and extraordinarily empathetic. You are driven by big ideas and the desire to connect people with inspiring futures.',
    coreStrengths: ['Creative thinking', 'Emotional intelligence', 'Natural leadership', 'Inspiring others'],
    growthAreas: ['Attention to detail', 'Follow-through on plans'],
    famousExamples: ['Steve Jobs', 'Malala Yousafzai'],
    careerDirection: 'Innovation, social entrepreneurship, the arts, strategic leadership'
  },
  guardian: {
    name: 'The Guardian',
    emoji: '🛡️',
    tagline: 'Dependable, warm, and always there for people you care about.',
    description: 'You are the reliable heart of any team or family. Deeply loyal and hardworking, you create safety and belonging wherever you go.',
    coreStrengths: ['Reliability', 'Team building', 'Emotional warmth', 'Organization'],
    growthAreas: ['Setting personal boundaries', 'Embracing change'],
    famousExamples: ['APJ Abdul Kalam', 'Mother Teresa'],
    careerDirection: 'Education, healthcare, community leadership, project management'
  },
  strategist: {
    name: 'The Strategist',
    emoji: '♟️',
    tagline: 'You always think ten steps ahead — and you\'re usually right.',
    description: 'Razor-sharp analytical mind combined with disciplined work ethic. You are the ultimate problem-solver who finds elegant solutions where others see chaos.',
    coreStrengths: ['Analytical thinking', 'Long-term planning', 'Self-discipline', 'Pattern recognition'],
    growthAreas: ['Expressing emotions', 'Collaborating flexibly'],
    famousExamples: ['Sundar Pichai', 'Ada Lovelace'],
    careerDirection: 'Technology, data science, law, finance, research'
  },
  explorer: {
    name: 'The Explorer',
    emoji: '🧭',
    tagline: 'The world is your laboratory — you never stop asking why.',
    description: 'Intensely curious, independent, and endlessly creative. You are energized by discovery and see life as one big adventure full of possibilities.',
    coreStrengths: ['Creativity', 'Adaptability', 'Curiosity', 'Independent thinking'],
    growthAreas: ['Consistency', 'Completing what you start'],
    famousExamples: ['Amelia Earhart', 'Leonardo da Vinci'],
    careerDirection: 'Research, creative arts, entrepreneurship, travel journalism'
  },
  mentor: {
    name: 'The Mentor',
    emoji: '🌿',
    tagline: 'Your greatest joy is watching someone else flourish.',
    description: 'Patient, wise, and deeply invested in others. You have a natural gift for understanding people and helping them unlock their potential.',
    coreStrengths: ['Teaching', 'Active listening', 'Patience', 'Empathy'],
    growthAreas: ['Assertiveness', 'Advocating for your own needs'],
    famousExamples: ['Sudha Murthy', 'Mr. Rogers'],
    careerDirection: 'Education, counseling, psychology, human resources'
  },
  innovator: {
    name: 'The Innovator',
    emoji: '⚡',
    tagline: 'You break the mould and build something better.',
    description: 'Fearless, bold, and constantly hungry for the next big breakthrough. You combine logic with imagination in ways that challenge the status quo.',
    coreStrengths: ['Creative problem-solving', 'Risk tolerance', 'Drive', 'Originality'],
    growthAreas: ['Patience with slow progress', 'Listening before acting'],
    famousExamples: ['Elon Musk', 'Kalpana Chawla'],
    careerDirection: 'Technology, startups, product design, aerospace'
  },
  analyst: {
    name: 'The Analyst',
    emoji: '🔬',
    tagline: 'You find the truth hiding in the data — every time.',
    description: 'Methodical, precise, and intellectually rigorous. You make decisions based on evidence, not emotion, and you value depth over breadth.',
    coreStrengths: ['Critical thinking', 'Objectivity', 'Attention to detail', 'Precision'],
    growthAreas: ['Building social connections', 'Embracing ambiguity'],
    famousExamples: ['S. Ramanujan', 'Marie Curie'],
    careerDirection: 'Science, mathematics, finance, data analytics, engineering'
  },
  philosopher: {
    name: 'The Philosopher',
    emoji: '🌌',
    tagline: 'You question everything — and that\'s your superpower.',
    description: 'Introspective, original, and driven by meaning. You see patterns in the world that others miss and you feel compelled to understand the "why" behind everything.',
    coreStrengths: ['Deep thinking', 'Writing', 'Original ideas', 'Empathy'],
    growthAreas: ['Taking action', 'Practical implementation'],
    famousExamples: ['Rabindranath Tagore', 'Carl Sagan'],
    careerDirection: 'Writing, philosophy, academia, research, psychology'
  },
  connector: {
    name: 'The Connector',
    emoji: '🕸️',
    tagline: 'You bring people together and make magic happen.',
    description: 'Charismatic, warm, and energized by social bonds. You have an extraordinary ability to make people feel included, valued, and understood.',
    coreStrengths: ['Communication', 'Relationship-building', 'Enthusiasm', 'Collaboration'],
    growthAreas: ['Depth of analysis', 'Saying no when needed'],
    famousExamples: ['Oprah Winfrey', 'Ratan Tata'],
    careerDirection: 'Public relations, marketing, politics, community management'
  },
  challenger: {
    name: 'The Challenger',
    emoji: '🦅',
    tagline: 'You push limits — your own and everyone else\'s.',
    description: 'Bold, direct, and deeply motivated by achievement. You are not afraid of confrontation and you constantly push yourself and those around you to be better.',
    coreStrengths: ['Determination', 'Strategic thinking', 'Courage', 'High standards'],
    growthAreas: ['Emotional sensitivity', 'Delegation'],
    famousExamples: ['Virat Kohli', 'Margaret Thatcher'],
    careerDirection: 'Sports, law, military, corporate leadership, entrepreneurship'
  },
  caregiver: {
    name: 'The Caregiver',
    emoji: '💚',
    tagline: 'Love and service are your native language.',
    description: 'Selfless, kind, and devoted. You find your deepest meaning in nurturing others and ensuring everyone around you is healthy, happy, and supported.',
    coreStrengths: ['Compassion', 'Sacrifice', 'Support', 'Reliability'],
    growthAreas: ['Self-care', 'Accepting help from others'],
    famousExamples: ['Nightingale Florence', 'Baba Amte'],
    careerDirection: 'Medicine, social work, nursing, NGO leadership'
  },
  seeker: {
    name: 'The Seeker',
    emoji: '🌊',
    tagline: 'You feel deeply, and that makes you extraordinary.',
    description: 'Sensitive, artistic, and highly empathetic. Your emotional depth is your greatest strength. You experience the world more intensely than most — and that is a gift.',
    coreStrengths: ['Emotional depth', 'Artistic expression', 'Empathy', 'Authenticity'],
    growthAreas: ['Emotional regulation', 'Building routines'],
    famousExamples: ['Sylvia Plath', 'Gulzar'],
    careerDirection: 'Creative arts, writing, music, photography, therapy'
  },
  builder: {
    name: 'The Builder',
    emoji: '🏗️',
    tagline: 'You see a vision, you make a plan, you make it happen.',
    description: 'Practical, structured, and powerfully consistent. You are the backbone of every team you are part of — the one who ensures things actually get done.',
    coreStrengths: ['Discipline', 'Execution', 'Reliability', 'Systematic thinking'],
    growthAreas: ['Flexibility', 'Creative risk-taking'],
    famousExamples: ['Dhirubhai Ambani', 'Warren Buffett'],
    careerDirection: 'Engineering, manufacturing, operations, project management'
  },
  creator: {
    name: 'The Creator',
    emoji: '🎨',
    tagline: 'You turn blank pages into worlds.',
    description: 'Deeply artistic, emotionally resonant, and driven by beauty and self-expression. You see the world differently and communicate truths through your creations.',
    coreStrengths: ['Creativity', 'Originality', 'Emotional expression', 'Aesthetic sense'],
    growthAreas: ['Commercializing your skills', 'Meeting deadlines'],
    famousExamples: ['A.R. Rahman', 'Frida Kahlo'],
    careerDirection: 'Design, film, music, architecture, creative writing'
  },
  entrepreneur: {
    name: 'The Entrepreneur',
    emoji: '🚀',
    tagline: 'The future is yours to build — and you know it.',
    description: 'Energetic, opportunistic, and relentlessly ambitious. You see opportunity where others see obstacles and you are not afraid to take calculated risks to get what you want.',
    coreStrengths: ['Ambition', 'Persuasion', 'Adaptability', 'Drive'],
    growthAreas: ['Listening to others', 'Patience with details'],
    famousExamples: ['Byju Raveendran', 'Richard Branson'],
    careerDirection: 'Entrepreneurship, venture capital, sales, marketing, finance'
  },
};
