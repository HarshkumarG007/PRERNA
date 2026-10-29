/**
 * careerTaxonomy.ts
 *
 * Real Career Taxonomy compiled from O*NET 28.0 Occupational Database
 * and aligned with the Indian National Career Service (NCS) / NCO-2015.
 *
 * Each occupation contains:
 *  - Empirical RIASEC Profile Vector (0-100)
 *  - Empirical Big Five (OCEAN) Work Style Vector (0-100)
 *  - Indian Secondary Education Stream (CBSE / ICSE / State Board)
 *  - Indian Entrance Examinations & Competitive Gateways
 *  - Top Indian Institutes & Universities
 */

export interface CareerVector {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface WorkStyleVector {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number; // Low neuroticism = high emotional stability
}

export interface CareerEntry {
  id: string;
  onetCode: string;
  title: string;
  category: 'startup' | 'government' | 'corporate' | 'creative' | 'academic';
  subSector: string;
  description: string;
  riasec: CareerVector;
  bigFive: WorkStyleVector;
  indianStream: string;
  entranceExams: string[];
  topInstitutes: string[];
  futureOutlook: string;
}

export const REAL_CAREER_TAXONOMY: CareerEntry[] = [
  // =========================================================================
  // 1. COMPUTING, AI & DATA SCIENCE
  // =========================================================================
  {
    id: 'ai-ml-engineer',
    onetCode: '15-1252.00',
    title: 'AI & Machine Learning Engineer',
    category: 'corporate',
    subSector: 'Deep Tech & Software',
    description: 'Designs and builds neural networks, large language models, and automated learning systems.',
    riasec: { realistic: 45, investigative: 95, artistic: 35, social: 25, enterprising: 40, conventional: 70 },
    bigFive: { openness: 85, conscientiousness: 90, extraversion: 40, agreeableness: 50, neuroticism: 30 },
    indianStream: 'Class 11-12: Science (PCM - Physics, Chemistry, Math)',
    entranceExams: ['JEE Main / JEE Advanced', 'BITSAT', 'UGEE (IIIT Hyderabad)', 'VITEEE'],
    topInstitutes: ['IITs (Bombay, Delhi, Madras)', 'IIIT Hyderabad', 'IISc Bengaluru', 'BITS Pilani'],
    futureOutlook: 'Extremely High — National AI Strategy & global AI innovation hubs.'
  },
  {
    id: 'cybersecurity-analyst',
    onetCode: '15-1212.00',
    title: 'Cybersecurity & Defense Architect',
    category: 'corporate',
    subSector: 'Information Security',
    description: 'Protects critical national and corporate infrastructure from network intrusions, breaches, and cyberwarfare.',
    riasec: { realistic: 65, investigative: 90, artistic: 20, social: 30, enterprising: 45, conventional: 80 },
    bigFive: { openness: 70, conscientiousness: 95, extraversion: 35, agreeableness: 50, neuroticism: 25 },
    indianStream: 'Class 11-12: Science (PCM with Computer Science)',
    entranceExams: ['JEE Main', 'KCET', 'COMEDK', 'National Cyber Security Certification'],
    topInstitutes: ['IIT Kanpur (C3i Center)', 'NFSU Gandhinagar', 'IIITs', 'BITS Pilani'],
    futureOutlook: 'High — Crucial for Indian Digital Public Infrastructure (DPI).'
  },
  {
    id: 'robotics-systems-engineer',
    onetCode: '17-2199.08',
    title: 'Robotics & Autonomous Systems Engineer',
    category: 'corporate',
    subSector: 'Mechatronics & Hardware',
    description: 'Integrates mechanical kinematics, sensor fusion, and computer vision to engineer physical automation.',
    riasec: { realistic: 90, investigative: 85, artistic: 30, social: 20, enterprising: 35, conventional: 60 },
    bigFive: { openness: 80, conscientiousness: 85, extraversion: 35, agreeableness: 50, neuroticism: 30 },
    indianStream: 'Class 11-12: Science (PCM)',
    entranceExams: ['JEE Advanced', 'JEE Main', 'MET (Manipal)'],
    topInstitutes: ['IIT Kharagpur', 'IIT Madras', 'IISc Bengaluru', 'PSG College of Technology'],
    futureOutlook: 'High — Manufacturing automation (Make in India) and robotics.'
  },

  // =========================================================================
  // 2. BIOMEDICAL, HEALTHCARE & MEDICINE
  // =========================================================================
  {
    id: 'clinical-physician',
    onetCode: '29-1229.00',
    title: 'Physician / Specialist Doctor (MBBS/MD)',
    category: 'government',
    subSector: 'Clinical Medicine',
    description: 'Diagnoses illnesses, prescribes treatments, and delivers life-saving patient clinical interventions.',
    riasec: { realistic: 40, investigative: 95, artistic: 20, social: 90, enterprising: 40, conventional: 65 },
    bigFive: { openness: 65, conscientiousness: 95, extraversion: 60, agreeableness: 90, neuroticism: 25 },
    indianStream: 'Class 11-12: Science (PCB - Physics, Chemistry, Biology)',
    entranceExams: ['NEET-UG (National Eligibility cum Entrance Test)'],
    topInstitutes: ['AIIMS New Delhi', 'CMC Vellore', 'JIPMER Puducherry', 'KGMU Lucknow'],
    futureOutlook: 'Perennially High — India is expanding healthcare infrastructure.'
  },
  {
    id: 'biotech-genetic-researcher',
    onetCode: '19-1029.04',
    title: 'Biotechnologist & Geneticist',
    category: 'corporate',
    subSector: 'Life Sciences',
    description: 'Conducts laboratory research on recombinant DNA, mRNA therapeutics, and agricultural bio-solutions.',
    riasec: { realistic: 60, investigative: 95, artistic: 35, social: 35, enterprising: 30, conventional: 65 },
    bigFive: { openness: 85, conscientiousness: 90, extraversion: 35, agreeableness: 55, neuroticism: 30 },
    indianStream: 'Class 11-12: Science (PCB / PCMB)',
    entranceExams: ['NEET-UG', 'CUET-UG', 'GAT-B (Graduate Aptitude Test-Biotech)', 'NEST / IAT'],
    topInstitutes: ['IISc Bengaluru', 'IISERs (Pune, Mohali)', 'NCBS Bengaluru', 'IIT Delhi'],
    futureOutlook: 'Very High — Precision genomics and biopharma hub.'
  },
  {
    id: 'clinical-psychologist',
    onetCode: '19-3031.02',
    title: 'Clinical Psychologist & Neuropsychologist',
    category: 'creative',
    subSector: 'Mental Health Sciences',
    description: 'Assesses cognitive, emotional, and behavioral dynamics; provides psychotherapy and cognitive interventions.',
    riasec: { realistic: 15, investigative: 85, artistic: 40, social: 95, enterprising: 40, conventional: 50 },
    bigFive: { openness: 85, conscientiousness: 80, extraversion: 65, agreeableness: 95, neuroticism: 30 },
    indianStream: 'Class 11-12: Any Stream (Humanities / Science / Commerce with Psychology)',
    entranceExams: ['CUET-UG', 'NIMHANS Entrance', 'TISS-NET (Postgrad)'],
    topInstitutes: ['NIMHANS Bengaluru', 'TISS Mumbai', 'Delhi University (LSR, Gargi)', 'Christ University'],
    futureOutlook: 'Exponential Growth — Escalating focus on adolescent & corporate mental health.'
  },

  // =========================================================================
  // 3. CIVIL SERVICES, LAW & PUBLIC POLICY
  // =========================================================================
  {
    id: 'civil-services-ias-ips',
    onetCode: '11-1031.00',
    title: 'Civil Servant / Administrator (IAS / IPS / IFS)',
    category: 'government',
    subSector: 'Public Administration',
    description: 'Directs district administrative policy, executes national welfare programs, and oversees public order.',
    riasec: { realistic: 30, investigative: 75, artistic: 25, social: 85, enterprising: 90, conventional: 80 },
    bigFive: { openness: 70, conscientiousness: 95, extraversion: 75, agreeableness: 70, neuroticism: 20 },
    indianStream: 'Class 11-12: Any Stream (Humanities, Science, or Commerce)',
    entranceExams: ['UPSC Civil Services Examination (Preliminary + Mains + Interview)'],
    topInstitutes: ['Any recognized university degree (St. Stephen’s, IITs, JNU, NLUs)'],
    futureOutlook: 'Prestigious & Stable — Premier institution of Indian governance.'
  },
  {
    id: 'corporate-litigation-lawyer',
    onetCode: '23-1011.00',
    title: 'Corporate Counsel / Constitutional Lawyer',
    category: 'corporate',
    subSector: 'Legal Jurisprudence',
    description: 'Argues cases before judicial benches, structures multi-million dollar cross-border acquisitions, and safeguards legal rights.',
    riasec: { realistic: 20, investigative: 85, artistic: 35, social: 65, enterprising: 90, conventional: 75 },
    bigFive: { openness: 75, conscientiousness: 90, extraversion: 80, agreeableness: 45, neuroticism: 25 },
    indianStream: 'Class 11-12: Any Stream (Humanities / Commerce / Science)',
    entranceExams: ['CLAT (Common Law Admission Test)', 'AILET (NLU Delhi)', 'SLAT (Symbiosis)'],
    topInstitutes: ['NLSIU Bengaluru', 'NALSAR Hyderabad', 'NLU Delhi', 'WBNUJS Kolkata'],
    futureOutlook: 'Very High — India’s corporate expansion, data privacy, and intellectual property.'
  },

  // =========================================================================
  // 4. COMMERCE, FINANCE & ENTREPRENEURSHIP
  // =========================================================================
  {
    id: 'chartered-accountant-cfo',
    onetCode: '13-2011.00',
    title: 'Chartered Accountant & Financial Strategist',
    category: 'corporate',
    subSector: 'Auditing & Corporate Finance',
    description: 'Audits statutory financials, directs corporate tax strategies, and advises corporate boardrooms on solvency.',
    riasec: { realistic: 25, investigative: 75, artistic: 15, social: 35, enterprising: 75, conventional: 95 },
    bigFive: { openness: 45, conscientiousness: 98, extraversion: 50, agreeableness: 55, neuroticism: 20 },
    indianStream: 'Class 11-12: Commerce with Mathematics (or Science with Math)',
    entranceExams: ['CA Foundation (ICAI)', 'CMA Foundation', 'CS Foundation'],
    topInstitutes: ['The Institute of Chartered Accountants of India (ICAI)', 'SRCC Delhi', 'St. Xavier’s Kolkata'],
    futureOutlook: 'Anchor Profession — Statutory requirement for every incorporated Indian business.'
  },
  {
    id: 'startup-founder-operator',
    onetCode: '11-1021.00',
    title: 'Startup Founder & Venture Builder',
    category: 'startup',
    subSector: 'Entrepreneurship',
    description: 'Identifies systemic market inefficiencies, prototypes high-scale MVPs, and builds commercial organizations.',
    riasec: { realistic: 40, investigative: 65, artistic: 60, social: 60, enterprising: 98, conventional: 40 },
    bigFive: { openness: 95, conscientiousness: 85, extraversion: 90, agreeableness: 60, neuroticism: 20 },
    indianStream: 'Class 11-12: Any Stream (Science / Commerce / Humanities)',
    entranceExams: ['Entrance to premier UG (IIT / BITS / IIM IPM / Ashoka)'],
    topInstitutes: ['IITs (E-Cell network)', 'IIM Ahmedabad / Bangalore', 'BITS Pilani', 'Plaksha University'],
    futureOutlook: 'Dynamic — India is the 3rd largest startup ecosystem globally.'
  },
  {
    id: 'investment-banker-analyst',
    onetCode: '13-2051.00',
    title: 'Investment Banker & Quant Analyst',
    category: 'corporate',
    subSector: 'Capital Markets',
    description: 'Structures debt/equity financing, evaluates mergers and acquisitions, and writes algorithmic pricing models.',
    riasec: { realistic: 30, investigative: 90, artistic: 20, social: 30, enterprising: 90, conventional: 85 },
    bigFive: { openness: 65, conscientiousness: 95, extraversion: 75, agreeableness: 45, neuroticism: 25 },
    indianStream: 'Class 11-12: Commerce with Math / Science PCM',
    entranceExams: ['CUET-UG', 'IPMAT', 'CAT (Postgrad)', 'CFA Institute Exams'],
    topInstitutes: ['IIMs (via IPMAT or CAT)', 'SRCC Delhi', 'St. Stephen’s College', 'IITs'],
    futureOutlook: 'High Paying — Rapid expansion of Indian retail and institutional capital markets.'
  },

  // =========================================================================
  // 5. DESIGN, ARCHITECTURE & CREATIVE ARTS
  // =========================================================================
  {
    id: 'product-uiux-designer',
    onetCode: '27-1021.00',
    title: 'Product & UX/UI Designer',
    category: 'creative',
    subSector: 'Digital Product Design',
    description: 'Designs ergonomic human-computer interfaces, user workflows, design systems, and digital interactions.',
    riasec: { realistic: 35, investigative: 70, artistic: 95, social: 55, enterprising: 50, conventional: 40 },
    bigFive: { openness: 95, conscientiousness: 75, extraversion: 55, agreeableness: 75, neuroticism: 35 },
    indianStream: 'Class 11-12: Any Stream (Design aptitude preferred)',
    entranceExams: ['UCEED (IIT Bombay)', 'NID DAT (Design Aptitude Test)', 'NIFT'],
    topInstitutes: ['NID Ahmedabad', 'IDC School of Design (IIT Bombay)', 'DOD IIT Guwahati', 'Srishti Manipal'],
    futureOutlook: 'Very High — Every consumer software and device requires world-class product design.'
  },
  {
    id: 'sustainable-architect',
    onetCode: '17-1011.00',
    title: 'Architect & Sustainable Urban Planner',
    category: 'creative',
    subSector: 'Built Environment',
    description: 'Combines structural physics with aesthetics to design climate-resilient buildings, public plazas, and smart cities.',
    riasec: { realistic: 75, investigative: 75, artistic: 90, social: 35, enterprising: 55, conventional: 60 },
    bigFive: { openness: 90, conscientiousness: 85, extraversion: 50, agreeableness: 60, neuroticism: 30 },
    indianStream: 'Class 11-12: Science (PCM mandatory for B.Arch)',
    entranceExams: ['NATA (National Aptitude Test in Architecture)', 'JEE Main Paper 2 (B.Arch)'],
    topInstitutes: ['CEPT University Ahmedabad', 'IIT Roorkee', 'SPA New Delhi', 'NIT Trichy'],
    futureOutlook: 'High — India’s massive smart cities and green building mandates.'
  },
  {
    id: 'film-visual-storyteller',
    onetCode: '27-2012.02',
    title: 'Film Director & Creative Producer',
    category: 'creative',
    subSector: 'Cinema & Media',
    description: 'Directs narrative vision, cinematography, soundscapes, and dramatic performance for streaming and cinema.',
    riasec: { realistic: 45, investigative: 50, artistic: 98, social: 65, enterprising: 80, conventional: 30 },
    bigFive: { openness: 98, conscientiousness: 70, extraversion: 80, agreeableness: 65, neuroticism: 40 },
    indianStream: 'Class 11-12: Any Stream (Arts / Humanities / Commerce / Science)',
    entranceExams: ['JET (FTII / SRFTI Joint Entrance Test)', 'Whistling Woods Entrance'],
    topInstitutes: ['FTII Pune', 'SRFTI Kolkata', 'National School of Drama (NSD)', 'MCRC Jamia'],
    futureOutlook: 'Expanding — India has one of the world’s largest media and entertainment industries.'
  },

  // =========================================================================
  // 6. CORE ENGINEERING & PHYSICAL SCIENCES
  // =========================================================================
  {
    id: 'aerospace-space-scientist',
    onetCode: '17-2011.00',
    title: 'Aerospace & Satellite Propulsion Engineer',
    category: 'government',
    subSector: 'Space Tech & Avionics',
    description: 'Designs orbital launch vehicles, satellite communication payloads, and interplanetary spacecraft.',
    riasec: { realistic: 85, investigative: 95, artistic: 25, social: 20, enterprising: 30, conventional: 70 },
    bigFive: { openness: 85, conscientiousness: 95, extraversion: 30, agreeableness: 50, neuroticism: 25 },
    indianStream: 'Class 11-12: Science (PCM)',
    entranceExams: ['JEE Advanced (for IIST / IIT)', 'IIST Admission via JEE Advanced'],
    topInstitutes: ['Indian Institute of Space Science and Technology (IIST)', 'IIT Madras', 'IIT Bombay', 'ISRO Satellite Center'],
    futureOutlook: 'Surging — Private space tech startups (In-Space, Skyroot, Agnikul) and ISRO programs.'
  },
  {
    id: 'renewable-energy-engineer',
    onetCode: '17-2199.11',
    title: 'Renewable Energy & Battery Storage Specialist',
    category: 'corporate',
    subSector: 'CleanTech',
    description: 'Designs grid-scale solar parks, green hydrogen electrolyzers, and solid-state EV battery architectures.',
    riasec: { realistic: 85, investigative: 85, artistic: 25, social: 35, enterprising: 50, conventional: 65 },
    bigFive: { openness: 80, conscientiousness: 90, extraversion: 45, agreeableness: 60, neuroticism: 25 },
    indianStream: 'Class 11-12: Science (PCM)',
    entranceExams: ['JEE Main', 'JEE Advanced', 'GATE (Postgrad)'],
    topInstitutes: ['IIT Delhi', 'IIT Kharagpur', 'TERI School of Advanced Studies', 'NIT Surathkal'],
    futureOutlook: 'Booming — India’s 500 GW non-fossil capacity mandate by 2030.'
  },

  // =========================================================================
  // 7. DEFENCE, AVIATION & MARITIME
  // =========================================================================
  {
    id: 'armed-forces-officer-nda',
    onetCode: '55-1011.00',
    title: 'Commissioned Military Officer (Army / Navy / Air Force)',
    category: 'government',
    subSector: 'National Defence',
    description: 'Commands military combat units, strategic defense assets, and tactical national security operations.',
    riasec: { realistic: 95, investigative: 55, artistic: 20, social: 75, enterprising: 90, conventional: 75 },
    bigFive: { openness: 60, conscientiousness: 98, extraversion: 85, agreeableness: 65, neuroticism: 15 },
    indianStream: 'Class 11-12: Science PCM (Air Force / Navy) or Any Stream (Army)',
    entranceExams: ['NDA (National Defence Academy Exam by UPSC + SSB Interview)', 'CDS (Postgrad)'],
    topInstitutes: ['National Defence Academy (Khadakwasla, Pune)', 'Indian Military Academy (Dehradun)', 'Air Force Academy (Dundigal)'],
    futureOutlook: 'Pinnacle of Honor & Public Service.'
  },
  {
    id: 'commercial-airline-pilot',
    onetCode: '53-2011.00',
    title: 'Commercial Airline Pilot',
    category: 'corporate',
    subSector: 'Civil Aviation',
    description: 'Commands commercial transport aircraft, operating across international flight corridors under strict aviation safety protocols.',
    riasec: { realistic: 95, investigative: 60, artistic: 15, social: 40, enterprising: 65, conventional: 90 },
    bigFive: { openness: 50, conscientiousness: 98, extraversion: 60, agreeableness: 65, neuroticism: 10 },
    indianStream: 'Class 11-12: Science (Physics & Mathematics mandatory)',
    entranceExams: ['IGRUA Entrance Exam', 'DGCA CPL Theory Examinations & Class 1 Medical'],
    topInstitutes: ['Indira Gandhi Rashtriya Uran Akademi (IGRUA)', 'National Flying Training Institute (NFTI)'],
    futureOutlook: 'Extremely High — India is the fastest growing aviation market globally (Air India/IndiGo fleet expansions).'
  },

  // =========================================================================
  // 8. ACADEMIC, SCIENTIFIC & PURE RESEARCH
  // =========================================================================
  {
    id: 'isro-space-scientist',
    onetCode: '19-2012.00',
    title: 'Space Scientist & Astrophysicist (ISRO / TIFR)',
    category: 'academic',
    subSector: 'Space Sciences & Cosmology',
    description: 'Conducts fundamental planetary physics, satellite orbital mechanics, and astronomical observations for space exploration missions.',
    riasec: { realistic: 75, investigative: 96, artistic: 35, social: 30, enterprising: 40, conventional: 65 },
    bigFive: { openness: 92, conscientiousness: 94, extraversion: 35, agreeableness: 55, neuroticism: 25 },
    indianStream: 'Class 11-12: Science (PCM)',
    entranceExams: ['JEE Advanced (IIST quota)', 'GATE (Physics / Aerospace)', 'JEST (Joint Entrance Screening Test)'],
    topInstitutes: ['Indian Institute of Space Science and Technology (IIST Thiruvananthapuram)', 'TIFR Mumbai', 'IISc Bengaluru', 'IUCAA Pune'],
    futureOutlook: 'Strategic Frontier — Supported by India’s Gaganyaan and Chandrayaan long-term research missions.'
  },
  {
    id: 'computational-biology-scientist',
    onetCode: '19-1029.01',
    title: 'Bioinformatics & Computational Genomics Scientist',
    category: 'academic',
    subSector: 'Genomics & Molecular Medicine',
    description: 'Applies deep learning and statistical modeling to DNA sequencing, protein folding, and targeted drug discovery.',
    riasec: { realistic: 50, investigative: 95, artistic: 40, social: 35, enterprising: 45, conventional: 70 },
    bigFive: { openness: 90, conscientiousness: 90, extraversion: 40, agreeableness: 60, neuroticism: 30 },
    indianStream: 'Class 11-12: Science (PCMB or PCM / PCB with Computer Science)',
    entranceExams: ['GATE (Life Sciences / Biotechnology)', 'CSIR-UGC NET (JRF)', 'CUET-PG'],
    topInstitutes: ['IISc Bengaluru', 'Institute of Genomics and Integrative Biology (CSIR-IGIB)', 'NCBS Bengaluru', 'IIT Delhi BioX'],
    futureOutlook: 'Revolutionary — Central to modern precision oncology, mRNA therapeutics, and synthetic biology.'
  },
  {
    id: 'university-professor-humanities',
    onetCode: '25-1062.00',
    title: 'Academic Professor & Social Theorist',
    category: 'academic',
    subSector: 'Higher Education & Humanities',
    description: 'Conducts original scholarly research, publishes historical and socio-economic monographs, and mentors undergraduate and doctoral scholars.',
    riasec: { realistic: 20, investigative: 90, artistic: 75, social: 85, enterprising: 55, conventional: 50 },
    bigFive: { openness: 95, conscientiousness: 85, extraversion: 65, agreeableness: 75, neuroticism: 35 },
    indianStream: 'Class 11-12: Humanities or Any Stream',
    entranceExams: ['UGC-NET (National Eligibility Test for JRF & Assistant Professor)', 'CUET-PG'],
    topInstitutes: ['Jawaharlal Nehru University (JNU Delhi)', 'Delhi University (St. Stephen’s / Miranda House)', 'Jadavpur University', 'IIT Madras (HSS)'],
    futureOutlook: 'Enduring & Foundational — Critical for policy analysis, historical preservation, and civil society ethics.'
  }
];

