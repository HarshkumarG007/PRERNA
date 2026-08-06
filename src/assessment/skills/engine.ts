/**
 * Skill Arena - Cognitive Assessment Through Play
 * Measures: Logical, Verbal, Spatial, Creative, Processing Speed
 */

export interface GameResult {
  gameId: string;
  score: number;
  accuracy: number;
  speed: number; // ms per correct answer
  strategyPattern: string; // 'systematic', 'intuitive', 'exploratory', 'cautious'
  difficultyReached: number;
  timestamp: Date;
}

export interface CognitiveProfile {
  logicalReasoning: number; // Pattern recognition, deduction
  verbalFluency: number; // Word association, vocabulary
  spatialIntelligence: number; // Mental rotation, visualization
  creativeDivergence: number; // Novel solutions, lateral thinking
  processingSpeed: number; // Reaction time, quick decisions
  workingMemory: number; // Information retention under load
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export function calculateOptimalDifficulty(profile: any): GameDifficulty {
  if (!profile) return 'medium';
  const openness = profile.openness || 50;
  const conscientiousness = profile.conscientiousness || 50;
  
  if (openness > 70 && conscientiousness > 60) return 'hard';
  if (openness < 40 && conscientiousness < 40) return 'easy';
  return 'medium';
}

export class SkillArenaEngine {
  private results: Map<string, GameResult[]> = new Map();
  
  recordResult(gameId: string, result: GameResult): void {
    const existing = this.results.get(gameId) || [];
    existing.push(result);
    this.results.set(gameId, existing);
  }
  
  calculateCognitiveProfile(): CognitiveProfile {
    const patternMatch = this.results.get('pattern') || [];
    const wordBridge = this.results.get('word') || [];
    const spatialPuzzle = this.results.get('spatial') || [];
    const reactionTest = this.results.get('reaction') || [];
    const creativeChain = this.results.get('creative') || [];
    
    return {
      logicalReasoning: this.calcLogicalScore(patternMatch),
      verbalFluency: this.calcVerbalScore(wordBridge),
      spatialIntelligence: this.calcSpatialScore(spatialPuzzle),
      creativeDivergence: this.calcCreativeScore(creativeChain),
      processingSpeed: this.calcSpeedScore(reactionTest),
      workingMemory: this.calcMemoryScore(patternMatch),
      learningStyle: this.inferLearningStyle(),
    };
  }
  
  private calcLogicalScore(results: GameResult[]): number {
    if (results.length === 0) return 50;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const speedBonus = results.some(r => r.speed < 2000) ? 10 : 0;
    return Math.min(100, (avg / 10) + speedBonus);
  }
  
  private calcVerbalScore(results: GameResult[]): number {
    if (results.length === 0) return 50;
    return results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
  }
  
  private calcSpatialScore(results: GameResult[]): number {
    if (results.length === 0) return 50;
    const difficultyBonus = results.some(r => r.difficultyReached > 5) ? 15 : 0;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return Math.min(100, (avg / 10) + difficultyBonus);
  }
  
  private calcCreativeScore(results: GameResult[]): number {
    if (results.length === 0) return 50;
    // Creative scoring: uniqueness matters more than speed
    const uniqueness = results.reduce((sum, r) => {
      return sum + (r.strategyPattern === 'exploratory' ? 20 : 0);
    }, 0) / results.length;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return Math.min(100, (avg / 10) * 0.6 + uniqueness);
  }
  
  private calcSpeedScore(results: GameResult[]): number {
    if (results.length === 0) return 50;
    const avgSpeed = results.reduce((sum, r) => sum + r.speed, 0) / results.length;
    // Faster = higher score (inverse relationship)
    return Math.max(0, Math.min(100, 100 - (avgSpeed / 50)));
  }
  
  private calcMemoryScore(results: GameResult[]): number {
    if (results.length === 0) return 50;
    // Pattern match games test working memory
    const patternLength = results.reduce((max, r) => 
      Math.max(max, r.difficultyReached), 0);
    return Math.min(100, 50 + patternLength * 5);
  }
  
  private inferLearningStyle(): CognitiveProfile['learningStyle'] {
    const scores = {
      visual: this.calcGameAverage('spatial'),
      auditory: this.calcGameAverage('word'),
      kinesthetic: this.calcGameAverage('reaction'),
    };
    
    // Default to mixed if no data
    if (scores.visual === 50 && scores.auditory === 50 && scores.kinesthetic === 50) {
        return 'mixed';
    }

    const max = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (max[1] > 70) return max[0] as CognitiveProfile['learningStyle'];
    return 'mixed';
  }
  
  private calcGameAverage(gameId: string): number {
    const results = this.results.get(gameId) || [];
    if (results.length === 0) return 50;
    return results.reduce((sum, r) => sum + (r.score / 10), 0) / results.length;
  }
  
  exportData(): string {
    return JSON.stringify({
      results: Object.fromEntries(this.results),
      profile: this.calculateCognitiveProfile(),
    });
  }
}
