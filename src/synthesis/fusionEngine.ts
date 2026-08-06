/**
 * Profile Fusion Engine
 * Merges multi-dimensional assessment data into unified user archetype
 */

import { TraitProfile } from '../assessment/engine';
import { CognitiveProfile } from '../assessment/skills/engine';

export interface UnifiedProfile {
  userId: string;
  generatedAt: string;
  
  // Core Dimensions
  personality: TraitProfile;
  cognition: CognitiveProfile;
  
  // Derived Archetype
  archetype: UserArchetype;
  archetypeConfidence: number;
  
  // Career Alignment
  careerMatches: CareerMatch[];
  topCareer: CareerMatch;
  
  // Learning Profile
  learningProfile: LearningProfile;
  
  // Risk Factors
  riskFactors: RiskFactor[];
  wellbeingScore: number;
  
  // Growth Trajectory
  strengths: string[];
  growthAreas: string[];
  recommendedActions: ActionItem[];
}

export interface UserArchetype {
  name: string;
  description: string;
  traits: string[];
  famousExamples: string[];
  workEnvironment: string;
  collaborationStyle: string;
}

export interface CareerMatch {
  field: string;
  role: string;
  matchScore: number;
  whyFit: string[];
  preparationPath: string[];
  indianContext: {
    entranceExams: string[];
    topColleges: string[];
    salaryRange: string;
    growthOutlook: string;
  };
}

export interface LearningProfile {
  optimalStudyTime: string; // Based on chronotype
  bestLearningModes: string[];
  attentionSpan: number; // minutes
  retentionStrategies: string[];
  motivationTriggers: string[];
}

export interface RiskFactor {
  category: 'academic' | 'mental' | 'social' | 'physical';
  severity: 'low' | 'medium' | 'high';
  indicator: string;
  recommendedIntervention: string;
}

export interface ActionItem {
  id: string;
  category: 'daily' | 'weekly' | 'monthly' | 'milestone';
  title: string;
  description: string;
  expectedOutcome: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export interface BehavioralPattern {
  timestamp: string;
  interactionType: string;
  emotionalSignal: number;
  metadata: Record<string, unknown>;
}

export class ProfileFusionEngine {
  private personality: TraitProfile;
  private cognition: CognitiveProfile;
  private behavioralPatterns: BehavioralPattern[];

  constructor(
    personality: TraitProfile,
    cognition: CognitiveProfile,
    behavioralPatterns: BehavioralPattern[] = []
  ) {
    this.personality = personality;
    this.cognition = cognition;
    this.behavioralPatterns = behavioralPatterns;
  }

  synthesize(userId: string): UnifiedProfile {
    const archetype = this.calculateArchetype();
    const careerMatches = this.calculateCareerMatches();
    const learningProfile = this.generateLearningProfile();
    const riskFactors = this.detectRiskFactors();
    
    // Safety check if no matches
    const safeCareerMatches = careerMatches.length > 0 ? careerMatches : [{
      field: "General",
      role: "Undecided Explorer",
      matchScore: 50,
      whyFit: ["Keep exploring to find your passion"],
      preparationPath: ["Explore diverse subjects"],
      indianContext: { entranceExams: [], topColleges: [], salaryRange: "Variable", growthOutlook: "Unknown" }
    }];

    return {
      userId,
      generatedAt: new Date().toISOString(),
      personality: this.personality,
      cognition: this.cognition,
      archetype,
      archetypeConfidence: this.calculateArchetypeConfidence(),
      careerMatches: safeCareerMatches.slice(0, 5),
      topCareer: safeCareerMatches[0],
      learningProfile,
      riskFactors,
      wellbeingScore: this.calculateWellbeingScore(),
      strengths: this.identifyStrengths(),
      growthAreas: this.identifyGrowthAreas(),
      recommendedActions: this.generateActionItems(archetype, safeCareerMatches[0], riskFactors),
    };
  }

