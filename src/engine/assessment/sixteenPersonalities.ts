/**
 * sixteenPersonalities.ts
 * 
 * Empirically-grounded 16 Personality Typology engine for PRERNA.
 * Maps Big Five dimensional trait scores (IPIP Goldberg et al.) to the
 * globally recognized 16 Personality Types (Jungian / Myers-Briggs / NERIS framework)
 * using the validated empirical correspondence established by McCrae & Costa (1989).
 * 
 * Dimensions:
 *  - Energy:    Extraversion (E) vs Introversion (I)
 *  - Mind:      Intuitive (N / High Openness) vs Observant (S / Low Openness)
 *  - Nature:    Feeling (F / High Agreeableness) vs Thinking (T / Low Agreeableness)
 *  - Tactics:   Judging (J / High Conscientiousness) vs Prospecting (P / Low Conscientiousness)
 *  - Identity:  Assertive (-A / Low Neuroticism) vs Turbulent (-T / High Neuroticism)
 */

export type SixteenTypeCode = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type SixteenRole = 'analysts' | 'diplomats' | 'sentinels' | 'explorers';

export interface DichotomyScore {
  dimension: 'energy' | 'mind' | 'nature' | 'tactics' | 'identity';
  label: string;
  traitA: string;
  codeA: string;
  pctA: number;
  traitB: string;
  codeB: string;
  pctB: number;
  dominant: string;
}

export interface SixteenTypeDefinition {
  code: SixteenTypeCode;
  role: SixteenRole;
  roleName: string;
  name: string;
  hindiName: string;
  avatarEmoji: string;
  colorScheme: {
    bgLight: string;
    border: string;
    badgeBg: string;
    text: string;
    gradient: string;
    accentHex: string;
  };
  tagline: string;
  summary: string;
  traits: string[];
  strengths: string[];
  growthAreas: string[];
  studyTips: string[];
  careerDirections: string[];
  parentCommunicationTip: string;
  famousFigures: string[];
}

export interface SixteenTypeResult {
  code: SixteenTypeCode;
  fullCode: string;
  identity: 'Assertive' | 'Turbulent';
  identityCode: '-A' | '-T';
  definition: SixteenTypeDefinition;
  dichotomies: {
    energy: DichotomyScore;
    mind: DichotomyScore;
    nature: DichotomyScore;
    tactics: DichotomyScore;
    identity: DichotomyScore;
  };
}

export const SIXTEEN_ROLES: Record<SixteenRole, { name: string; hindiName: string; color: string; description: string }> = {
  analysts: {
    name: 'Analysts',
    hindiName: 'विश्लेषक',
    color: '#8B5CF6',
    description: 'Imaginative and strategic thinkers driven by rationality, innovation, and intellectual depth.'
  },
  diplomats: {
    name: 'Diplomats',
    hindiName: 'राजनयिक',
    color: '#10B981',
    description: 'Empathetic and idealistic seekers driven by harmony, deep meaning, and human potential.'
  },
  sentinels: {
    name: 'Sentinels',
    hindiName: 'संरक्षक',
    color: '#0284C7',
    description: 'Practical, reliable, and organized pillars driven by order, loyalty, and steady execution.'
  },
  explorers: {
    name: 'Explorers',
    hindiName: 'अन्वेषक',
    color: '#F59E0B',
    description: 'Spontaneous, adaptable, and action-oriented masters of tools, situations, and creative expression.'
  }
};

