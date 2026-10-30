/**
 * maslowNeedsEngine.ts
 * 
 * Implementation of Maslow's Hierarchy of Needs for Adolescent Self-Regulation
 * and Wants vs. True Needs Discernment.
 * 
 * Grounded in:
 *  - Abraham Maslow's 5-Stage Hierarchy of Human Needs (1943/1954)
 *  - Adolescent Impulse Control & Dopamine Substitute Theory
 *  - Self-Determination Theory (Deci & Ryan - Autonomy, Competence, Relatedness)
 *  - Non-pathologizing, compassionate cognitive reframing
 */

import { UnifiedProfile, User } from '../../store';
import { GrowthJournalEntry } from './selfEvolutionEngine';

export type MaslowTier = 
  | 'physiological'       // Tier 1: Biological & Energy Foundation (Sleep, Nutrition, Physical Movement, Sensory Rest)
  | 'safety'              // Tier 2: Emotional & Routine Safety (Predictable schedules, freedom from panic, safe digital boundaries)
  | 'belonging'           // Tier 3: Authentic Connection (True peer friendships, family acceptance, safe community)
  | 'esteem'              // Tier 4: Self-Respect & Competence (Skill mastery, healthy autonomy, earned recognition)
  | 'self_actualization'; // Tier 5: Creative Expression & Purpose (Living natural potential, authentic values, inspired creation)

export type WantClassification = 
  | 'core_need'          // True foundational need: directly nourishes wellbeing and baseline health
  | 'healthy_desire'     // Healthy secondary desire: enriching and enjoyable when bounded
  | 'dopamine_trap';     // Distraction / Pseudo-substitute: fleeting impulse masking an unmet deeper need

export interface MaslowTierDefinition {
  id: MaslowTier;
  level: number;
  title: string;
  hindiTitle: string;
  tagline: string;
  description: string;
  coreNeeds: string[];
  commonDisguisedWants: {
    fleetingWant: string;
    realUnderlyingNeed: string;
    distractionTrigger: string;
    nourishingAlternative: string;
  }[];
  healthyRootFulfillments: string[];
  color: string;
  bgLight: string;
  borderColor: string;
  iconEmoji: string;
}

export interface TrackedNeedItem {
  id: string;
  createdAt: string;
  expressedWant: string;              // What the user feels an urge for (e.g. "Scroll Instagram for another hour")
  rootNeedTier: MaslowTier;           // Underlying Maslow tier
  rootNeedExplanation: string;        // Compassionate translation
  classification: WantClassification; // core_need | healthy_desire | dopamine_trap
  nourishingAlternative: string;      // Healthy alternative
  status: 'active' | 'fulfilled' | 'redirected';
  tags: string[];
  userNotes?: string;
}

export interface MaslowFulfillmentScore {
  tier: MaslowTier;
  level: number;
  title: string;
  score: number; // 0 to 100
  status: 'starved' | 'fragile' | 'balanced' | 'flourishing';
  statusSummary: string;
  recommendation: string;
}

export interface MaslowAuditReport {
  userTitle: string;
  hungryTier: MaslowTierDefinition; // The lowest tier needing nourishment first
  tierScores: Record<MaslowTier, MaslowFulfillmentScore>;
  overallMaslowIndex: number; // Average
  distractionRiskLevel: 'low' | 'moderate' | 'high';
  guidingInsight: string;
}