  private calculateArchetype(): UserArchetype {
    const { bigFive, riasec } = this.personality;
    
    // High Openness + High Artistic + High Verbal = The Creator
    if (bigFive.openness > 70 && riasec.artistic > 70 && this.cognition.verbalFluency > 70) {
      return {
        name: "The Visionary Creator",
        description: "You see possibilities others miss and express them beautifully.",
        traits: ["Imaginative", "Expressive", "Curious", "Independent"],
        famousExamples: ["AR Rahman", "Sudha Murthy", "Amrita Sher-Gil"],
        workEnvironment: "Flexible, creative spaces with autonomy",
        collaborationStyle: "Prefers small teams or solo work, values deep connections",
      };
    }
    
    // High Conscientiousness + High Investigative + High Logical = The Analyst
    if (bigFive.conscientiousness > 70 && riasec.investigative > 70 && this.cognition.logicalReasoning > 70) {
      return {
        name: "The Precision Analyst",
        description: "You bring order to complexity through systematic thinking.",
        traits: ["Detail-oriented", "Persistent", "Objective", "Methodical"],
        famousExamples: ["Dr. APJ Abdul Kalam", "Narayana Murthy", "Kiran Mazumdar-Shaw"],
        workEnvironment: "Structured, intellectually challenging, clear goals",
        collaborationStyle: "Values competence, prefers clear roles and expectations",
      };
    }
    
    // High Extraversion + High Social + High Processing Speed = The Catalyst
    if (bigFive.extraversion > 70 && riasec.social > 70) {
      return {
        name: "The Social Catalyst",
        description: "You energize groups and bring people together toward common goals.",
        traits: ["Charismatic", "Empathetic", "Persuasive", "Energetic"],
        famousExamples: ["Ratan Tata", "Priyanka Chopra", "Virat Kohli"],
        workEnvironment: "Dynamic, people-focused, visible impact",
        collaborationStyle: "Thrives in teams, natural leader or connector",
      };
    }
    
    // High Agreeableness + High Social + High Emotional = The Nurturer
    if (bigFive.agreeableness > 70 && riasec.social > 60 && this.personality.emotional.empathy > 70) {
      return {
        name: "The Empathic Nurturer",
        description: "You understand and support others in their growth.",
        traits: ["Compassionate", "Patient", "Supportive", "Intuitive"],
        famousExamples: ["Mother Teresa", "Kailash Satyarthi", "Shabana Azmi"],
        workEnvironment: "Helping-focused, meaningful work, human connection",
        collaborationStyle: "Collaborative, prioritizes harmony and inclusion",
      };
    }
    
    // High Enterprising + High Conscientiousness = The Builder
    if (riasec.enterprising > 70 && bigFive.conscientiousness > 60) {
      return {
        name: "The Strategic Builder",
        description: "You create structures and systems that outlast you.",
        traits: ["Ambitious", "Organized", "Resourceful", "Determined"],
        famousExamples: ["Mukesh Ambani", "Indra Nooyi", "Byju Raveendran"],
        workEnvironment: "Results-driven, growth-oriented, leadership opportunities",
        collaborationStyle: "Direct, efficient, inspires through action",
      };
    }
    
    // Default: The Adaptable Explorer
    return {
      name: "The Adaptable Explorer",
      description: "You're discovering your path, with diverse strengths to draw upon.",
      traits: ["Flexible", "Curious", "Resilient", "Open-minded"],
      famousExamples: ["Sundar Pichai", "Kalpana Chawla", "Saina Nehwal"],
      workEnvironment: "Varied experiences, room to explore and pivot",
      collaborationStyle: "Adaptable, learns from different working styles",
    };
  }

