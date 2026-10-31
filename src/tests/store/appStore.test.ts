import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../../store';

// Mock Tauri invoke
vi.mock('../../utils/mockBackend', () => ({
  safeInvoke: vi.fn(async (cmd, args) => {
    if (cmd === 'get_user') {
      if (args.userId === 'valid-user') {
        return {
          id: 'valid-user',
          ageRange: '16-17',
          region: 'north',
          language: 'en',
          createdAt: new Date().toISOString()
        };
      }
      return null;
    }
    if (cmd === 'get_unified_profile') {
      return {
        userId: 'valid-user',
        generatedAt: new Date().toISOString(),
        personality: { bigFive: { openness: 80 } },
        cognition: { logicalReasoning: 75 }
      };
    }
    return null;
  })
}));

describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      sessions: [],
      todaySessions: [],
      activeView: 'home',
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: '',
        weeklyProgress: [false, false, false, false, false, false, false]
      }
    });
  });

  it('handles logout by clearing sensitive data', () => {
    useAppStore.setState({
      user: { id: 'test', ageRange: '16-17', region: 'north', language: 'en', createdAt: '' },
      isAuthenticated: true,
      profile: { userId: 'test' } as any
    });

    useAppStore.getState().logout();

    const state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.profile).toBeNull();
  });

  it('updates active view correctly', () => {
    useAppStore.getState().setActiveView('quest');
    expect(useAppStore.getState().activeView).toBe('quest');
  });

  it('refreshes streak correctly', () => {
    const today = new Date().toISOString();
    
    // Add a session from today
    useAppStore.setState({
      user: { id: 'test' } as any,
      sessions: [
        {
          id: 'sess1',
          type: 'life_quest',
          completedAt: today,
          metadata: {}
        }
      ]
    });

    useAppStore.getState().refreshStreak();
    
    const { streak } = useAppStore.getState();
    expect(streak.currentStreak).toBe(1);
    expect(streak.longestStreak).toBe(1);
    expect(streak.weeklyProgress).toContain(true); // Today should be true
  });

  it('revokes consent and logs out', async () => {
    useAppStore.setState({
      user: { id: 'test', ageRange: '16-17', region: 'north', language: 'en', createdAt: '' },
      isAuthenticated: true,
      profile: { userId: 'test' } as any
    });

    const { safeInvoke } = await import('../../utils/mockBackend');
    
    await useAppStore.getState().revokeConsent();

    expect(safeInvoke).toHaveBeenCalledWith('revoke_consent', { userId: 'test' });
    const state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('initializes with clean empty vitality and sleep state and seeds on demand', () => {
    useAppStore.setState({
      vitality: {
        heightCm: 162,
        weightKg: 52,
        waterGlassesToday: 0,
        lastWaterDate: new Date().toISOString().split('T')[0],
        dailyStepGoal: 8000,
      },
      sleepSessions: [],
      movementEntries: []
    });

    const state = useAppStore.getState();
    expect(state.sleepSessions).toEqual([]);
    expect(state.movementEntries).toEqual([]);
    expect(state.vitality.waterGlassesToday).toBe(0);

    state.seedDemoVitalityData();
    const updated = useAppStore.getState();
    expect(updated.sleepSessions.length).toBeGreaterThan(0);
    expect(updated.sleepSessions[0].id).toBe('sample_sleep_1');
    expect(updated.movementEntries[0].id).toBe('sample_move_1');
  });
});
