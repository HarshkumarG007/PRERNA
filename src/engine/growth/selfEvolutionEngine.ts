/**
 * selfEvolutionEngine.ts
 * 
 * Core engine for PRERNA's Self-Evolution, Strengths & Growth Journal,
 * and Personalized Behavioral Self-Management Strategies.
 * 
 * Rooted in:
 *  - Higgins' Self-Discrepancy Theory (Actual Self vs Ideal Evolved Self)
 *  - Positive Adolescent Psychology & Non-Pathologizing Growth Edges
 *  - Cognitive-Behavioral (CBT) & Acceptance-Commitment (ACT) micro-interventions
 *  - Multi-Dimensional Personalization: Big Five, 16-Type, Learning Style, Age Tier, and Journal Feedback
 */

import { SixteenTypeResult } from '../assessment/sixteenPersonalities';
import { UnifiedProfile, User } from '../../store';

export interface GrowthJournalEntry {
  id: string;
  createdAt: string;
  type: 'strength' | 'growth_edge' | 'reflection';
  title: string;
  reflection: string;
  tags: string[];
  mitigationUsed?: string;
  moodRating: number; // 1-5 scale
}

export interface MitigationStrategy {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'focus' | 'emotional_calm' | 'relationships' | 'confidence' | 'habits';
  tagline: string;
  targetFriction: string;
  psychologicalMechanism: string;
  stepByStep: string[];
  applicableTypes?: string[];
  quickMantra: string;
  isCustom?: boolean;
}

export interface SelfImageComparison {
  currentSelf: {
    title: string;
    description: string;
    dominantStates: string[];
    frictionPoints: string[];
    energySources: string[];
  };
  evolvedSelf: {
    title: string;
    description: string;
    unlockedCapacities: string[];
    habitsToCultivate: string[];
    guidingVision: string;
  };
  steppingStones: {
    phase: string;
    action: string;
    focus: string;
  }[];
}

export interface PersonalizedStrategyRecommendation {
  strategy: MitigationStrategy;
  matchScore: number; // 0 - 100%
  matchReason: string;
  priority: 'primary' | 'recommended' | 'supportive';
  learningStyleTip?: string;
}

export interface PersonalizedSelfManagementPlan {
  userTitle: string;
  archetypeTitle: string;
  archetypeSubtitle: string;
  coreFrictionPattern: string;
  learningStyleGuidance: {
    style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    title: string;
    description: string;
    actionableTip: string;
  };
  ageTierGuidance: {
    tier: '13-15' | '16-17' | '18+';
    context: string;
    focus: string;
  };
  dailyKeystoneRoutine: {
    morningAnchor: string;
    studyFocusRule: string;
    eveningReflection: string;
  };
  recommendedStrategies: PersonalizedStrategyRecommendation[];
}

