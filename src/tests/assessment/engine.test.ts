import { describe, it, expect, beforeEach } from 'vitest';
import {
  TransparentAssessmentEngine,
  GameSession,
  Scene,
  Choice
} from '../../assessment/engine';

describe('TransparentAssessmentEngine', () => {
  let session: GameSession;
  let engine: TransparentAssessmentEngine;

  const mockScene: Scene = {
    id: 's1',
    title: 'Test Scene',
    description: 'Test description',
    context: 'social',
    choices: []
  };

  const mockChoice: Choice = {
    id: 'c1',
    text: 'Test choice',
    traitMappings: [
      {
        trait: 'openness',
        dimension: 'big_five',
        weight: 1.0,
        confidence: 0.8
      }
    ]
  };

  beforeEach(() => {
    session = {
      sessionId: 'test-session',
      userId: 'test-user',
      questType: 'life_quest',
      scenes: [mockScene],
      responses: [],
      startTime: new Date()
    };
    engine = new TransparentAssessmentEngine(session);
  });

  it('calculates profile correctly for an optimal reaction time', () => {
    // 2000ms is optimal, authenticity weight = 1.0
    engine.recordResponse(mockScene, mockChoice, 2000);
    const profile = engine.calculateProfile();
    
    // With 1 response:
    // impact = weight (1.0) * conf (0.8) * auth (1.0) = 0.8
    // newConf = 0 + 0.8 = 0.8
    // newVal = (0 * 0 + 0.8 * 0.8) / 0.8 = 0.8
    // normalize(0.8) = 50 + 0.8 * 25 = 70
    expect(profile.bigFive.openness).toBeCloseTo(70);
  });

  it('applies a bonus for very fast responses', () => {
    // 1000ms is fast, authenticity weight = 1.0 + (1000 / 2000) * 0.2 = 1.1
    engine.recordResponse(mockScene, mockChoice, 1000);
    const profile = engine.calculateProfile();
    
    // impact = 1.0 * 0.8 * 1.1 = 0.88
    // newVal = 0.88
    // normalize(0.88) = 50 + 0.88 * 25 = 72
    expect(profile.bigFive.openness).toBeCloseTo(72);
  });

  it('applies a penalty for very slow responses', () => {
    // 11000ms is > maxTime (10000), auth weight = 0.5
    engine.recordResponse(mockScene, mockChoice, 11000);
    const profile = engine.calculateProfile();
    
    // impact = 1.0 * 0.8 * 0.5 = 0.4
    // newVal = 0.4
    // normalize(0.4) = 50 + 0.4 * 25 = 60
    expect(profile.bigFive.openness).toBeCloseTo(60);
  });

  it('detects high variance and penalizes decision_consistency', () => {
    // 3 responses with high variance
    engine.recordResponse(mockScene, mockChoice, 1000);
    engine.recordResponse(mockScene, mockChoice, 8000); // large jump
    engine.recordResponse(mockScene, mockChoice, 1000);

    const data = JSON.parse(engine.exportData());
    expect(data.traits.decision_consistency).toBeLessThan(1.0); // Penalty applied
  });
});