export const SIXTEEN_TYPE_DEFINITIONS: Record<SixteenTypeCode, SixteenTypeDefinition> = {
  // ── Analysts (NT) ──────────────────────────────────────────────────────────
  INTJ: {
    code: 'INTJ',
    role: 'analysts',
    roleName: 'Analysts',
    name: 'The Architect',
    hindiName: 'रणनीतिकार',
    avatarEmoji: '♟️',
    colorScheme: {
      bgLight: 'bg-violet-50',
      border: 'border-violet-200',
      badgeBg: 'bg-violet-100 text-violet-700',
      text: 'text-violet-700',
      gradient: 'from-violet-600 via-indigo-600 to-purple-700',
      accentHex: '#7C3AED'
    },
    tagline: 'Imaginative and strategic thinkers with a master plan for everything.',
    summary: 'You view the world as a giant chessboard of ideas, systems, and possibilities. You prize intellectual independence, strategic foresight, and relentless improvement.',
    traits: ['Strategic', 'Independent', 'Visionary', 'Analytical'],
    strengths: ['Long-term strategic vision', 'High intellectual confidence', 'Decisive problem-solver', 'Independent work ethic'],
    growthAreas: ['Patience with emotional conversations', 'Avoiding perfectionism in teammates'],
    studyTips: ['Build conceptual mind-maps connecting first principles', 'Study in quiet, distraction-free blocks (Pomodoro 50/10)'],
    careerDirections: ['Artificial Intelligence / Machine Learning', 'Systems Architecture', 'Biomedical Research', 'Strategic Consulting'],
    parentCommunicationTip: 'Explain the reasoning and logic behind rules rather than relying on authority alone.',
    famousFigures: ['Sundar Pichai', 'Ada Lovelace', 'Sir Isaac Newton']
  },
  INTP: {
    code: 'INTP',
    role: 'analysts',
    roleName: 'Analysts',
    name: 'The Logician',
    hindiName: 'तर्कशास्त्री',
    avatarEmoji: '🔬',
    colorScheme: {
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-100 text-indigo-700',
      text: 'text-indigo-700',
      gradient: 'from-indigo-600 via-violet-600 to-blue-700',
      accentHex: '#6366F1'
    },
    tagline: 'Innovative inventors with an unquenchable thirst for knowledge.',
    summary: 'You love deconstructing ideas to see how they tick. For you, life is an endless quest to uncover underlying truths, novel connections, and theoretical breakthroughs.',
    traits: ['Curious', 'Objective', 'Original', 'Philosophical'],
    strengths: ['Deep abstract reasoning', 'Unbiased objectivity', 'Out-of-the-box original thought', 'Insatiable curiosity'],
    growthAreas: ['Turning theories into finished projects', 'Emotional self-expression'],
    studyTips: ['Ask "why does this formula work?" before memorizing', 'Use diagrams, coding scripts, or analogies to test ideas'],
    careerDirections: ['Data Science / Mathematics', 'Quantum Physics / Astronomy', 'Software Engineering', 'Philosophy & Cognitive Science'],
    parentCommunicationTip: 'Provide time and space for unstructured deep thinking without rushing to instant decisions.',
    famousFigures: ['S. Ramanujan', 'Albert Einstein', 'Marie Curie']
  },
  ENTJ: {
    code: 'ENTJ',
    role: 'analysts',
    roleName: 'Analysts',
    name: 'The Commander',
    hindiName: 'सेनापति',
    avatarEmoji: '⚡',
    colorScheme: {
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-100 text-purple-700',
      text: 'text-purple-700',
      gradient: 'from-purple-600 via-fuchsia-600 to-indigo-700',
      accentHex: '#9333EA'
    },
    tagline: 'Bold, imaginative and strong-willed leaders, always finding or making a way.',
    summary: 'Natural-born leaders with charismatic confidence and razor-sharp executive vision. You thrive on turning ambitious challenges into structured, victorious realities.',
    traits: ['Decisive', 'Charismatic', 'Direct', 'Efficient'],
    strengths: ['Natural executive leadership', 'Crisis decisiveness', 'Strategic structuring', 'Inspiring team direction'],
    growthAreas: ['Softening feedback delivery', 'Active listening to emotional nuances'],
    studyTips: ['Set high-stakes weekly sprint goals', 'Teach difficult concepts to peer groups to test mastery'],
    careerDirections: ['Venture Capital & Startups', 'Corporate Leadership / CEO', 'Civil Services (IAS/IPS)', 'Constitutional Law'],
    parentCommunicationTip: 'Treat discussions as a collaborative debate and respect their autonomy and goal-setting.',
    famousFigures: ['Indira Gandhi', 'Steve Jobs', 'Margaret Thatcher']
  },
  ENTP: {
    code: 'ENTP',
    role: 'analysts',
    roleName: 'Analysts',
    name: 'The Debater',
    hindiName: 'विचारक',
    avatarEmoji: '💡',
    colorScheme: {
      bgLight: 'bg-fuchsia-50',
      border: 'border-fuchsia-200',
      badgeBg: 'bg-fuchsia-100 text-fuchsia-700',
      text: 'text-fuchsia-700',
      gradient: 'from-fuchsia-600 via-pink-600 to-violet-700',
      accentHex: '#C026D3'
    },
    tagline: 'Smart and curious thinkers who cannot resist an intellectual challenge.',
    summary: 'Quick-witted, unconventional, and mentally agile. You love playing devil’s advocate, brainstorming disruptive ideas, and testing the limits of conventional wisdom.',
    traits: ['Quick-witted', 'Innovative', 'Adaptable', 'Enthusiastic'],
    strengths: ['Rapid mental connection of ideas', 'Magnetic articulation', 'Fearless creative experimentation', 'High adaptability'],
    growthAreas: ['Finishing routine administrative tasks', 'Avoiding arguing purely for fun'],
    studyTips: ['Turn revision into timed debate games or quizzes', 'Study across alternating subjects to prevent boredom'],
    careerDirections: ['Tech Product Innovation', 'Media & Investigative Journalism', 'Litigation Law', 'Creative Advertising'],
    parentCommunicationTip: 'Debates are an expression of curiosity, not disrespect; channel discussions into productive exploration.',
    famousFigures: ['Swami Vivekananda', 'Richard Feynman', 'Leonardo da Vinci']
  },

  // ── Diplomats (NF) ────────────────────────────────────────────────────────
  INFJ: {
    code: 'INFJ',
    role: 'diplomats',
    roleName: 'Diplomats',
    name: 'The Advocate',
    hindiName: 'मार्गदर्शक',
    avatarEmoji: '🌱',
    colorScheme: {
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
      gradient: 'from-emerald-600 via-teal-600 to-green-700',
      accentHex: '#059669'
    },
    tagline: 'Quiet, inspiring and tireless idealists driven by deep human purpose.',
    summary: 'You possess a rare combination of visionary intuition and grounded compassion. You feel called to make a meaningful difference and understand people on profound levels.',
    traits: ['Insightful', 'Principled', 'Altruistic', 'Deep'],
    strengths: ['Profound emotional empathy', 'Strong moral compass', 'Nuanced human intuition', 'Dedicated focus on values'],
    growthAreas: ['Vulnerability to emotional burnout', 'Holding on to unspoken expectations'],
    studyTips: ['Connect academic subjects to positive human impact', 'Create an aesthetic, quiet study sanctuary'],
    careerDirections: ['Clinical Psychology / Psychotherapy', 'Social Impact Strategy', 'Creative Writing & Authorship', 'Environmental Policy'],
    parentCommunicationTip: 'Check in on their emotional state without demanding immediate answers; give them time to express feelings.',
    famousFigures: ['Mahatma Gandhi', 'Rabindranath Tagore', 'Martin Luther King Jr.']
  },
  INFP: {
    code: 'INFP',
    role: 'diplomats',
    roleName: 'Diplomats',
    name: 'The Mediator',
    hindiName: 'साधक',
    avatarEmoji: '✨',
    colorScheme: {
      bgLight: 'bg-teal-50',
      border: 'border-teal-200',
      badgeBg: 'bg-teal-100 text-teal-700',
      text: 'text-teal-700',
      gradient: 'from-teal-600 via-emerald-600 to-cyan-700',
      accentHex: '#0D9488'
    },
    tagline: 'Poetic, kind and altruistic spirits, always eager to champion a good cause.',
    summary: 'Guided by authenticity, wonder, and empathy. You see beauty in uniqueness and strive to live a life aligned with your deepest personal values and creative expression.',
    traits: ['Empathetic', 'Idealistic', 'Artistic', 'Authentic'],
    strengths: ['Deep authenticity', 'Expressive creative talent', 'Unconditional acceptance of others', 'Passionate inner drive'],
    growthAreas: ['Taking criticism personally', 'Procrastination on routine duties'],
    studyTips: ['Incorporate music, colors, and storytelling into notes', 'Break study goals into gentle, self-compassionate steps'],
    careerDirections: ['Graphic Design & Animation', 'Counseling & Mental Health', 'Literature & Creative Arts', 'Non-Profit Leadership'],
    parentCommunicationTip: 'Acknowledge their sensitivity and dreams before discussing practical requirements.',
    famousFigures: ['A.R. Rahman', 'Gulzar', 'J.R.R. Tolkien']
  },
  ENFJ: {
    code: 'ENFJ',
    role: 'diplomats',
    roleName: 'Diplomats',
    name: 'The Protagonist',
    hindiName: 'नायक',
    avatarEmoji: '🔥',
    colorScheme: {
      bgLight: 'bg-green-50',
      border: 'border-green-200',
      badgeBg: 'bg-green-100 text-green-700',
      text: 'text-green-700',
      gradient: 'from-green-600 via-emerald-600 to-teal-700',
      accentHex: '#16A34A'
    },
    tagline: 'Charismatic and inspiring leaders, able to mesmerize and uplift everyone.',
    summary: 'Warm, passionate, and deeply attuned to others. You naturally guide, motivate, and mentor groups toward shared purpose, bringing out the best in everyone.',
    traits: ['Charismatic', 'Altruistic', 'Inspiring', 'Cooperative'],
    strengths: ['Natural mentoring ability', 'Uniting diverse groups', 'High emotional sensitivity', 'Compelling communication'],
    growthAreas: ['Overextending to help others', 'Neglecting personal self-care'],
    studyTips: ['Form collaborative study circles', 'Summarize key takeaways out loud as if teaching a friend'],
    careerDirections: ['Education & Pedagogy', 'Human Resources & Talent Development', 'Public Health / Community Medicine', 'Diplomacy'],
    parentCommunicationTip: 'Remind them that it is okay to rest and say "no" to peer demands.',
    famousFigures: ['Barack Obama', 'Oprah Winfrey', 'Nelson Mandela']
  },
  ENFP: {
    code: 'ENFP',
    role: 'diplomats',
    roleName: 'Diplomats',
    name: 'The Campaigner',
    hindiName: 'प्रेरक',
    avatarEmoji: '🎈',
    colorScheme: {
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
      gradient: 'from-emerald-500 via-teal-500 to-sky-600',
      accentHex: '#10B981'
    },
    tagline: 'Enthusiastic, creative and sociable free spirits, always finding magic in life.',
    summary: 'A vibrant burst of creativity, warmth, and curious energy. You see life as full of fascinating people, possibilities, and adventures waiting to unfold.',
    traits: ['Enthusiastic', 'Imaginative', 'Spontaneous', 'Friendly'],
    strengths: ['Infectious enthusiasm', 'Connecting with people effortlessly', 'Boundless creative ideation', 'Broad interests'],
    growthAreas: ['Staying focused on one track', 'Completing mundane paperwork'],
    studyTips: ['Gamify study sessions with timers and milestones', 'Change study environments (balcony, desk, library) to stay fresh'],
    careerDirections: ['Brand Strategy & Marketing', 'Event & Experience Design', 'Podcasting & Content Creation', 'Psychology / Human Dynamics'],
    parentCommunicationTip: 'Support their diverse passions while helping them build gentle structures for follow-through.',
    famousFigures: ['Robin Williams', 'Shah Rukh Khan', 'Walt Disney']
  },

  // ── Sentinels (SJ) ────────────────────────────────────────────────────────
  ISTJ: {
    code: 'ISTJ',
    role: 'sentinels',
    roleName: 'Sentinels',
    name: 'The Logistician',
    hindiName: 'नीतिवान',
    avatarEmoji: '📋',
    colorScheme: {
      bgLight: 'bg-sky-50',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-100 text-sky-700',
      text: 'text-sky-700',
      gradient: 'from-sky-600 via-blue-600 to-indigo-700',
      accentHex: '#0284C7'
    },
    tagline: 'Practical and fact-minded, whose reliability cannot be doubted.',
    summary: 'The rock of dependability. You value integrity, clear procedures, and methodical precision. When you commit to a task, you see it through with absolute fidelity.',
    traits: ['Reliable', 'Methodical', 'Honest', 'Organized'],
    strengths: ['Unwavering duty and reliability', 'Methodical step-by-step organization', 'High attention to accuracy', 'Honesty & integrity'],
    growthAreas: ['Adapting to sudden changes of plans', 'Expressing unspoken appreciation'],
    studyTips: ['Follow structured timetables with daily checklists', 'Use flashcards and past papers for systematic practice'],
    careerDirections: ['Chartered Accountancy (CA)', 'Civil & Structural Engineering', 'Judiciary & Law Enforcement', 'Operations Management'],
    parentCommunicationTip: 'Provide clear expectations, respect their schedule, and acknowledge their steady contributions.',
    famousFigures: ['Warren Buffett', 'Angela Merkel', 'George Washington']
  },
  ISFJ: {
    code: 'ISFJ',
    role: 'sentinels',
    roleName: 'Sentinels',
    name: 'The Defender',
    hindiName: 'रक्षक',
    avatarEmoji: '🛡️',
    colorScheme: {
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-700',
      text: 'text-blue-700',
      gradient: 'from-blue-600 via-sky-600 to-cyan-700',
      accentHex: '#2563EB'
    },
    tagline: 'Dedicated and warm protectors, always ready to support loved ones.',
    summary: 'Quietly extraordinary in your devotion to community and family. You combine meticulous practical memory with genuine tenderness and loyalty.',
    traits: ['Supportive', 'Observant', 'Loyal', 'Conscientious'],
    strengths: ['Deep personal loyalty', 'Meticulous practical memory', 'Warm, supportive presence', 'Patient work ethic'],
    growthAreas: ['Hesitating to express personal needs', 'Difficulty accepting sudden changes'],
    studyTips: ['Review class notes daily while fresh', 'Create organized color-coded summary sheets'],
    careerDirections: ['Nursing & Specialized Medicine', 'Early Childhood Education', 'Library Science & Archiving', 'Customer Success Management'],
    parentCommunicationTip: 'Proactively offer reassurance and appreciate their thoughtful consideration of the family.',
    famousFigures: ['Mother Teresa', 'Rosa Parks', 'Sudha Murty']
  },
  ESTJ: {
    code: 'ESTJ',
    role: 'sentinels',
    roleName: 'Sentinels',
    name: 'The Executive',
    hindiName: 'व्यवस्थापक',
    avatarEmoji: '🏛️',
    colorScheme: {
      bgLight: 'bg-cyan-50',
      border: 'border-cyan-200',
      badgeBg: 'bg-cyan-100 text-cyan-700',
      text: 'text-cyan-700',
      gradient: 'from-cyan-600 via-sky-600 to-blue-700',
      accentHex: '#0891B2'
    },
    tagline: 'Excellent administrators, unsurpassed at managing projects and people.',
    summary: 'Clear-thinking, orderly, and dedicated to community standards. You excel at taking chaotic situations and turning them into efficient, productive systems.',
    traits: ['Organized', 'Direct', 'Loyal', 'Decisive'],
    strengths: ['Mastery of organization and logistics', 'Direct, honest communication', 'Strong civic responsibility', 'High execution capacity'],
    growthAreas: ['Patience with unconventional viewpoints', 'Recognizing individual emotional limits'],
    studyTips: ['Set up a disciplined daily study routine', 'Use project-management techniques (Kanban boards) for exam tracks'],
    careerDirections: ['Defense & Military Services', 'Corporate Project Management', 'Government Administration', 'Financial Auditing'],
    parentCommunicationTip: 'Be straightforward, set transparent benchmarks, and recognize their leadership.',
    famousFigures: ['Sardar Vallabhbhai Patel', 'John D. Rockefeller', 'Judge Judy']
  },
  ESFJ: {
    code: 'ESFJ',
    role: 'sentinels',
    roleName: 'Sentinels',
    name: 'The Consul',
    hindiName: 'संरक्षक',
    avatarEmoji: '🤝',
    colorScheme: {
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-700',
      text: 'text-blue-700',
      gradient: 'from-blue-500 via-teal-500 to-emerald-600',
      accentHex: '#0284C7'
    },
    tagline: 'Extraordinarily caring, social and popular people, eager to be of service.',
    summary: 'The social glue that connects people and builds warm traditions. You are attentive to others’ feelings, generous with encouragement, and deeply responsible.',
    traits: ['Warm', 'Responsible', 'Loyal', 'Harmonious'],
    strengths: ['Fostering community belonging', 'Exceptional interpersonal warmth', 'Practical reliability', 'Sensitivity to social needs'],
    growthAreas: ['Worrying too much about what others think', 'Conflict avoidance'],
    studyTips: ['Study in small, encouraging peer groups', 'Teach and quiz each other on key concepts'],
    careerDirections: ['Hospital Administration', 'Public Relations & Corporate Affairs', 'School Counseling', 'Event Management'],
    parentCommunicationTip: 'Celebrate their friendships and provide loving affirmations of their worth beyond grades.',
    famousFigures: ['Taylor Swift', 'Jennifer Garner', 'Bill Clinton']
  },

  // ── Explorers (SP) ────────────────────────────────────────────────────────
  ISTP: {
    code: 'ISTP',
    role: 'explorers',
    roleName: 'Explorers',
    name: 'The Virtuoso',
    hindiName: 'शिल्पकार',
    avatarEmoji: '🛠️',
    colorScheme: {
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
      gradient: 'from-amber-600 via-orange-600 to-yellow-600',
      accentHex: '#D97706'
    },
    tagline: 'Bold and practical experimenters, masters of all kinds of tools.',
    summary: 'Calm under pressure, intensely curious, and hands-on. You explore ideas by physically building, debugging, and tinkering with the world around you.',
    traits: ['Hands-on', 'Practical', 'Calm', 'Resourceful'],
    strengths: ['Hands-on problem solving', 'Cool composure in emergencies', 'Resourceful adaptability', 'Direct mechanistic insight'],
    growthAreas: ['Long-term commitment to repetitive routines', 'Sharing feelings before frustrations build'],
    studyTips: ['Learn through labs, physical models, coding, and real-world experiments', 'Take short physical breaks between study sprints'],
    careerDirections: ['Robotics & Mechatronics', 'Aviation / Pilot', 'Cybersecurity & Ethical Hacking', 'Automotive Engineering'],
    parentCommunicationTip: 'Give them physical space to tinker and solve problems on their own terms.',
    famousFigures: ['M.S. Dhoni', 'Clint Eastwood', 'Bruce Lee']
  },
  ISFP: {
    code: 'ISFP',
    role: 'explorers',
    roleName: 'Explorers',
    name: 'The Adventurer',
    hindiName: 'अन्वेषक',
    avatarEmoji: '🎨',
    colorScheme: {
      bgLight: 'bg-orange-50',
      border: 'border-orange-200',
      badgeBg: 'bg-orange-100 text-orange-700',
      text: 'text-orange-700',
      gradient: 'from-orange-500 via-amber-500 to-rose-600',
      accentHex: '#EA580C'
    },
    tagline: 'Flexible and charming artists, always ready to explore new experiences.',
    summary: 'Gentle, aesthetically sensitive, and open-minded. You live in the present, finding harmony and beauty through music, art, sports, or quiet human connections.',
    traits: ['Artistic', 'Sensitive', 'Open-minded', 'Gentle'],
    strengths: ['Refined aesthetic taste', 'Non-judgmental acceptance of others', 'Passionate dedication to crafts', 'Living mindfully in the present'],
    growthAreas: ['Planning for distant future horizons', 'Handling rigid, competitive environments'],
    studyTips: ['Incorporate sketching, visually pleasing notebooks, and mind maps', 'Study in serene, naturally lit environments'],
    careerDirections: ['Fashion & Textile Design', 'Cinematography & Visual Arts', 'Wildlife Conservation / Veterinary', 'Culinary Arts'],
    parentCommunicationTip: 'Encourage their artistic or physical pursuits alongside academics without comparative judgment.',
    famousFigures: ['Frida Kahlo', 'Michael Jackson', 'Bob Dylan']
  },
  ESTP: {
    code: 'ESTP',
    role: 'explorers',
    roleName: 'Explorers',
    name: 'The Entrepreneur',
    hindiName: 'उद्यमी',
    avatarEmoji: '🚀',
    colorScheme: {
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-200',
      badgeBg: 'bg-yellow-100 text-yellow-700',
      text: 'text-yellow-700',
      gradient: 'from-yellow-500 via-amber-500 to-orange-600',
      accentHex: '#CA8A04'
    },
    tagline: 'Smart, energetic and perceptive people who truly enjoy living in the moment.',
    summary: 'Action-packed, observant, and quick to respond. You thrive in fast-paced environments, seize immediate opportunities, and learn best by diving in headfirst.',
    traits: ['Energetic', 'Perceptive', 'Direct', 'Risk-tolerant'],
    strengths: ['Real-time crisis management', 'Exceptional observation of social cues', 'Persuasive charisma', 'Bold initiative'],
    growthAreas: ['Patience with slow, abstract classroom lectures', 'Impulse control in high-risk settings'],
    studyTips: ['Study in active, short bursts with clear, tactile goals', 'Connect theory to real-world businesses or current events'],
    careerDirections: ['Venture Entrepreneurship', 'Sports & Athletic Management', 'Emergency Medicine / Paramedics', 'Real Estate & Investment'],
    parentCommunicationTip: 'Channel their natural adrenaline into constructive sports, leadership, or business projects.',
    famousFigures: ['Virat Kohli', 'Dhirubhai Ambani', 'Winston Churchill']
  },
  ESFP: {
    code: 'ESFP',
    role: 'explorers',
    roleName: 'Explorers',
    name: 'The Entertainer',
    hindiName: 'कलाकार',
    avatarEmoji: '🎭',
    colorScheme: {
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
      gradient: 'from-amber-500 via-rose-500 to-pink-600',
      accentHex: '#D97706'
    },
    tagline: 'Spontaneous, energetic and enthusiastic people — life is never boring around them.',
    summary: 'Warm, fun-loving, and intensely generous. You bring infectious laughter and energy wherever you go, turning every day into an experience to celebrate.',
    traits: ['Enthusiastic', 'Spontaneous', 'Warm', 'Playful'],
    strengths: ['Uplifting and cheering others', 'Vibrant stage presence & storytelling', 'Generous social instincts', 'High practical engagement'],
    growthAreas: ['Maintaining focus on long-term deadlines', 'Avoiding uncomfortable conversations'],
    studyTips: ['Use active role-play or audio recordings to remember material', 'Study with upbeat background focus rhythms'],
    careerDirections: ['Performing Arts & Theater', 'Hospitality & Tourism Management', 'Sports Journalism', 'Public Engagement & Media'],
    parentCommunicationTip: 'Celebrate their natural warmth and social gifts while helping them establish steady homework routines.',
    famousFigures: ['Ranveer Singh', 'Marilyn Monroe', 'Adele']
  }
};