export const MITIGATION_STRATEGIES: MitigationStrategy[] = [
  {
    id: 'five-minute-micro-start',
    title: 'The 5-Minute Micro-Start',
    hindiTitle: '५-मिनट आरंभ नियम',
    category: 'focus',
    tagline: 'Break task paralysis before self-doubt can catch up.',
    targetFriction: 'Procrastination, staring at difficult assignments, avoidance.',
    psychologicalMechanism: 'Reduces amygdala threat response by lowering the activation threshold. Once dopamine engages during action, momentum carries you forward.',
    stepByStep: [
      'Choose the single task you have been delaying.',
      'Set a timer for exactly 5 minutes with zero expectation of finishing.',
      'Open the book or notebook and write just the title and first sentence.',
      'When the timer rings, give yourself permission to stop — 85% of the time, you will choose to keep going.'
    ],
    quickMantra: 'Action creates motivation, not the other way around.'
  },
  {
    id: 'dopamine-chunking-sprint',
    title: 'The 20/5 Dopamine Sprint',
    hindiTitle: 'डोपामाइन स्प्रिंट विधि',
    category: 'focus',
    tagline: 'Match your brain’s natural ultradian rhythm with structured breaks.',
    targetFriction: 'Mental fatigue after 15 minutes, restless task switching, zoning out while studying.',
    psychologicalMechanism: 'Aligns with biological ultradian attention cycles. High-intensity bursts prevent dopamine exhaustion and keep attention fresh.',
    stepByStep: [
      'Choose ONE single topic or chapter to tackle.',
      'Set a 20-minute timer and close all irrelevant phone apps or browser tabs.',
      'Study with full presence until the timer chimes.',
      'Take an immediate 5-minute break away from screens (drink water, do a quick physical stretch).'
    ],
    quickMantra: 'Short focused sprints beat hours of distracted pseudo-studying.'
  },
  {
    id: 'eisenhower-focus-funnel',
    title: 'The Single-Priority Funnel',
    hindiTitle: 'प्राथमिकता निर्धारण विधि',
    category: 'habits',
    tagline: 'Filter a mountain of overwhelming tasks into one decisive target.',
    targetFriction: 'Feeling paralyzed by 10 competing assignments, doing easy busywork instead of high-stakes study.',
    psychologicalMechanism: 'Reduces cognitive load on working memory (Cowan’s 4-chunk limit). Eliminates the decision fatigue that triggers avoidance.',
    stepByStep: [
      'Write down all tasks currently stressing your mind on a scrap piece of paper.',
      'Circle the ONE task that will give you the deepest sigh of relief once finished today.',
      'Hide the rest of the list in a drawer or closed folder.',
      'Work exclusively on that single circled target before touching anything else.'
    ],
    quickMantra: 'If you have five top priorities, you have zero priorities.'
  },
  {
    id: 'thought-vs-fact-detangler',
    title: 'Thought vs. Fact Detangler',
    hindiTitle: 'विचार बनाम वास्तविकता',
    category: 'emotional_calm',
    tagline: 'Separate internal alarm bells from actual reality.',
    targetFriction: 'Overthinking, catastrophizing exam results or peer conversations.',
    psychologicalMechanism: 'Cognitive defusion (CBT). Decouples emotional narratives generated by cognitive distortion from objective empirical facts.',
    stepByStep: [
      'Write down the anxious thought verbatim: "I am definitely going to fail tomorrow\'s test."',
      'Ask: "What is 1 objective piece of evidence that disproves this?"',
      'Ask: "If my closest friend had this thought, what compassionate truth would I tell them?"',
      'Rewrite the thought into an objective statement: "I feel nervous, but I have revised chapter 1 and 2."'
    ],
    quickMantra: 'A thought is an event in the mind, not a command from reality.'
  },
  {
    id: 'somatic-vagal-reset',
    title: '4-7-8 Somatic Vagal Reset',
    hindiTitle: 'प्राणायाम तंत्रिका विश्राम',
    category: 'emotional_calm',
    tagline: 'Down-regulate physical panic and racing heartbeats in under 90 seconds.',
    targetFriction: 'Exam hall panic, trembling hands, shallow breathing before speaking up.',
    psychologicalMechanism: 'Vagal nerve stimulation. Prolonged exhalations increase parasympathetic tone, directly slowing heart rate and lowering cortisol.',
    stepByStep: [
      'Exhale completely through your mouth with a soft whoosh sound.',
      'Close your mouth and inhale gently through your nose for 4 counts.',
      'Hold your breath calmly without straining for 7 counts.',
      'Exhale completely and audibly through your mouth for 8 counts.',
      'Repeat for 4 breath cycles until your chest feels calm and settled.'
    ],
    quickMantra: 'Long exhalations tell the nervous system that the emergency is over.'
  },
  {
    id: 'three-second-pause',
    title: 'The 3-Second Active Pause',
    hindiTitle: 'तीन सेकंड का ठहराव',
    category: 'relationships',
    tagline: 'Replace defensive reactions with conscious intention.',
    targetFriction: 'Snapping during family arguments, impulsive social replies.',
    psychologicalMechanism: 'Interrupts the subcortical fight-or-flight cascade and reactivates the ventromedial prefrontal cortex for deliberate communication.',
    stepByStep: [
      'Notice the physical trigger: tight jaw, warm chest, racing heartbeat.',
      'Take 1 slow breath through the nose for 3 seconds before opening your mouth.',
      'Silently ask: "Will what I am about to say solve this or make it heavier?"',
      'Respond with a calm clarifying question instead of an accusation.'
    ],
    quickMantra: 'Pause before reaction; clarity over impulse.'
  },
  {
    id: 'energy-shield-introvert',
    title: 'The Social Recharge Shield',
    hindiTitle: 'सामाजिक ऊर्जा संरक्षण',
    category: 'relationships',
    tagline: 'Protect your inner battery from peer overload without guilt.',
    targetFriction: 'Feeling completely drained after school, sensory exhaustion from noisy groups, guilt for needing quiet.',
    psychologicalMechanism: 'Cognitive decompression. Introverted neural wiring requires low-stimulation intervals to restore acetylcholine and prefrontal reserves.',
    stepByStep: [
      'Block out a 20-30 minute "Zero-Social Sanctuary" immediately after returning home.',
      'Inform family/friends kindly: "I had a busy day and need 20 minutes of quiet to recharge my battery."',
      'Engage in low-stimulation restorative downtime (drawing, reading, sitting in nature, soothing music).',
      'Re-enter conversations when your battery feels re-energized.'
    ],
    quickMantra: 'Solitude is not anti-social; it is how my authentic power recharges.'
  },
  {
    id: 'respectful-boundary-script',
    title: 'The Respectful Boundary Script',
    hindiTitle: 'सकारात्मक सीमा निर्धारण',
    category: 'relationships',
    tagline: 'Saying no to peer overload without guilt or conflict.',
    targetFriction: 'People-pleasing, agreeing to every request, feeling drained.',
    psychologicalMechanism: 'Assertiveness training. Protects emotional bandwidth and prevents covert resentment while maintaining mutual respect.',
    stepByStep: [
      'Validate first: "I really appreciate you asking me..."',
      'Deliver the gentle boundary clearly: "...but my plate is full with study goals today."',
      'Offer an alternative if you want: "Let us connect this weekend for half an hour."',
      'Do not over-apologize or create fabricated excuses.'
    ],
    quickMantra: 'Saying no to what drains you is saying yes to your wellbeing.'
  },
  {
    id: 'seventy-percent-release',
    title: 'The 70% "Good-Enough" Release',
    hindiTitle: 'उत्कृष्टता बनाम पूर्णता',
    category: 'confidence',
    tagline: 'Overcome perfectionist paralysis and finish what matters.',
    targetFriction: 'Spending hours polishing minor details, missing deadlines, never showing your work.',
    psychologicalMechanism: 'Diminishing returns reframe. The last 10% of perfectionism costs 90% of your energy without meaningful gain in value.',
    stepByStep: [
      'Identify what "70% complete" actually looks like (core points covered, readable, honest).',
      'When your work reaches 70%, stop tweaking fonts, colors, and phrasing.',
      'Submit, share, or move on to the next chapter.',
      'Remind yourself: Real mastery is built on iteration, not a single flawless draft.'
    ],
    quickMantra: 'Done with honesty is infinitely better than perfect in imagination.'
  },
  {
    id: 'evidence-jar-victories',
    title: 'The Micro-Victory Evidence Jar',
    hindiTitle: 'दैनिक उपलब्धियों का संचय',
    category: 'confidence',
    tagline: 'Proof of your resilience, stored when self-doubt whispers.',
    targetFriction: 'Imposter syndrome, feeling like you are falling behind your peers.',
    psychologicalMechanism: 'Negativity bias compensation. The human brain naturally encodes failures 5x faster than successes; deliberate logging balances memory consolidation.',
    stepByStep: [
      'Every night, write down 2 tiny real things you accomplished.',
      'Include internal victories: "I stayed calm when upset", "I asked a question in chemistry class."',
      'Read through past entries whenever self-doubt tries to tell you you cannot do it.'
    ],
    quickMantra: 'Growth is built in drops, not floods.'
  }
];

