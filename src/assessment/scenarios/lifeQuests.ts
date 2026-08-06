/**
 * Life Quest Scenarios
 * Narrative scenarios that stealthily assess Big Five, RIASEC, and Emotional traits
 */

import { Scene } from '../engine';

export const lifeQuestScenarios: Scene[] = [
  // SCENARIO 1: The Group Project Crisis
  {
    id: 'group_project_crisis',
    title: 'The Deadline',
    description: 'Your team project is due tomorrow. One member has done nothing. What do you do?',
    context: 'academic',
    choices: [
      {
        id: 'take_charge',
        text: 'Take charge and redistribute their work among the team',
        traitMappings: [
          { trait: 'extraversion', dimension: 'big_five', weight: 0.8, confidence: 0.9 },
          { trait: 'enterprising', dimension: 'riasec', weight: 0.7, confidence: 0.8 },
          { trait: 'leadership', dimension: 'emotional', weight: 0.9, confidence: 0.9 },
        ],
        narrativeConsequence: 'You step up. The team looks relieved.',
      },
      {
        id: 'confront_directly',
        text: 'Confront the person privately and ask what happened',
        traitMappings: [
          { trait: 'agreeableness', dimension: 'big_five', weight: 0.6, confidence: 0.8 },
          { trait: 'empathy', dimension: 'emotional', weight: 0.9, confidence: 0.9 },
          { trait: 'social', dimension: 'riasec', weight: 0.5, confidence: 0.7 },
        ],
        narrativeConsequence: 'They open up about family issues. You find a solution together.',
      },
      {
        id: 'do_it_yourself',
        text: 'Just do their part yourself to ensure quality',
        traitMappings: [
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.9, confidence: 0.9 },
          { trait: 'conventional', dimension: 'riasec', weight: 0.6, confidence: 0.7 },
          { trait: 'resilience', dimension: 'emotional', weight: 0.7, confidence: 0.8 },
        ],
        narrativeConsequence: 'You work late. It\'s done, but you\'re exhausted.',
      },
      {
        id: 'tell_teacher',
        text: 'Report the situation to the teacher immediately',
        traitMappings: [
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.5, confidence: 0.7 },
          { trait: 'conventional', dimension: 'riasec', weight: 0.8, confidence: 0.8 },
          { trait: 'impulse_control', dimension: 'emotional', weight: 0.4, confidence: 0.6 },
        ],
        narrativeConsequence: 'The teacher appreciates your honesty but suggests team discussion first.',
      },
    ],
  },

  // SCENARIO 2: The Unexpected Opportunity
  {
    id: 'unexpected_opportunity',
    title: 'The Open Door',
    description: 'A famous artist is visiting your city. You could skip class to meet them. What do you do?',
    context: 'creative',
    choices: [
      {
        id: 'go_immediately',
        text: 'Go immediately - opportunities like this don\'t wait',
        traitMappings: [
          { trait: 'openness', dimension: 'big_five', weight: 0.9, confidence: 0.9 },
          { trait: 'artistic', dimension: 'riasec', weight: 0.9, confidence: 0.9 },
          { trait: 'impulse_control', dimension: 'emotional', weight: -0.6, confidence: 0.7 },
        ],
        narrativeConsequence: 'You meet your idol. It changes your perspective forever.',
      },
      {
        id: 'plan_both',
        text: 'Try to arrange to do both - ask teacher for permission first',
        traitMappings: [
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.8, confidence: 0.9 },
          { trait: 'enterprising', dimension: 'riasec', weight: 0.7, confidence: 0.8 },
          { trait: 'impulse_control', dimension: 'emotional', weight: 0.8, confidence: 0.9 },
        ],
        narrativeConsequence: 'Your teacher respects your initiative. You get permission.',
      },
      {
        id: 'stay_in_class',
        text: 'Stay in class - education comes first',
        traitMappings: [
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.9, confidence: 0.9 },
          { trait: 'conventional', dimension: 'riasec', weight: 0.7, confidence: 0.8 },
          { trait: 'openness', dimension: 'big_five', weight: -0.4, confidence: 0.6 },
        ],
        narrativeConsequence: 'You focus on your studies, but wonder what you missed.',
      },
      {
        id: 'livestream',
        text: 'Ask a friend to livestream it while you take notes in class',
        traitMappings: [
          { trait: 'investigative', dimension: 'riasec', weight: 0.8, confidence: 0.8 },
          { trait: 'openness', dimension: 'big_five', weight: 0.6, confidence: 0.7 },
          { trait: 'social_intuition', dimension: 'emotional', weight: 0.7, confidence: 0.8 },
        ],
        narrativeConsequence: 'You multitask. The video quality is terrible, but you tried.',
      },
    ],
  },

  // SCENARIO 3: The Social Dilemma
  {
    id: 'social_dilemma',
    title: 'The Whisper',
    description: 'You overhear friends planning a surprise party for someone who hates surprises. What do you do?',
    context: 'social',
    choices: [
      {
        id: 'warn_secretly',
        text: 'Quietly tell the birthday person so they can prepare',
        traitMappings: [
          { trait: 'empathy', dimension: 'emotional', weight: 0.9, confidence: 0.9 },
          { trait: 'agreeableness', dimension: 'big_five', weight: 0.8, confidence: 0.8 },
          { trait: 'social', dimension: 'riasec', weight: 0.6, confidence: 0.7 },
        ],
        narrativeConsequence: 'They\'re grateful. The party becomes a "fake surprise" everyone enjoys.',
      },
      {
        id: 'suggest_alternative',
        text: 'Suggest to the planners that they do something else instead',
        traitMappings: [
          { trait: 'social_intuition', dimension: 'emotional', weight: 0.9, confidence: 0.9 },
          { trait: 'enterprising', dimension: 'riasec', weight: 0.7, confidence: 0.8 },
          { trait: 'extraversion', dimension: 'big_five', weight: 0.6, confidence: 0.7 },
        ],
        narrativeConsequence: 'You suggest a game night. Everyone thinks it was their idea.',
      },
      {
        id: 'stay_silent',
        text: 'Stay silent - not your party, not your problem',
        traitMappings: [
          { trait: 'agreeableness', dimension: 'big_five', weight: -0.5, confidence: 0.6 },
          { trait: 'impulse_control', dimension: 'emotional', weight: 0.5, confidence: 0.7 },
          { trait: 'social', dimension: 'riasec', weight: -0.3, confidence: 0.5 },
        ],
        narrativeConsequence: 'The party happens. It\'s awkward. You feel guilty.',
      },
      {
        id: 'research',
        text: 'Research "best surprise reactions" to help them plan better',
        traitMappings: [
          { trait: 'investigative', dimension: 'riasec', weight: 0.9, confidence: 0.9 },
          { trait: 'openness', dimension: 'big_five', weight: 0.6, confidence: 0.7 },
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.7, confidence: 0.8 },
        ],
        narrativeConsequence: 'Your research helps. The party is a hit despite the initial risk.',
      },
    ],
  },

  // SCENARIO 4: The Creative Block
  {
    id: 'creative_block',
    title: 'The Blank Page',
    description: 'You have a creative assignment but no ideas. Deadline is approaching. What\'s your move?',
    context: 'creative',
    choices: [
      {
        id: 'start_anywhere',
        text: 'Just start writing/drawing anything - momentum creates inspiration',
        traitMappings: [
          { trait: 'openness', dimension: 'big_five', weight: 0.8, confidence: 0.8 },
          { trait: 'artistic', dimension: 'riasec', weight: 0.7, confidence: 0.8 },
          { trait: 'resilience', dimension: 'emotional', weight: 0.8, confidence: 0.8 },
        ],
        narrativeConsequence: 'Rough start, but you find your flow. The final piece is raw but authentic.',
      },
      {
        id: 'research_first',
        text: 'Research extensively before starting - understand the context',
        traitMappings: [
          { trait: 'investigative', dimension: 'riasec', weight: 0.9, confidence: 0.9 },
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.8, confidence: 0.8 },
          { trait: 'openness', dimension: 'big_five', weight: 0.6, confidence: 0.7 },
        ],
        narrativeConsequence: 'Your work is well-informed. Some call it derivative, others call it scholarly.',
      },
      {
        id: 'collaborate',
        text: 'Bounce ideas off friends - creativity is social',
        traitMappings: [
          { trait: 'extraversion', dimension: 'big_five', weight: 0.8, confidence: 0.8 },
          { trait: 'social', dimension: 'riasec', weight: 0.9, confidence: 0.9 },
          { trait: 'openness', dimension: 'big_five', weight: 0.7, confidence: 0.7 },
        ],
        narrativeConsequence: 'The group brainstorm is electric. You combine ideas into something new.',
      },
      {
        id: 'wait_inspiration',
        text: 'Wait for inspiration to strike - forcing it never works',
        traitMappings: [
          { trait: 'openness', dimension: 'big_five', weight: 0.5, confidence: 0.6 },
          { trait: 'conscientiousness', dimension: 'big_five', weight: -0.7, confidence: 0.7 },
          { trait: 'neuroticism', dimension: 'big_five', weight: 0.4, confidence: 0.6 },
        ],
        narrativeConsequence: 'Inspiration comes at 3 AM. You finish, but you\'re exhausted.',
      },
    ],
  },

  // SCENARIO 5: The Ethical Choice
  {
    id: 'ethical_choice',
    title: 'The Shortcut',
    description: 'You find last year\'s exam answers. Using them would guarantee an A. What do you do?',
    context: 'crisis',
    choices: [
      {
        id: 'report_it',
        text: 'Report it to the teacher immediately',
        traitMappings: [
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.9, confidence: 0.9 },
          { trait: 'conventional', dimension: 'riasec', weight: 0.8, confidence: 0.8 },
          { trait: 'impulse_control', dimension: 'emotional', weight: 0.9, confidence: 0.9 },
        ],
        narrativeConsequence: 'The teacher investigates. You sleep well that night.',
      },
      {
        id: 'ignore_it',
        text: 'Ignore it and focus on your own preparation',
        traitMappings: [
          { trait: 'conscientiousness', dimension: 'big_five', weight: 0.7, confidence: 0.8 },
          { trait: 'resilience', dimension: 'emotional', weight: 0.8, confidence: 0.8 },
          { trait: 'agreeableness', dimension: 'big_five', weight: 0.4, confidence: 0.6 },
        ],
        narrativeConsequence: 'You study hard. Your grade reflects your actual knowledge.',
      },
      {
        id: 'share_selectively',
        text: 'Tell only your closest friends who are struggling',
        traitMappings: [
          { trait: 'agreeableness', dimension: 'big_five', weight: 0.7, confidence: 0.7 },
          { trait: 'social', dimension: 'riasec', weight: 0.6, confidence: 0.7 },
          { trait: 'conscientiousness', dimension: 'big_five', weight: -0.5, confidence: 0.6 },
        ],
        narrativeConsequence: 'Your friends are grateful. The guilt lingers.',
      },
      {
        id: 'use_for_prep',
        text: 'Use them only to understand the format, not the answers',
        traitMappings: [
          { trait: 'investigative', dimension: 'riasec', weight: 0.8, confidence: 0.8 },
          { trait: 'openness', dimension: 'big_five', weight: 0.6, confidence: 0.7 },
          { trait: 'impulse_control', dimension: 'emotional', weight: 0.5, confidence: 0.6 },
        ],
        narrativeConsequence: 'You rationalize. You learn the format but wonder if you cheated.',
      },
    ],
  },
];

// Generate a quest with 5 random scenarios
export function generateLifeQuest(): Scene[] {
  const shuffled = [...lifeQuestScenarios].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
