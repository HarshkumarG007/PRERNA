import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store';

describe('Signup and Login Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      profile: null,
      sessions: [],
      todaySessions: [],
    });
  });

  it('can signup a new user and login immediately', async () => {
    const signupData = {
      username: 'testteen' + Date.now(),
      passwordInput: 'Secret123!',
      ageRange: '16-17' as any,
      region: 'Delhi',
      language: 'en',
      pin: '1234',
      name: 'Test Teen',
      gender: 'male' as const,
      dateOfBirth: '2008-05-15',
      role: 'teen' as const,
    };

    // Test signup with autoLogin = false (as AuthModal does)
    const userId = await useAppStore.getState().signup(signupData, false);
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');
    
    // Check state: should NOT be authenticated yet
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(useAppStore.getState().user).toBeNull();

    // Now test login(userId) (as step 4 or handleSkipMfa does)
    await useAppStore.getState().login(userId);

    // Check state: SHOULD be authenticated!
    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.id).toBe(userId);
    expect(state.user?.role).toBe('teen');
    expect(state.user?.hasCompletedQuestionnaire).toBe(false);
  });
});