export const MASLOW_TIERS: Record<MaslowTier, MaslowTierDefinition> = {
  physiological: {
    id: 'physiological',
    level: 1,
    title: 'Physiological Foundation',
    hindiTitle: 'शारीरिक एवं जैविक आधार',
    tagline: 'Your biological engine: Sleep, hydration, physical movement, sensory rest.',
    description: 'The irreplaceable bedrock of all human functioning. When your body is starved of restorative sleep, wholesome nourishment, or screen-free downtime, the brain inevitably craves quick dopamine (sugary snacks, endless video feeds) as a desperate energy substitute.',
    coreNeeds: [
      '7.5 - 9 hours of restorative sleep',
      'Consistent physical hydration & fresh air',
      'Regular physical movement / stretching',
      'Screen-free sensory decompression intervals'
    ],
    commonDisguisedWants: [
      {
        fleetingWant: 'Binge-watching reels or shorts at midnight instead of sleeping',
        realUnderlyingNeed: 'Biological exhaustion combined with revenge bedtime procrastination (craving autonomy after a busy day).',
        distractionTrigger: 'Fatigued prefrontal cortex unable to inhibit scrolling.',
        nourishingAlternative: '15 minutes of dim-light reading or calming instrumental music to let the nervous system power down naturally.'
      },
      {
        fleetingWant: 'Sudden craving for junk food or sugary energy drinks while studying',
        realUnderlyingNeed: 'Brain glucose dip and mental fatigue from sitting still too long.',
        distractionTrigger: 'Brain seeking instant chemical stimulation.',
        nourishingAlternative: 'A large glass of cold water, a quick 3-minute physical stretch, and a handful of nuts or fresh fruit.'
      }
    ],
    healthyRootFulfillments: [
      '20-minute afternoon non-screen power pause',
      'Consistent bedtime phone charging station outside the bed',
      '5-minute morning sun exposure and hydration',
      'Somatic breathwork to release physical jaw & shoulder tightness'
    ],
    color: '#f43f5e', // Rose
    bgLight: 'rgba(244, 63, 94, 0.08)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    iconEmoji: '🌱'
  },

  safety: {
    id: 'safety',
    level: 2,
    title: 'Emotional & Routine Safety',
    hindiTitle: 'सुरक्षा, स्थिरता एवं शांति',
    tagline: 'Predictability, emotional calm, clear boundaries, freedom from acute panic.',
    description: 'Freedom from catastrophic worry and chaos. When students feel unsafe about upcoming exams, family conflict, or academic futures, they seek escape through hyper-distraction, gaming marathons, or procrastination.',
    coreNeeds: [
      'Freedom from chronic catastrophic panic',
      'Predictable study routines and time boundaries',
      'Emotional permission to fail without losing love',
      'Safe digital boundaries protecting personal peace'
    ],
    commonDisguisedWants: [
      {
        fleetingWant: 'Constantly checking class WhatsApp groups every 4 minutes',
        realUnderlyingNeed: 'Anxiety about missing an announcement or being judged; craving control over an unpredictable schedule.',
        distractionTrigger: 'Internal alarm bells seeking reassurance.',
        nourishingAlternative: 'Muting notifications for 90 minutes and checking messages only at designated daily checkpoint times.'
      },
      {
        fleetingWant: 'Avoiding starting a major project and cleaning desk/drawers instead',
        realUnderlyingNeed: 'Fear of incompetence or harsh judgment on the assignment.',
        distractionTrigger: 'Procrastination masquerading as productive preparation.',
        nourishingAlternative: 'Use the 5-Minute Micro-Start on just the outline, affirming that a messy first draft is safe.'
      }
    ],
    healthyRootFulfillments: [
      'Written single-priority timetable so the brain feels secure',
      '4-7-8 Somatic Vagal Reset during study anxiety',
      'Transparent communication with parents regarding academic pacing',
      'Scheduled distraction-free focus blocks'
    ],
    color: '#f59e0b', // Amber
    bgLight: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    iconEmoji: '🛡️'
  },

  belonging: {
    id: 'belonging',
    level: 3,
    title: 'Authentic Connection & Belonging',
    hindiTitle: 'स्नेह, मित्रता एवं अपनापन',
    tagline: 'True friendship, feeling seen for who you are, safe family warmth.',
    description: 'Human beings are wired for genuine tribe connection. When lonely or insecure in peer groups, teens often chase shallow social validation (likes, follower counts, people-pleasing, agreeing to bad habits) as a hollow surrogate for authentic closeness.',
    coreNeeds: [
      'Feeling unconditionally accepted by at least 1-2 close peers',
      'Warm, judgment-free family conversations',
      'Freedom to express vulnerability without ridicule',
      'Belonging to a group where you don’t have to wear a mask'
    ],
    commonDisguisedWants: [
      {
        fleetingWant: 'Buying expensive trendy items or clothes solely to impress a school group',
        realUnderlyingNeed: 'Craving unconditional acceptance and fear of exclusion or loneliness.',
        distractionTrigger: 'Material conformity substituting for genuine connection.',
        nourishingAlternative: 'Invite 1 genuine friend for a shared walk or quiet creative activity where you can talk openly.'
      },
      {
        fleetingWant: 'Agreeing to every peer request or gaming session when you need to study',
        realUnderlyingNeed: 'Fear of conflict or rejection if you say no.',
        distractionTrigger: 'People-pleasing masking boundary erosion.',
        nourishingAlternative: 'Use the Respectful Boundary Script to politely decline today while scheduling weekend connection.'
      }
    ],
    healthyRootFulfillments: [
      '10-minute honest one-on-one phone call with a trusted friend',
      'Shared family meals without phones at the dinner table',
      'Volunteering or mentoring a younger student',
      'Joining a shared-interest club (chess, coding, art, debate)'
    ],
    color: '#10b981', // Emerald
    bgLight: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    iconEmoji: '❤️'
  },

  esteem: {
    id: 'esteem',
    level: 4,
    title: 'Self-Respect & Competence',
    hindiTitle: 'आत्म-सम्मान, दक्षता एवं पहचान',
    tagline: 'Mastery in skills, earned self-trust, healthy autonomy, genuine respect.',
    description: 'Building empirical proof of your own capability. When students lack avenues for real skill mastery, they often substitute vanity metrics (social media clout, gaming trophies, defensive superiority) to artificially prop up fragile self-worth.',
    coreNeeds: [
      'Developing real competence in 1-2 areas that matter to you',
      'Autonomy in making age-appropriate choices',
      'Evidence-based self-trust (believing your own resilience)',
      'Recognition for sincere effort rather than innate talent'
    ],
    commonDisguisedWants: [
      {
        fleetingWant: 'Spending hours curating the perfect aesthetic social profile or arguing in comment sections',
        realUnderlyingNeed: 'Desire for status, respect, and feeling significant or right.',
        distractionTrigger: 'Digital vanity substituting for real-world mastery.',
        nourishingAlternative: 'Log 2 micro-victories in your Evidence Jar and practice 30 minutes of real skill training (coding, instrument, math).'
      },
      {
        fleetingWant: 'Obsessively tweaking formatting and colors of study notes for 2 hours instead of solving problems',
        realUnderlyingNeed: 'Fear of testing actual competence; hiding in pseudo-work that looks impressive.',
        distractionTrigger: 'Perfectionism as a shield against potential errors.',
        nourishingAlternative: 'Apply the 70% Good-Enough Release and jump directly into testing your knowledge with sample questions.'
      }
    ],
    healthyRootFulfillments: [
      'Tackling a challenging problem and solving it independently',
      'Daily Micro-Victory Evidence Jar logging',
      'Teaching a difficult concept to a peer',
      'Finishing a personal project end-to-end without abandoning it'
    ],
    color: '#0284c7', // Sky Blue
    bgLight: 'rgba(2, 132, 199, 0.08)',
    borderColor: 'rgba(2, 132, 199, 0.3)',
    iconEmoji: '🏆'
  },

  self_actualization: {
    id: 'self_actualization',
    level: 5,
    title: 'Self-Actualization & Purpose',
    hindiTitle: 'आत्म-साक्षात्कार एवं लक्ष्य',
    tagline: 'Living your authentic potential, creative divergence, aligned contribution.',
    description: 'The summit of human potential. Channeling your natural 16-type strengths, curiosity, and ethical compass to create something meaningful. Only sustainable when the lower 4 foundational tiers are consistently nourished.',
    coreNeeds: [
      'Aligning daily action with personal values, not external pressure',
      'Unstructured creative divergence and exploration',
      'Contributing positively to family, school, or community',
      'Exploring careers that resonate with authentic strengths'
    ],
    commonDisguisedWants: [
      {
        fleetingWant: 'Starting 6 different grandiose hobbies or startup projects in one week and abandoning all of them',
        realUnderlyingNeed: 'Hunger for purpose and self-expression, without the foundational discipline to weather the messy middle.',
        distractionTrigger: 'Shiny object syndrome substituting for grounded execution.',
        nourishingAlternative: 'Select ONE single creative endeavor and commit to a 20-minute daily practice block for 14 continuous days.'
      },
      {
        fleetingWant: 'Daydreaming about becoming famous or wealthy overnight',
        realUnderlyingNeed: 'Yearning to matter and leave an impact on the world.',
        distractionTrigger: 'Passive fantasy substituting for active contribution.',
        nourishingAlternative: 'Identify 1 small real-world problem you can solve this week for your school, home, or neighborhood.'
      }
    ],
    healthyRootFulfillments: [
      'Creating original art, writing, music, or code purely for the joy of creation',
      'Reflecting in the Self-Evolution Sanctuary on actual vs improvised potential',
      'Mentoring others and giving back to your community',
      'Deep flow states aligned with your RIASEC and 16-type superpowers'
    ],
    color: '#8b5cf6', // Violet
    bgLight: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    iconEmoji: '✨'
  }
};