/**
 * Derives the complete 16 Personality Type profile from Big Five trait scores.
 * 
 * Uses validated empirical thresholds:
 *  - E vs I: Big Five Extraversion (>= 50 is Extraverted)
 *  - N vs S: Big Five Openness (>= 50 is Intuitive)
 *  - F vs T: Big Five Agreeableness (>= 50 is Feeling)
 *  - J vs P: Big Five Conscientiousness (>= 50 is Judging)
 *  - -A vs -T: Big Five Neuroticism (<= 50 is Assertive, > 50 is Turbulent)
 */
export function deriveSixteenType(bigFive: {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}): SixteenTypeResult {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

  // 1. Energy: Extraversion (E) vs Introversion (I)
  const isE = extraversion >= 50;
  const energyCode = isE ? 'E' : 'I';
  const energyScore: DichotomyScore = {
    dimension: 'energy',
    label: 'Energy',
    traitA: 'Introverted',
    codeA: 'I',
    pctA: Math.round(100 - extraversion),
    traitB: 'Extraverted',
    codeB: 'E',
    pctB: Math.round(extraversion),
    dominant: energyCode
  };

  // 2. Mind: Intuitive (N) vs Observant (S)
  const isN = openness >= 50;
  const mindCode = isN ? 'N' : 'S';
  const mindScore: DichotomyScore = {
    dimension: 'mind',
    label: 'Mind',
    traitA: 'Intuitive',
    codeA: 'N',
    pctA: Math.round(openness),
    traitB: 'Observant',
    codeB: 'S',
    pctB: Math.round(100 - openness),
    dominant: mindCode
  };

  // 3. Nature: Feeling (F) vs Thinking (T)
  const isF = agreeableness >= 50;
  const natureCode = isF ? 'F' : 'T';
  const natureScore: DichotomyScore = {
    dimension: 'nature',
    label: 'Nature',
    traitA: 'Thinking',
    codeA: 'T',
    pctA: Math.round(100 - agreeableness),
    traitB: 'Feeling',
    codeB: 'F',
    pctB: Math.round(agreeableness),
    dominant: natureCode
  };

  // 4. Tactics: Judging (J) vs Prospecting (P)
  const isJ = conscientiousness >= 50;
  const tacticsCode = isJ ? 'J' : 'P';
  const tacticsScore: DichotomyScore = {
    dimension: 'tactics',
    label: 'Tactics',
    traitA: 'Judging',
    codeA: 'J',
    pctA: Math.round(conscientiousness),
    traitB: 'Prospecting',
    codeB: 'P',
    pctB: Math.round(100 - conscientiousness),
    dominant: tacticsCode
  };

  // 5. Identity: Assertive (-A) vs Turbulent (-T)
  const isA = neuroticism <= 50;
  const identityCode = isA ? '-A' : '-T';
  const identity = isA ? 'Assertive' : 'Turbulent';
  const identityScore: DichotomyScore = {
    dimension: 'identity',
    label: 'Identity',
    traitA: 'Assertive',
    codeA: '-A',
    pctA: Math.round(100 - neuroticism),
    traitB: 'Turbulent',
    codeB: '-T',
    pctB: Math.round(neuroticism),
    dominant: identityCode
  };

  const code = `${energyCode}${mindCode}${natureCode}${tacticsCode}` as SixteenTypeCode;
  const fullCode = `${code}${identityCode}`;
  const definition = SIXTEEN_TYPE_DEFINITIONS[code] || SIXTEEN_TYPE_DEFINITIONS.INFJ;

  return {
    code,
    fullCode,
    identity,
    identityCode,
    definition,
    dichotomies: {
      energy: energyScore,
      mind: mindScore,
      nature: natureScore,
      tactics: tacticsScore,
      identity: identityScore,
    }
  };
}
