/**
 * PRERNA Stealth Assessment Engine
 * Maps game choices to psychometric traits without user awareness
 */

export interface Choice {
  id: string;
  text: string;
  traitMappings: TraitImpact[];
  narrativeConsequence?: string;
}

export interface TraitImpact {
  trait: string; // 'openness', 'conscientiousness', etc.
  dimension: string; // 'big_five', 'riasec', 'emotional'
  weight: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  context: 'social' | 'academic' | 'creative' | 'crisis' | 'routine';
  choices: Choice[];
  timeLimit?: number; // Reaction time measurement (ms)
}

export interface GameSession {
  sessionId: string;
  userId: string;
  questType: 'life_quest' | 'skill_arena' | 'mood_mirror' | 'social_compass';
  scenes: Scene[];
  responses: Response[];
  startTime: Date;
  endTime?: Date;
}

export interface Response {
  sceneId: string;
  choiceId: string;
  reactionTime: number; // Milliseconds
  hesitationPattern?: number[]; // Mouse movement delays
  timestamp: Date;
}

export class StealthAssessmentEngine {
  private session: GameSession;
  private traitAccumulator: Map<string, number> = new Map();
  private confidenceAccumulator: Map<string, number> = new Map();

  constructor(session: GameSession) {
    this.session = session;
  }

  /**
   * Record a user choice and calculate trait impacts
   */
  recordResponse(scene: Scene, choice: Choice, reactionTime: number): void {
    const response: Response = {
      sceneId: scene.id,
      choiceId: choice.id,
      reactionTime,
      timestamp: new Date(),
    };

    this.session.responses.push(response);

    // Apply trait mappings with confidence weighting
    choice.traitMappings.forEach(mapping => {
      const currentValue = this.traitAccumulator.get(mapping.trait) || 0;
      const currentConfidence = this.confidenceAccumulator.get(mapping.trait) || 0;
      
      // Weight by reaction time (faster = more authentic)
      const authenticityWeight = this.calculateAuthenticityWeight(reactionTime);
      const weightedImpact = mapping.weight * mapping.confidence * authenticityWeight;
      
      // Running average with confidence weighting
      const newConfidence = currentConfidence + mapping.confidence;
      const newValue = (currentValue * currentConfidence + weightedImpact * mapping.confidence) / newConfidence;
      
      this.traitAccumulator.set(mapping.trait, newValue);
      this.confidenceAccumulator.set(mapping.trait, newConfidence);
    });

    // Track hesitation patterns (micro-behaviors)
    this.analyzeHesitationPattern(scene, reactionTime);
  }

  /**
   * Faster responses (< 2s) weighted higher (more instinctive/authentic)
   * Slower responses may indicate overthinking or social desirability bias
   */
  private calculateAuthenticityWeight(reactionTime: number): number {
    const optimalTime = 2000; // 2 seconds
    const maxTime = 10000; // 10 seconds
    
    if (reactionTime < optimalTime) {
      return 1.0 + (optimalTime - reactionTime) / optimalTime * 0.2; // Up to 1.2x for fast
    } else if (reactionTime > maxTime) {
      return 0.5; // Penalty for very slow
    } else {
      return 1.0 - (reactionTime - optimalTime) / (maxTime - optimalTime) * 0.5;
    }
  }

  /**
   * Analyze hesitation patterns to detect uncertainty or conflict
   */
  private analyzeHesitationPattern(_scene: Scene, _reactionTime: number): void {
    // In production: track mouse movements, tab switches, etc.
    // For now: use reaction time variance as proxy
    const recentResponses = this.session.responses.slice(-5);
    if (recentResponses.length >= 3) {
      const times = recentResponses.map(r => r.reactionTime);
      const variance = this.calculateVariance(times);
      
      // High variance = internal conflict or uncertainty
      if (variance > 1000000) { // Threshold
        this.traitAccumulator.set('decision_consistency', 
          (this.traitAccumulator.get('decision_consistency') || 1) * 0.9);
      }
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
  }

  /**
   * Generate final trait profile from accumulated data
   */
  calculateProfile(): TraitProfile {
    const bigFive = this.calculateBigFive();
    const riasec = this.calculateRIASEC();
    const emotional = this.calculateEmotionalProfile();
    
    return {
      bigFive,
      riasec,
      emotional,
      confidence: this.calculateOverallConfidence(),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateBigFive(): BigFiveScores {
    // Normalize accumulated traits to 0-100 scale
    const normalize = (val: number) => Math.max(0, Math.min(100, 50 + val * 25));
    
    return {
      openness: normalize(this.traitAccumulator.get('openness') || 0),
      conscientiousness: normalize(this.traitAccumulator.get('conscientiousness') || 0),
      extraversion: normalize(this.traitAccumulator.get('extraversion') || 0),
      agreeableness: normalize(this.traitAccumulator.get('agreeableness') || 0),
      neuroticism: normalize(this.traitAccumulator.get('neuroticism') || 0),
    };
  }

  private calculateRIASEC(): RIASECScores {
    const normalize = (val: number) => Math.max(0, Math.min(100, 50 + val * 25));
    
    return {
      realistic: normalize(this.traitAccumulator.get('realistic') || 0),
      investigative: normalize(this.traitAccumulator.get('investigative') || 0),
      artistic: normalize(this.traitAccumulator.get('artistic') || 0),
      social: normalize(this.traitAccumulator.get('social') || 0),
      enterprising: normalize(this.traitAccumulator.get('enterprising') || 0),
      conventional: normalize(this.traitAccumulator.get('conventional') || 0),
    };
  }

  private calculateEmotionalProfile(): EmotionalProfile {
    return {
      resilience: this.normalizeTrait('resilience'),
      empathy: this.normalizeTrait('empathy'),
      emotionalAwareness: this.normalizeTrait('emotional_awareness'),
      impulseControl: this.normalizeTrait('impulse_control'),
      socialIntuition: this.normalizeTrait('social_intuition'),
    };
  }

  private normalizeTrait(trait: string): number {
    const val = this.traitAccumulator.get(trait) || 0;
    return Math.max(0, Math.min(100, 50 + val * 25));
  }

  private calculateOverallConfidence(): number {
    const confidences = Array.from(this.confidenceAccumulator.values());
    if (confidences.length === 0) return 0;
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  /**
   * Export raw data for storage (encrypted)
   */
  exportData(): string {
    return JSON.stringify({
      session: this.session,
      traits: Object.fromEntries(this.traitAccumulator),
      confidences: Object.fromEntries(this.confidenceAccumulator),
    });
  }
}

// Type definitions
export interface TraitProfile {
  bigFive: BigFiveScores;
  riasec: RIASECScores;
  emotional: EmotionalProfile;
  confidence: number;
  timestamp: string;
}

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface RIASECScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface EmotionalProfile {
  resilience: number;
  empathy: number;
  emotionalAwareness: number;
  impulseControl: number;
  socialIntuition: number;
}