/**
 * Common heuristic patterns to automatically discern whether an adolescent's want
 * is a Core Need, a Healthy Desire, or a Dopamine Trap masking an unmet Maslow tier.
 */
export function discernWantVsNeed(
  expressedWant: string,
  userProfile?: UnifiedProfile | null,
  user?: User | null
): {
  rootTier: MaslowTier;
  classification: WantClassification;
  rootExplanation: string;
  nourishingAlternative: string;
  discerningQuestions: string[];
  personalizedInsight: string;
} {
  const text = expressedWant.toLowerCase();
  const firstName = user?.name ? user.name.split(' ')[0] : 'You';
  const learningStyle = userProfile?.cognition?.learningStyle || 'mixed';
  const sixteenRole = userProfile?.sixteenType?.definition?.role || 'explorers';

  // Pattern Detection for Common Adolescent Desires
  
  // 1. Screen / Social Media / Reels / TikTok / YouTube binge
  if (/\b(scroll\w*|reel\w*|shorts?|tiktok|instagram|phone|feed|youtube|screen\w*|binge\w*)\b/i.test(text)) {
    return {
      rootTier: 'physiological',
      classification: 'dopamine_trap',
      rootExplanation: 'Your prefrontal cortex is exhausted and seeking low-effort stimulation because your biological engine needs sensory rest or sleep.',
      nourishingAlternative: 'Step away from all back-lit screens. Drink a large glass of water, do a 3-minute physical stretch, or take a 15-minute power nap.',
      discerningQuestions: [
        'How will you feel 60 minutes from now if you continue scrolling?',
        'Is your body genuinely tired, thirsty, or needing physical movement?',
        'Can you give yourself permission to sleep instead of forcing pseudo-studying?'
      ],
      personalizedInsight: `${firstName}, as a ${learningStyle} learner, prolonged motionless screen time quickly numbs your executive focus. A physical sensory reset will replenish you 5x faster than digital scrolling.`
    };
  }

  // 2. Junk Food / Sugar / Cravings
  if (/\b(sugar\w*|junk\w*|chocolate\w*|soda|chips|fast\s*food|burger|pizza|craving\w*|snack\w*)\b/i.test(text)) {
    return {
      rootTier: 'physiological',
      classification: 'dopamine_trap',
      rootExplanation: 'Brain energy dip. When studying or emotionally stressed, your brain requests fast carbohydrates as a substitute for physical movement or real rest.',
      nourishingAlternative: 'Drink cold water and eat a slow-burning healthy snack (fruit, yogurt, nuts). Take 5 deep breaths.',
      discerningQuestions: [
        'Are you physically hungry, or are you mentally bored and tired of sitting?',
        'Would a 5-minute brisk walk outside solve the sluggish feeling?'
      ],
      personalizedInsight: 'Quick dopamine spikes from sugar lead to a sharp insulin crash 30 minutes later, triggering even worse study brain-fog.'
    };
  }

  // 3. Exam avoidance / Delaying study / Procrastination
  if (/\b(procrastinat\w*|avoid\w*|delay\w*|skip\w*|cancel\w*|escape\w*|afraid|fear\w*|overwhelm\w*|exam|test\s+prep)\b/i.test(text)) {
    return {
      rootTier: 'safety',
      classification: 'dopamine_trap',
      rootExplanation: 'Avoidance of catastrophic fear. Your nervous system is perceiving the assignment as a threat to your self-worth or safety.',
      nourishingAlternative: 'Apply the 5-Minute Micro-Start on just the title and first equation. Break the threat into a harmless micro-step.',
      discerningQuestions: [
        'What is the worst-case scenario your mind is catastrophizing?',
        'Can you do just 5 minutes without judging the quality of the work?'
      ],
      personalizedInsight: 'Action reduces anxiety; avoidance amplifies it. Lowering the activation threshold restores safety to your prefrontal cortex.'
    };
  }

  // 4. Buying things to impress / Fashion / Gear / Clout
  if (/\b(buy\w*|sneaker\w*|shoes?|clothes?|expensive|impress\w*|flex\w*|clout|status|cool)\b/i.test(text)) {
    return {
      rootTier: 'belonging',
      classification: 'dopamine_trap',
      rootExplanation: 'Craving acceptance and belonging. Wanting material markers to feel secure within a school peer group.',
      nourishingAlternative: 'Connect one-on-one with a true friend who appreciates your authentic personality, not what you wear.',
      discerningQuestions: [
        'If no one at school ever saw this item, would you still want it with the same urgency?',
        'Are you trying to purchase belonging instead of building real connection?'
      ],
      personalizedInsight: `Your authentic strengths as a ${sixteenRole} type are your true magnet for genuine, lifelong friends.`
    };
  }

  // 5. Saying yes to peer pressure / People-pleasing
  if (/\b(please\w*|say\s+yes|cannot\s+say\s+no|agree\w*|peer\s+pressure)\b/i.test(text)) {
    return {
      rootTier: 'belonging',
      classification: 'dopamine_trap',
      rootExplanation: 'Fear of rejection and abandonment. Sacrificing your own sleep or study goals to preserve group approval.',
      nourishingAlternative: 'Use the Respectful Boundary Script: "I really value our time, but my plate is full with goals today. Let us hang out this weekend!"',
      discerningQuestions: [
        'If this friend truly respects you, will they understand a gentle boundary?',
        'Are you saying yes to others while saying no to your own wellbeing?'
      ],
      personalizedInsight: 'Healthy relationships are built on mutual respect, not constant self-sacrifice.'
    };
  }

  // 6. Skill learning / Creative art / Project building (Genuine Self-Actualization or Healthy Desire)
  if (/\b(learn\w*|code|coding|music|guitar|art|draw\w*|write|writing|build\w*|creat\w*|experiment\w*|read\w*)\b/i.test(text)) {
    return {
      rootTier: 'self_actualization',
      classification: 'healthy_desire',
      rootExplanation: 'A genuine developmental yearning for creative expression and personal competence (Level 4/5).',
      nourishingAlternative: 'Schedule a protected 25-minute creative sprint on your calendar so it enriches your life without derailing exams.',
      discerningQuestions: [
        'Does this activity leave you feeling energized and deeply satisfied afterwards?',
        'Can you commit to practicing this consistently rather than as a fleeting impulse?'
      ],
      personalizedInsight: `${firstName}, creative divergence is a cornerstone of your growth. When balanced with foundational rest, this is where your authentic potential flourishes.`
    };
  }

  // 7. General fallback / Freeform want
  return {
    rootTier: 'esteem',
    classification: 'healthy_desire',
    rootExplanation: 'An expressed desire for autonomy, recognition, or personal fulfillment.',
    nourishingAlternative: 'Pause for 10 minutes. Check your physical state (water, rest) and ask what core need this want is serving.',
    discerningQuestions: [
      'Will this action nourish your energy or deplete it?',
      'Which Maslow level (Foundation, Safety, Belonging, Esteem, Purpose) is calling out?'
    ],
    personalizedInsight: 'Every desire carries a message about an underlying human need. Listen to the need, not just the impulsive want.'
  };
}