/**
 * Derives a personalized Self-Image comparison based on the user's 16-type and Big Five traits.
 */
export function generateSelfImageComparison(
  sixteenType?: SixteenTypeResult | null,
  name?: string
): SelfImageComparison {
  const typeDef = sixteenType?.definition;
  const firstName = (typeof name === 'string' && name.trim()) ? name.trim().split(' ')[0] : 'You';

  return {
    currentSelf: {
      title: `${firstName}'s Current Foundation (${sixteenType?.fullCode || 'Current Self'})`,
      description: `Today, you operate with natural strengths in ${typeDef?.traits.slice(0, 2).join(' and ') || 'curiosity and reflection'}, but occasionally face friction from ${typeDef?.growthAreas[0] || 'perfectionism and overthinking'}. You are discovering how to turn your inner intuition into consistent outer momentum.`,
      dominantStates: [
        `Natural inclination toward ${typeDef?.traits[0] || 'deep thinking'}`,
        `Energized by ${typeDef?.careerDirections[0] || 'creative exploration'}`,
        'Searching for consistent focus routines amidst daily distractions'
      ],
      frictionPoints: typeDef?.growthAreas || [
        'Overthinking outcomes before starting',
        'Struggling to say no to distracting peer requests',
        'Hesitating to share work until it feels flawless'
      ],
      energySources: [
        'Meaningful one-on-one conversations',
        'Unstructured creative brainstorming',
        'Quiet reflection time to recharge'
      ]
    },
    evolvedSelf: {
      title: `${firstName}'s Evolved Potential (The Self-Actualized ${typeDef?.name || 'Explorer'})`,
      description: `The version of you that has learned to channel your ${typeDef?.traits[0] || 'unique strengths'} with grounded confidence, steady boundaries, and actionable clarity. You no longer let friction points freeze your momentum.`,
      unlockedCapacities: [
        `Expresses ${typeDef?.traits[0] || 'natural strengths'} without fear of comparison`,
        'Acts decisively on goals without waiting for 100% certainty',
        'Maintains calm emotional balance through challenges and setbacks',
        'Sets healthy boundaries that preserve energy for what truly matters'
      ],
      habitsToCultivate: [
        'Daily 5-minute focused jumpstart on top priority',
        'Regular gratitude and micro-victory reflection',
        'Intentional pause before responding in emotional moments'
      ],
      guidingVision: `"${firstName} who honors their authentic nature, leads their own trajectory, and turns inner inspiration into positive real-world impact."`
    },
    steppingStones: [
      {
        phase: 'Stage 1: Grounding Awareness',
        action: 'Recognize your natural trait patterns without judgment or self-blame.',
        focus: 'Log 1 daily reflection in your Strengths Journal.'
      },
      {
        phase: 'Stage 2: Micro-Mitigations',
        action: 'Practice 1 behavioral mitigation tool when friction or anxiety arises.',
        focus: 'Use the 5-Minute Micro-Start on delayed study goals.'
      },
      {
        phase: 'Stage 3: Flourishing Mastery',
        action: 'Align your career exploration and relationships with your true strengths.',
        focus: 'Live your natural 16-type strengths with joy and confidence.'
      }
    ]
  };
}