  private calculateCareerMatches(): CareerMatch[] {
    const { bigFive, riasec } = this.personality;
    const matches: CareerMatch[] = [];

    // Technology/Engineering
    if (riasec.investigative > 60 && this.cognition.logicalReasoning > 60) {
      matches.push({
        field: "Technology",
        role: bigFive.openness > 70 ? "AI/ML Engineer" : "Software Engineer",
        matchScore: this.calculateMatchScore([riasec.investigative, this.cognition.logicalReasoning]),
        whyFit: [
          "Strong logical reasoning suits complex problem-solving",
          bigFive.conscientiousness > 60 ? "Detail-oriented nature catches bugs early" : "Creative approach to novel solutions",
          "High investigative drive for continuous learning",
        ],
        preparationPath: [
          "Build projects on GitHub",
          "Learn Python and data structures",
          "Contribute to open source",
        ],
        indianContext: {
          entranceExams: ["JEE Main/Advanced", "BITSAT", "State CETs"],
          topColleges: ["IITs", "NITs", "BITS Pilani", "IIITs"],
          salaryRange: "₹8-50 LPA (entry to senior)",
          growthOutlook: "Excellent - 25% YoY growth in AI/ML roles",
        },
      });
    }

    // Design/Creative
    if (riasec.artistic > 65 && (bigFive.openness > 65 || this.cognition.creativeDivergence > 65)) {
      matches.push({
        field: "Design",
        role: this.cognition.spatialIntelligence > 70 ? "UX/UI Designer" : "Content Creator",
        matchScore: this.calculateMatchScore([riasec.artistic, bigFive.openness]),
        whyFit: [
          "Natural aesthetic sense and originality",
          "Openness to new ideas drives innovation",
          "Spatial/visual intelligence for design thinking",
        ],
        preparationPath: [
          "Build portfolio on Behance/Dribbble",
          "Learn Figma/Adobe Creative Suite",
          "Take online design courses (Google UX Certificate)",
        ],
        indianContext: {
          entranceExams: ["NID DAT", "NIFT", "CEED"],
          topColleges: ["NID", "NIFT", "Srishti", "IDC IIT Bombay"],
          salaryRange: "₹6-30 LPA",
          growthOutlook: "Strong - Digital transformation driving demand",
        },
      });
    }

    // Medicine/Healthcare
    if (riasec.investigative > 60 && riasec.social > 50 && bigFive.conscientiousness > 65) {
      matches.push({
        field: "Healthcare",
        role: this.personality.emotional.empathy > 75 ? "Psychiatrist/Psychologist" : "Physician/Surgeon",
        matchScore: this.calculateMatchScore([riasec.investigative, bigFive.conscientiousness, this.personality.emotional.empathy]),
        whyFit: [
          "Scientific rigor combined with people skills",
          "High conscientiousness for patient care",
          "Empathy creates trust with patients",
        ],
        preparationPath: [
          "Focus on Biology, Chemistry, Physics",
          "Shadow doctors/volunteer at hospitals",
          "Prepare for NEET with coaching",
        ],
        indianContext: {
          entranceExams: ["NEET-UG", "AIIMS", "JIPMER"],
          topColleges: ["AIIMS Delhi", "CMC Vellore", "AFMC Pune", "MAMC"],
          salaryRange: "₹10-50 LPA (govt) to ₹1-5 Cr (private practice)",
          growthOutlook: "Stable - Always in demand, growing mental health awareness",
        },
      });
    }

    // Business/Entrepreneurship
    if (riasec.enterprising > 65 && (bigFive.extraversion > 60 || this.cognition.processingSpeed > 70)) {
      matches.push({
        field: "Business",
        role: bigFive.openness > 70 ? "Startup Founder" : "Management Consultant",
        matchScore: this.calculateMatchScore([riasec.enterprising, bigFive.extraversion]),
        whyFit: [
          "Natural persuasion and leadership abilities",
          "Quick thinking for fast-paced decisions",
          "Drive to create and build value",
        ],
        preparationPath: [
          "Join entrepreneurship cells (E-Cell)",
          "Build side projects/businesses",
          "Learn financial literacy and networking",
        ],
        indianContext: {
          entranceExams: ["CAT", "XAT", "NMAT", "IPMAT"],
          topColleges: ["IIMs", "ISB", "XLRI", "FMS Delhi"],
          salaryRange: "Highly variable - ₹0 to ₹10Cr+ (founders)",
          growthOutlook: "Explosive - India startup ecosystem #3 globally",
        },
      });
    }

    // Research/Academia
    if (riasec.investigative > 70 && bigFive.openness > 60 && bigFive.conscientiousness > 60) {
      matches.push({
        field: "Research",
        role: "Scientist/Researcher",
        matchScore: this.calculateMatchScore([riasec.investigative, bigFive.openness, bigFive.conscientiousness]),
        whyFit: [
          "Deep curiosity and patience for complex questions",
          "Methodical approach to hypothesis testing",
          "Intellectual openness to paradigm shifts",
        ],
        preparationPath: [
          "Pursue integrated MSc/PhD programs",
          "Publish research papers",
          "Apply for CSIR-NET, GATE, JRF fellowships",
        ],
        indianContext: {
          entranceExams: ["CSIR-NET", "GATE", "JEST", "TIFR"],
          topColleges: ["IISc", "TIFR", "IISERs", "CMI"],
          salaryRange: "₹6-20 LPA (govt research), more in industry R&D",
          growthOutlook: "Growing - Govt push for R&D, semiconductor focus",
        },
      });
    }

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private generateLearningProfile(): LearningProfile {
    const { bigFive } = this.personality;
    const { processingSpeed, learningStyle } = this.cognition;

    const optimalTime = bigFive.conscientiousness > 70 ? "Early morning (5-8 AM)" : "Late night (10 PM-1 AM)";

    const modes: Record<string, string[]> = {
      visual: ["Diagrams", "Videos", "Mind maps", "Color-coded notes"],
      auditory: ["Podcasts", "Group discussions", "Teaching others", "Voice notes"],
      kinesthetic: ["Hands-on projects", "Role-playing", "Physical models", "Lab work"],
      mixed: ["Combination of all methods", "Interactive apps", "Project-based learning"],
    };

    const baseAttention = 25; 
    const attentionModifier = (bigFive.conscientiousness - 50) / 10;
    const speedModifier = (processingSpeed - 50) / 20;
    const attentionSpan = Math.max(15, Math.min(60, baseAttention + attentionModifier + speedModifier));

    return {
      optimalStudyTime: optimalTime,
      bestLearningModes: modes[learningStyle] || modes.mixed,
      attentionSpan: Math.round(attentionSpan),
      retentionStrategies: this.generateRetentionStrategies(),
      motivationTriggers: this.generateMotivationTriggers(),
    };
  }

  private detectRiskFactors(): RiskFactor[] {
    const risks: RiskFactor[] = [];
    const { bigFive, emotional } = this.personality;

    if (bigFive.conscientiousness < 40 && this.cognition.processingSpeed < 50) {
      risks.push({
        category: 'academic',
        severity: 'medium',
        indicator: 'Low consistency combined with slower processing may lead to falling behind',
        recommendedIntervention: 'Structured study schedule with accountability partner',
      });
    }

    if (bigFive.neuroticism > 75 && emotional.resilience < 40) {
      risks.push({
        category: 'mental',
        severity: 'high',
        indicator: 'High stress sensitivity with low coping resources',
        recommendedIntervention: 'Daily mindfulness practice + counselor check-in',
      });
    }

    if (bigFive.extraversion < 30 && emotional.socialIntuition < 40) {
      risks.push({
        category: 'social',
        severity: 'low',
        indicator: 'Social withdrawal pattern may limit opportunities',
        recommendedIntervention: 'Small group activities aligned with interests',
      });
    }

    return risks;
  }

  private generateActionItems(archetype: UserArchetype, topCareer: CareerMatch, riskFactors: RiskFactor[]): ActionItem[] {
    const actions: ActionItem[] = [];

    actions.push({
      id: '1',
      category: 'daily',
      title: 'Morning Intention Setting',
      description: `Spend 5 minutes visualizing your day as a ${archetype.name}`,
      expectedOutcome: 'Increased focus and purpose',
      difficulty: 'easy',
      estimatedTime: '5 minutes',
    });

    actions.push({
      id: '2',
      category: 'weekly',
      title: `Explore ${topCareer.field}`,
      description: `Watch 2 YouTube videos or read 1 article about ${topCareer.role}`,
      expectedOutcome: 'Deeper career clarity',
      difficulty: 'easy',
      estimatedTime: '30 minutes',
    });

    actions.push({
      id: '3',
      category: 'monthly',
      title: 'Skill Building Sprint',
      description: `Complete one module related to ${topCareer.preparationPath[0] || 'your field'}`,
      expectedOutcome: 'Tangible skill progress',
      difficulty: 'medium',
      estimatedTime: '10 hours',
    });

    riskFactors.forEach((risk, idx) => {
      actions.push({
        id: `risk-${idx}`,
        category: 'daily',
        title: `Address ${risk.category} risk`,
        description: risk.recommendedIntervention,
        expectedOutcome: 'Improved wellbeing',
        difficulty: 'medium',
        estimatedTime: '15 minutes',
      });
    });

    return actions;
  }

  private calculateMatchScore(traits: number[]): number {
    const avg = traits.reduce((a, b) => a + b, 0) / traits.length;
    return Math.round(Math.min(100, avg));
  }

  private calculateArchetypeConfidence(): number {
    const variance = Math.abs(this.personality.bigFive.openness - 50) +
      Math.abs(this.personality.bigFive.conscientiousness - 50);
    return Math.min(100, 50 + variance / 2);
  }

  private calculateWellbeingScore(): number {
    const { emotional } = this.personality;
    const resilience = emotional.resilience;
    const support = emotional.empathy; 
    const balance = 100 - Math.abs(this.personality.bigFive.neuroticism - 30); 
    
    return Math.round((resilience + support + balance) / 3);
  }

  private identifyStrengths(): string[] {
    const strengths: string[] = [];
    const { bigFive, emotional } = this.personality;
    const { logicalReasoning, verbalFluency, creativeDivergence } = this.cognition;

    if (logicalReasoning > 70) strengths.push("Analytical problem-solving");
    if (verbalFluency > 70) strengths.push("Communication & articulation");
    if (creativeDivergence > 70) strengths.push("Creative ideation");
    if (emotional.empathy > 70) strengths.push("Understanding others");
    if (bigFive.conscientiousness > 70) strengths.push("Reliability & follow-through");
    if (bigFive.openness > 70) strengths.push("Adaptability to new situations");

    return strengths.length > 0 ? strengths : ["Quick learner", "Self-aware"];
  }

  private identifyGrowthAreas(): string[] {
    const areas: string[] = [];
    const { bigFive, emotional } = this.personality;

    if (bigFive.conscientiousness < 50) areas.push("Consistency and follow-through");
    if (emotional.resilience < 50) areas.push("Stress management");
    if (bigFive.extraversion < 40) areas.push("Initiating social connections");
    if (bigFive.neuroticism > 70) areas.push("Emotional regulation");

    return areas;
  }

  private generateRetentionStrategies(): string[] {
    const strategies = ["Spaced repetition", "Active recall", "Teaching others"];
    
    if (this.cognition.learningStyle === 'visual') {
      strategies.push("Mind mapping", "Color coding");
    } else if (this.cognition.learningStyle === 'auditory') {
      strategies.push("Recording summaries", "Study groups");
    } else {
      strategies.push("Physical flashcards", "Walking while reviewing");
    }

    return strategies;
  }

  private generateMotivationTriggers(): string[] {
    const { bigFive } = this.personality;
    const triggers: string[] = [];

    if (bigFive.extraversion > 60) triggers.push("Study groups", "Accountability partners");
    if (bigFive.conscientiousness > 60) triggers.push("Progress tracking", "Streak maintenance");
    if (bigFive.openness > 60) triggers.push("New challenges", "Novel approaches");
    if (this.personality.riasec.enterprising > 60) triggers.push("Competition", "Leadership opportunities");

    return triggers.length > 0 ? triggers : ["Personal goals", "Small rewards"];
  }
}
