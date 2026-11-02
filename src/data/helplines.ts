/**
 * Central Verified Emergency & Psychosocial Helplines Directory
 * India National Helplines for Adolescents, Families & Crisis Situations
 * 
 * Complies with M-08 Audit Finding:
 * - Single source of truth for all crisis and emergency contact numbers
 * - Explicit government / institutional source URLs
 * - Explicit last-verified dates and operational status
 */

export interface HelplineResource {
  id: string;
  name: string;
  numbers: string[];
  hours: string;
  organization: string;
  language: string;
  badge?: string;
  sourceUrl: string;
  lastVerified: string; // ISO Date YYYY-MM-DD
  status: 'active' | 'integrated_with_tele_manas';
  description?: string;
}

export const VERIFIED_HELPLINES: HelplineResource[] = [
  {
    id: 'national-emergency-112',
    name: 'National Emergency Helpline (Pan-India)',
    numbers: ['112'],
    hours: '24/7 (Immediate Emergency)',
    organization: 'Ministry of Home Affairs (Govt. of India)',
    language: 'All Indian Languages',
    badge: 'Immediate Response',
    sourceUrl: 'https://112.gov.in',
    lastVerified: '2026-11-01',
    status: 'active',
    description: 'Unified emergency response support system for police, medical, fire, and immediate distress.',
  },
  {
    id: 'tele-manas-14416',
    name: 'Tele-MANAS (Govt. of India)',
    numbers: ['14416', '1800-891-4416'],
    hours: '24/7 (Toll-Free)',
    organization: 'Ministry of Health & Family Welfare',
    language: '20+ Indian Languages',
    badge: 'National Mental Health',
    sourceUrl: 'https://telemanas.mohfw.gov.in',
    lastVerified: '2026-11-01',
    status: 'active',
    description: 'National Tele Mental Health Programme of India providing round-the-clock free psychosocial counseling.',
  },
  {
    id: 'childline-1098',
    name: 'Childline India',
    numbers: ['1098'],
    hours: '24/7 (Toll-Free)',
    organization: 'Ministry of Women & Child Development',
    language: 'Pan-India',
    badge: 'Children & Adolescents',
    sourceUrl: 'https://wcd.nic.in',
    lastVerified: '2026-11-01',
    status: 'active',
    description: 'Dedicated 24/7 emergency outreach service for children and adolescents in need of care and protection.',
  },
  {
    id: 'kiran-1800-599-0019',
    name: 'KIRAN Mental Health Helpline',
    numbers: ['1800-599-0019'],
    hours: '24/7 (Toll-Free)',
    organization: 'Department of Empowerment of Persons with Disabilities',
    language: '13 Languages',
    sourceUrl: 'https://disabilityaffairs.gov.in',
    lastVerified: '2026-11-01',
    status: 'integrated_with_tele_manas',
    description: 'DEPwD mental health rehabilitation helpline (co-ordinated and interoperable with Tele-MANAS).',
  },
  {
    id: 'vandrevala-foundation',
    name: 'Vandrevala Foundation',
    numbers: ['9999 666 555'],
    hours: '24/7 (Free Counseling)',
    organization: 'Cyrus & Priya Vandrevala Foundation',
    language: 'English, Hindi, Regional',
    sourceUrl: 'https://www.vandrevalafoundation.com',
    lastVerified: '2026-11-01',
    status: 'active',
    description: 'Free, confidential mental health and suicide prevention counseling across India.',
  },
  {
    id: 'icall-tiss',
    name: 'iCall Psychosocial Helpline',
    numbers: ['9152987821'],
    hours: 'Mon - Sat (10:00 AM – 8:00 PM)',
    organization: 'Tata Institute of Social Sciences (TISS)',
    language: 'English, Hindi, Marathi, etc.',
    sourceUrl: 'https://icallhelpline.org',
    lastVerified: '2026-11-01',
    status: 'active',
    description: 'Free, professional counseling service run by trained mental health professionals at TISS Mumbai.',
  },
  {
    id: 'nimhans-support',
    name: 'NIMHANS Psychosocial Support',
    numbers: ['080-46110007'],
    hours: '24/7',
    organization: 'National Institute of Mental Health and Neurosciences',
    language: 'English, Hindi, Kannada',
    sourceUrl: 'https://nimhans.ac.in',
    lastVerified: '2026-11-01',
    status: 'active',
    description: 'Apex center for mental health and neuroscience in India providing emergency psychosocial assistance.',
  },
];