/**
 * Deep Personalization Engine:
 * Analyzes Big Five personality traits, 16-Type, Cognition/Learning Style, Age Tier,
 * and user's past journal entries to generate a tailor-made self-management plan.
 */
export function generatePersonalizedSelfManagementPlan(
  profile: UnifiedProfile | null,
  user: User | null,
  journalEntries: GrowthJournalEntry[] = [],
  completedMitigations: Record<string, number> = {},
  customMitigations: MitigationStrategy[] = []
): PersonalizedSelfManagementPlan {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';
  const ageRange = user?.ageRange || '16-17';
  const bigFive = profile?.personality?.bigFive || {
    openness: 60,
    conscientiousness: 50,
    extraversion: 45,
    agreeableness: 60,
    neuroticism: 40
  };
  const sixteenType = profile?.sixteenType;
  const learningStyle = profile?.cognition?.learningStyle || 'mixed';

  // 1. Analyze frequent friction themes from user's local journal
  const frictionTagCounts: Record<string, number> = {};
  journalEntries.forEach(entry => {
    if (entry.type === 'growth_edge' || entry.type === 'reflection') {
      entry.tags.forEach(tag => {
        const lower = tag.toLowerCase();
        frictionTagCounts[lower] = (frictionTagCounts[lower] || 0) + 1;
      });
    }
  });

  const hasProcrastinationFriction = (frictionTagCounts['procrastination'] || 0) + (frictionTagCounts['focus'] || 0) > 0;
  const hasPerfectionismFriction = (frictionTagCounts['perfectionism'] || 0) > 0;
  const hasOverthinkingFriction = (frictionTagCounts['overthinking'] || 0) + (frictionTagCounts['self-talk'] || 0) > 0;
  const hasBoundaryFriction = (frictionTagCounts['boundaries'] || 0) + (frictionTagCounts['friendship'] || 0) > 0;
  const hasExamStress = (frictionTagCounts['exams'] || 0) > 0;

  // 2. Derive Personal Self-Management Archetype
  let archetypeTitle = 'The Intuitive Explorer';
  let archetypeSubtitle = 'Seeking Grounded Focus & Consistent Momentum';
  let coreFrictionPattern = 'Balancing deep inspiration with day-to-day study consistency';

  if (bigFive.openness >= 65 && bigFive.conscientiousness < 45) {
    archetypeTitle = 'The Visionary Creator';
    archetypeSubtitle = 'Rich with ideas, but encountering task-initiation friction';
    coreFrictionPattern = 'Starting projects with excitement but struggling to push through the messy middle';
  } else if (bigFive.conscientiousness >= 65 && bigFive.neuroticism >= 50) {
    archetypeTitle = 'The High-Achieving Perfectionist';
    archetypeSubtitle = 'Highly disciplined, but vulnerable to overwork and self-criticism';
    coreFrictionPattern = 'Spending 90% of your energy on the final 10% of unnecessary perfection';
  } else if (bigFive.agreeableness >= 65 && bigFive.extraversion < 50) {
    archetypeTitle = 'The Empathetic Guardian';
    archetypeSubtitle = 'Deeply caring and observant, but easily drained by social pressure';
    coreFrictionPattern = 'Saying yes to peer demands at the expense of your personal focus and wellbeing';
  } else if (bigFive.extraversion >= 65 && bigFive.conscientiousness < 55) {
    archetypeTitle = 'The Dynamic Catalyst';
    archetypeSubtitle = 'Energized by action and peers, but easily pulled into multitasking';
    coreFrictionPattern = 'Frequent distraction from phones, chats, and fast-moving stimulation';
  } else if (bigFive.neuroticism >= 55) {
    archetypeTitle = 'The Sensitive Deep-Thinker';
    archetypeSubtitle = 'Hyper-aware of nuance, but susceptible to anxious rumination';
    coreFrictionPattern = 'Internal alarm bells magnifying minor setbacks into catastrophes';
  }

  // 3. Learning Style Guidance
  const learningStyleGuidanceMap = {
    visual: {
      style: 'visual' as const,
      title: 'Visual Focus Architecture',
      description: 'Your brain consolidates information best when externalized into spatial layouts and color-coded hierarchies.',
      actionableTip: 'Use a physical desk whiteboard, color-coded task cards, and visible countdown timers instead of invisible phone alarms.'
    },
    kinesthetic: {
      style: 'kinesthetic' as const,
      title: 'Somatic & Movement-Linked Flow',
      description: 'Your focus is anchored in physical state changes; sitting motionless for hours numbs your prefrontal processing.',
      actionableTip: 'Pair difficult memorization with standing desks or slow pacing. Use 20-minute study sprints punctuated by 5-minute physical stretches.'
    },
    auditory: {
      style: 'auditory' as const,
      title: 'Vocalized & Rhythmic Focus',
      description: 'Your cognitive retention surges when concepts are spoken, debated, or rhythmic.',
      actionableTip: 'Explain difficult concepts out loud as if teaching a friend. Vocalize your quick mantras to interrupt anxious thoughts.'
    },
    mixed: {
      style: 'mixed' as const,
      title: 'Multi-Modal Sensory Balance',
      description: 'You thrive when cycling between visual diagrams, verbal notes, and tactile engagement.',
      actionableTip: 'Map concepts visually first, speak them through, and use hands-on practice problems to solidify retention.'
    }
  };

  const learningStyleGuidance = learningStyleGuidanceMap[learningStyle] || learningStyleGuidanceMap.mixed;

  // 4. Age Tier Guidance
  const ageTierGuidanceMap = {
    '13-15': {
      tier: '13-15' as const,
      context: 'Early Adolescence • Neuroplastic Foundation Stage',
      focus: 'Focus on habit funnels and emotional grounding without academic burnout. Build self-trust over peer comparison.'
    },
    '16-17': {
      tier: '16-17' as const,
      context: 'Senior School / Board Exams • High-Stakes Pressure Stage',
      focus: 'Manage examination panic and high expectations. Prioritize single-tasking funnels and healthy boundary scripts with peer study groups.'
    },
    '18+': {
      tier: '18+' as const,
      context: 'Emerging Adulthood • Autonomous Trajectory Stage',
      focus: 'Cultivate self-directed executive routines, career clarity, and unshakeable resilience against imposter syndrome.'
    }
  };

  const ageTierGuidance = ageTierGuidanceMap[ageRange] || ageTierGuidanceMap['16-17'];

  // 5. Daily Keystone Routine Tailored to User
  const dailyKeystoneRoutine = {
    morningAnchor: bigFive.extraversion < 50
      ? '10 minutes of quiet solitary morning hydration & non-screen reflection'
      : '5-minute brisk movement & review of your single primary target for the day',
    studyFocusRule: learningStyle === 'kinesthetic' || bigFive.conscientiousness < 45
      ? 'Use the 20/5 Dopamine Sprint: 20 minutes intense focus, 5 minutes physical reset'
      : 'The Single-Priority Funnel: Circle the #1 task and keep other tabs closed',
    eveningReflection: bigFive.neuroticism >= 50
      ? 'Write 2 Micro-Victories in your Evidence Jar to counteract negative sleep rumination'
      : 'Take a 3-minute gratitude pause and plan your single priority for tomorrow morning'
  };

  // 6. Score & Rank All Mitigation Strategies for this User
  const allStrategies = [...MITIGATION_STRATEGIES, ...customMitigations];

  const scoredStrategies: PersonalizedStrategyRecommendation[] = allStrategies.map(strategy => {
    let matchScore = 55; // baseline
    const reasons: string[] = [];

    // Big Five Conscientiousness
    if (strategy.id === 'five-minute-micro-start') {
      if (bigFive.conscientiousness < 50) {
        matchScore += 30;
        reasons.push('bypasses startup inertia for your spontaneous temperament');
      }
      if (hasProcrastinationFriction) {
        matchScore += 15;
        reasons.push('directly targets procrastination tags in your journal');
      }
    }

    if (strategy.id === 'dopamine-chunking-sprint') {
      if (learningStyle === 'kinesthetic') {
        matchScore += 30;
        reasons.push('matches your kinesthetic learning style perfectly with physical interval resets');
      }
      if (bigFive.conscientiousness < 55) {
        matchScore += 15;
        reasons.push('prevents dopamine burnout from long unfocused marathons');
      }
    }

    if (strategy.id === 'eisenhower-focus-funnel') {
      if (learningStyle === 'visual') {
        matchScore += 15;
        reasons.push('aligns with your visual cognitive style to declutter mental overwhelm');
      }
      if (ageRange === '16-17' || ageRange === '18+') {
        matchScore += 15;
        reasons.push(`helpful for ${ageTierGuidance.context}`);
      }
    }

    // Neuroticism / Emotional Stability
    if (strategy.id === 'thought-vs-fact-detangler') {
      if (bigFive.neuroticism >= 50) {
        matchScore += 35;
        reasons.push('calms sensitive cognitive alarm bells before they spiral into catastrophizing');
      }
      if (bigFive.neuroticism >= 65) {
        matchScore += 15;
      }
      if (hasOverthinkingFriction) {
        matchScore += 20;
        reasons.push('matches overthinking reflections logged in your journal');
      }
    }

    if (strategy.id === 'somatic-vagal-reset') {
      if (bigFive.neuroticism >= 45) {
        matchScore += 30;
        reasons.push('instantly relieves physiological stress and nervous tension');
      }
      if (bigFive.neuroticism >= 65) {
        matchScore += 15;
      }
      if (hasExamStress) {
        matchScore += 20;
        reasons.push('calms exam and performance anxiety logged in your journal');
      }
    }

    // Agreeableness & Extraversion
    if (strategy.id === 'respectful-boundary-script') {
      if (bigFive.agreeableness >= 60) {
        matchScore += 35;
        reasons.push('protects your compassionate heart from peer overload without guilt');
      }
      if (hasBoundaryFriction) {
        matchScore += 15;
        reasons.push('addresses boundary friction recorded in your journal');
      }
    }

    if (strategy.id === 'energy-shield-introvert') {
      if (bigFive.extraversion < 50) {
        matchScore += 35;
        reasons.push('protects your introverted energy reserves from social sensory exhaustion');
      }
      if (sixteenType?.definition?.role === 'diplomats') {
        matchScore += 15;
        reasons.push('crucial for empathetic Diplomat types to recharge');
      }
    }

    if (strategy.id === 'three-second-pause') {
      if (bigFive.extraversion >= 55 || bigFive.agreeableness < 50) {
        matchScore += 25;
        reasons.push('delivers conscious impulse control during heated peer or family exchanges');
      }
    }

    // Perfectionism & Confidence
    if (strategy.id === 'seventy-percent-release') {
      if (bigFive.conscientiousness >= 60 || hasPerfectionismFriction) {
        matchScore += 35;
        reasons.push('cures perfectionist paralysis and gets your work into the real world');
      }
    }

    if (strategy.id === 'evidence-jar-victories') {
      if (bigFive.neuroticism >= 45 || (profile?.wellbeingScore && profile.wellbeingScore < 70)) {
        matchScore += 30;
        reasons.push('builds empirical self-trust against imposter syndrome');
      }
    }

    // Custom strategies created by user get high priority
    if (strategy.isCustom) {
      matchScore += 40;
      reasons.push('your personalized custom self-management tool');
    }

    // Repetition bonus: if user has practiced it before, they know it works
    const reps = completedMitigations[strategy.id] || 0;
    if (reps > 0) {
      matchScore += Math.min(reps * 2, 10);
    }

    // Cap score at 99%
    const finalScore = Math.min(Math.max(matchScore, 40), 99);

    let priority: 'primary' | 'recommended' | 'supportive' = 'supportive';
    if (finalScore >= 80) priority = 'primary';
    else if (finalScore >= 65) priority = 'recommended';

    // Tailored learning style tip for this strategy
    let learningTip: string | undefined;
    if (learningStyle === 'visual') {
      learningTip = 'Visual Anchor: Write this tool’s quick mantra on a bright sticky note on your study desk.';
    } else if (learningStyle === 'kinesthetic') {
      learningTip = 'Physical Anchor: Take a physical standing pause or stretch while executing step 1.';
    } else if (learningStyle === 'auditory') {
      learningTip = 'Auditory Anchor: Speak the quick mantra out loud 2 times before beginning.';
    }

    const defaultReason = `Matches your ${sixteenType?.code || 'authentic'} temperament to build steady momentum.`;
    const rationale = reasons.length > 0 
      ? `Tailored because it ${reasons.slice(0, 2).join(' and ')}.`
      : defaultReason;

    return {
      strategy,
      matchScore: finalScore,
      matchReason: rationale,
      priority,
      learningStyleTip: learningTip
    };
  });

  // Sort descending by match score
  scoredStrategies.sort((a, b) => b.matchScore - a.matchScore);

  return {
    userTitle: firstName,
    archetypeTitle,
    archetypeSubtitle,
    coreFrictionPattern,
    learningStyleGuidance,
    ageTierGuidance,
    dailyKeystoneRoutine,
    recommendedStrategies: scoredStrategies
  };
}