/**
 * Calculates a comprehensive Maslow fulfillment profile based on
 * the user's Big Five, wellbeing score, tracked needs, and journal reflections.
 */
export function calculateMaslowAudit(
  profile: UnifiedProfile | null,
  user: User | null,
  journalEntries: GrowthJournalEntry[] = [],
  trackedNeeds: TrackedNeedItem[] = []
): MaslowAuditReport {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';
  const bigFive = profile?.personality?.bigFive || {
    openness: 60,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 60,
    neuroticism: 40
  };
  const wellbeing = profile?.wellbeingScore || 70;

  // Track redirects and dopamine traps
  const trapsCount = trackedNeeds.filter(n => n.classification === 'dopamine_trap').length;
  const redirectedCount = trackedNeeds.filter(n => n.status === 'redirected' || n.status === 'fulfilled').length;

  // 1. Physiological Score
  let physioBase = Math.round(wellbeing * 0.85);
  // Journal indicators
  const sleepRestTags = journalEntries.filter(e => e.tags.some(t => /sleep|rest|energy|tired|fatigue/i.test(t))).length;
  if (sleepRestTags > 2) physioBase -= 10;
  if (redirectedCount > 0) physioBase += 5;
  const physioScore = Math.min(Math.max(physioBase, 25), 98);

  // 2. Safety & Security Score
  // Emotional stability = 100 - neuroticism
  const emotionalStability = 100 - bigFive.neuroticism;
  let safetyBase = Math.round(emotionalStability * 0.7 + wellbeing * 0.3);
  const anxietyTags = journalEntries.filter(e => e.tags.some(t => /anxiety|panic|exam|fear|overwhelm/i.test(t))).length;
  safetyBase -= anxietyTags * 5;
  const safetyScore = Math.min(Math.max(safetyBase, 20), 98);

  // 3. Belonging & Connection Score
  let belongBase = Math.round(bigFive.agreeableness * 0.5 + (bigFive.extraversion > 30 ? 35 : 25) + wellbeing * 0.2);
  const friendshipTags = journalEntries.filter(e => e.tags.some(t => /friend|peer|family|belong/i.test(t))).length;
  belongBase += friendshipTags * 3;
  const belongScore = Math.min(Math.max(belongBase, 30), 98);

  // 4. Esteem & Competence Score
  let esteemBase = Math.round(bigFive.conscientiousness * 0.6 + wellbeing * 0.3);
  const strengthCount = journalEntries.filter(e => e.type === 'strength').length;
  esteemBase += strengthCount * 4;
  const esteemScore = Math.min(Math.max(esteemBase, 30), 99);

  // 5. Self-Actualization Score
  let actualBase = Math.round(bigFive.openness * 0.6 + (esteemScore > 70 ? 25 : 15));
  const creativeCount = journalEntries.filter(e => e.tags.some(t => /creativity|curiosity|dream|vision|growth/i.test(t))).length;
  actualBase += creativeCount * 3;
  const actualScore = Math.min(Math.max(actualBase, 25), 98);

  const getStatus = (score: number): 'starved' | 'fragile' | 'balanced' | 'flourishing' => {
    if (score < 45) return 'starved';
    if (score < 65) return 'fragile';
    if (score < 82) return 'balanced';
    return 'flourishing';
  };

  const tierScores: Record<MaslowTier, MaslowFulfillmentScore> = {
    physiological: {
      tier: 'physiological',
      level: 1,
      title: 'Physiological Foundation',
      score: physioScore,
      status: getStatus(physioScore),
      statusSummary: physioScore < 50 
        ? 'Body battery depleted: Irregular sleep and screen fatigue are triggering sudden cravings and brain fog.'
        : 'Biological rhythms are stable; physical energy supports sustained focus.',
      recommendation: 'Prioritize a non-negotiable 8-hour sleep window and 20-minute afternoon sensory detox.'
    },
    safety: {
      tier: 'safety',
      level: 2,
      title: 'Emotional & Routine Safety',
      score: safetyScore,
      status: getStatus(safetyScore),
      statusSummary: safetyScore < 50
        ? 'Internal alarm bells active: Exam worry and unpredictable routines trigger procrastination as an escape hatch.'
        : 'Feeling psychologically safe and grounded in your study routines.',
      recommendation: 'Use the 4-7-8 Somatic Vagal Reset and single-priority study blocks to quiet internal panic.'
    },
    belonging: {
      tier: 'belonging',
      level: 3,
      title: 'Authentic Connection',
      score: belongScore,
      status: getStatus(belongScore),
      statusSummary: belongScore < 50
        ? 'Social connection feels strained or superficial; risk of people-pleasing to maintain acceptance.'
        : 'Supported by authentic connections where you can be yourself without wearing a mask.',
      recommendation: 'Schedule 15 minutes of uninterrupted conversation with a trusted peer or family member.'
    },
    esteem: {
      tier: 'esteem',
      level: 4,
      title: 'Self-Respect & Competence',
      score: esteemScore,
      status: getStatus(esteemScore),
      statusSummary: esteemScore < 50
        ? 'Self-trust is vulnerable; susceptible to imposter syndrome or hiding behind vanity metrics.'
        : 'Consistent skill progress and healthy self-respect are evident.',
      recommendation: 'Record daily micro-victories in your Evidence Jar to build empirical proof of competence.'
    },
    self_actualization: {
      tier: 'self_actualization',
      level: 5,
      title: 'Self-Actualization & Purpose',
      score: actualScore,
      status: getStatus(actualScore),
      statusSummary: actualScore < 50
        ? 'Creative inspiration is dormant because foundational energy is consumed by lower-tier stress.'
        : 'Actively aligning daily habits with your authentic strengths and creative potential.',
      recommendation: 'Protect 20 minutes daily for pure creative divergence aligned with your 16-type superpowers.'
    }
  };

  // Find the lowest tier (from bottom up): Maslow principle: lower tiers must be secured first!
  const tiersInOrder: MaslowTier[] = ['physiological', 'safety', 'belonging', 'esteem', 'self_actualization'];
  let hungryTierKey: MaslowTier = 'physiological';
  let lowestScore = 100;

  for (const t of tiersInOrder) {
    if (tierScores[t].score < 60) {
      hungryTierKey = t;
      break;
    }
    if (tierScores[t].score < lowestScore) {
      lowestScore = tierScores[t].score;
      hungryTierKey = t;
    }
  }

  const overallMaslowIndex = Math.round(
    (physioScore + safetyScore + belongScore + esteemScore + actualScore) / 5
  );

  let distractionRiskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (physioScore < 50 || safetyScore < 50) distractionRiskLevel = 'high';
  else if (overallMaslowIndex < 70 || trapsCount > 3) distractionRiskLevel = 'moderate';

  const guidingInsight = distractionRiskLevel === 'high'
    ? `${firstName}, your distraction urges are not personal failures of willpower. Your ${MASLOW_TIERS[hungryTierKey].title} is currently hungry. When your foundation is starved, the brain naturally reaches for dopamine substitutes. Nourish Level ${MASLOW_TIERS[hungryTierKey].level} first!`
    : `${firstName}, your foundational needs are balanced. You are in a strong state to channel your energy toward purposeful mastery and creative flow.`;

  return {
    userTitle: firstName,
    hungryTier: MASLOW_TIERS[hungryTierKey],
    tierScores,
    overallMaslowIndex,
    distractionRiskLevel,
    guidingInsight
  };
}
