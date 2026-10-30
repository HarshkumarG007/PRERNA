import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeInvoke as invoke } from '../utils/mockBackend';
import { SixteenTypeResult, deriveSixteenType } from '../engine/assessment/sixteenPersonalities';
import { GrowthJournalEntry, MitigationStrategy } from '../engine/growth/selfEvolutionEngine';
import { TrackedNeedItem } from '../engine/growth/maslowNeedsEngine';

// Types
export interface User {
  id: string;
  ageRange: '13-15' | '16-17' | '18+';
  region: string;
  language: string;
  role?: 'teen' | 'parent' | 'educator';
  createdAt: string;
  // Rich profile fields
  name?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  dateOfBirth?: string; // ISO date string
  country?: string;
  state?: string;
  city?: string;
  email?: string;
  phone?: string;
  hasCompletedQuestionnaire?: boolean;
}

export interface UnifiedProfile {
  userId: string;
  generatedAt: string;
  itemBankVersion?: string;
  personality: {
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    riasec: {
      realistic: number;
      investigative: number;
      artistic: number;
      social: number;
      enterprising: number;
      conventional: number;
    };
    emotional: {
      resilience: number;
      empathy: number;
      emotionalAwareness: number;
      impulseControl: number;
      socialIntuition: number;
    };
  };
  cognition: {
    logicalReasoning: number;
    verbalFluency: number;
    spatialIntelligence: number;
    creativeDivergence: number;
    processingSpeed: number;
    workingMemory: number;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  };
  archetype: {
    name: string;
    description: string;
    traits: string[];
    sixteenType?: SixteenTypeResult;
  };
  sixteenType?: SixteenTypeResult;
  wellbeingScore: number;
  strengths: string[];
  growthAreas: string[];
  topCareer?: { role: string };
  llmSelfDiscoveryReport?: string;
}

export interface Session {
  id: string;
  type: 'life_quest' | 'skill_arena' | 'mood_mirror' | 'social_compass' | 'ai_chat';
  completedAt: string;
  score?: number;
  metadata: Record<string, unknown>;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string;
  weeklyProgress: boolean[]; // 7 days
}

export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Profile
  profile: UnifiedProfile | null;
  profileLoading: boolean;
  
  // Sessions
  sessions: Session[];
  todaySessions: Session[];
  
  // Streaks
  streak: StreakData;
  
  // UI State
  activeView: 'home' | 'quest' | 'arena' | 'mentor' | 'profile' | 'parent';
  sidebarOpen: boolean;
  
  // Actions
  login: (userId: string) => Promise<void>;
  loginWithCredentials: (username: string, passwordInput: string) => Promise<string | { mfaRequired: true, userId: string }>;
  loginWithPin: (userId: string, pin: string) => Promise<string>;
  completeQuestionnaire: () => Promise<void>;
  logout: () => void;
  updateRole: (role: 'teen' | 'parent' | 'educator') => void;
  updateProfile: (profile: Partial<UnifiedProfile>) => void;
  signup: (data: SignupData) => Promise<string>;
  loadProfile: () => Promise<void>;
  refreshStreak: () => void;
  recordSession: (session: Omit<Session, 'id'>) => Promise<void>;
  setActiveView: (view: AppState['activeView']) => void;
  revokeConsent: () => Promise<void>;

  // Self-Evolution & Growth Journal (DPDP Act strictly local on-device)
  journalEntries: GrowthJournalEntry[];
  completedMitigations: Record<string, number>;
  customMitigations: MitigationStrategy[];
  addJournalEntry: (entry: Omit<GrowthJournalEntry, 'id' | 'createdAt'>) => void;
  deleteJournalEntry: (id: string) => void;
  toggleMitigation: (strategyId: string) => void;
  addCustomMitigation: (strategy: Omit<MitigationStrategy, 'id' | 'isCustom'>) => void;
  deleteCustomMitigation: (id: string) => void;

  // Maslow's Needs & Desires Tracker (DPDP Act local storage only)
  trackedNeeds: TrackedNeedItem[];
  addTrackedNeed: (item: Omit<TrackedNeedItem, 'id' | 'createdAt'>) => void;
  updateTrackedNeedStatus: (id: string, status: TrackedNeedItem['status'], userNotes?: string) => void;
  deleteTrackedNeed: (id: string) => void;

  // Kaya Kalpa: Physical Vitality, Circadian Rhythm & Sleep Sanctuary (DPDP Act 100% on-device)
  vitality: VitalityProfile;
  sleepSessions: SleepSession[];
  movementEntries: MovementEntry[];
  updateVitalityProfile: (data: Partial<VitalityProfile>) => void;
  logWaterGlass: () => void;
  resetWaterToday: () => void;
  logSleepSession: (session: Omit<SleepSession, 'id' | 'createdAt'>) => void;
  deleteSleepSession: (id: string) => void;
  logMovementEntry: (entry: Omit<MovementEntry, 'id'>) => void;
}

export interface VitalityProfile {
  heightCm?: number;
  weightKg?: number;
  lastUpdated?: string;
  waterGlassesToday: number;
  lastWaterDate: string; // YYYY-MM-DD
  dailyStepGoal: number;
}

export interface SleepSession {
  id: string;
  bedtime: string; // ISO string
  wakeTime: string; // ISO string
  durationMinutes: number;
  cyclesCompleted: number; // Math.floor(durationMinutes / 90)
  qualityRating: 1 | 2 | 3 | 4 | 5; // 1: Drained, 3: Fair, 5: Radiant
  notes?: string;
  createdAt: string;
}

export interface MovementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  activeMinutes: number;
  activityType: 'walk' | 'run' | 'yoga' | 'sports' | 'dance' | 'other';
  heartRateBpm?: number;
  notes?: string;
}

export interface SignupData {
  username: string;
  passwordInput: string;
  ageRange: User['ageRange'];
  region: string;
  language: string;
  pin: string;
  role?: User['role'];
  // Rich profile fields
  name?: string;
  gender?: User['gender'];
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  email?: string;
  phone?: string;
}

// Create store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      profile: null,
      profileLoading: false,
      sessions: [],
      todaySessions: [],
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: '',
        weeklyProgress: [false, false, false, false, false, false, false],
      },
      activeView: 'home',
      sidebarOpen: false,
      journalEntries: [],
      completedMitigations: {},
      customMitigations: [],
      trackedNeeds: [],
      vitality: {
        heightCm: 162,
        weightKg: 52,
        waterGlassesToday: 5,
        lastWaterDate: new Date().toISOString().split('T')[0],
        dailyStepGoal: 8000,
      },
      sleepSessions: [
        {
          id: 'sample_sleep_1',
          bedtime: new Date(Date.now() - 28800000).toISOString(),
          wakeTime: new Date(Date.now() - 1800000).toISOString(),
          durationMinutes: 450,
          cyclesCompleted: 5,
          qualityRating: 5,
          notes: 'Slept deeply after 432 Hz Theta lullaby',
          createdAt: new Date().toISOString(),
        }
      ],
      movementEntries: [
        {
          id: 'sample_move_1',
          date: new Date().toISOString().split('T')[0],
          steps: 6420,
          activeMinutes: 35,
          activityType: 'yoga',
          heartRateBpm: 72,
          notes: 'Surya Namaskar & evening stroll'
        }
      ],

      // Actions
      login: async (userId: string) => {
        set({ isLoading: true });
        
        try {
          let user: any = null;
          try {
            user = await invoke<any>('resume_session', { userId });
          } catch {
            user = await invoke<any>('get_user', { userId });
          }
          
          if (user) {
            const savedRole = (localStorage.getItem('prerna_user_role') || undefined) as User['role'];
            const normalizedUser: User = {
              ...user,
              role: user.role || savedRole,
              ageRange: user.ageRange || user.age_range,
              createdAt: user.createdAt || user.created_at,
              hasCompletedQuestionnaire: user.hasCompletedQuestionnaire ?? user.has_completed_questionnaire ?? false,
              dateOfBirth: user.dateOfBirth || user.date_of_birth,
            };

            set({ 
              user: normalizedUser,
              isAuthenticated: true,
              isLoading: false 
            });
            
            // Load associated data
            await get().loadProfile();
            get().refreshStreak();
          } else {
            throw new Error('User not found');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithPin: async (userId: string, pin: string) => {
        set({ isLoading: true });
        try {
          const user = await invoke<any>('authenticate_pin', { userId, pin });
          if (user) {
            const savedRole = (localStorage.getItem('prerna_user_role') || undefined) as User['role'];
            const normalizedUser: User = {
              ...user,
              role: user.role || savedRole,
              ageRange: user.ageRange || user.age_range,
              createdAt: user.createdAt || user.created_at,
              hasCompletedQuestionnaire: user.hasCompletedQuestionnaire ?? user.has_completed_questionnaire ?? false,
              dateOfBirth: user.dateOfBirth || user.date_of_birth,
            };

            localStorage.setItem('prerna_last_user', normalizedUser.id);
            set({
              user: normalizedUser,
              isAuthenticated: true,
              isLoading: false
            });
            await get().loadProfile();
            get().refreshStreak();
            return normalizedUser.id;
          } else {
            throw new Error('Invalid PIN');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      completeQuestionnaire: async () => {
        const { user } = get();
        if (!user) return;
        try {
          await invoke('complete_questionnaire', { userId: user.id });
          set({
            user: { ...user, hasCompletedQuestionnaire: true }
          });
        } catch (e) {
          console.error("Failed to mark questionnaire completed on backend:", e);
          set({
            user: { ...user, hasCompletedQuestionnaire: true }
          });
        }
      },

      loginWithCredentials: async (username: string, passwordInput: string) => {
        set({ isLoading: true });
        
        try {
          const response = await invoke<any>('authenticate_user', { 
            username, 
            passwordInput 
          });
          
          if (response) {
            if (response.mfaRequired) {
              set({ isLoading: false });
              return { mfaRequired: true, userId: response.userId };
            }
            localStorage.setItem('prerna_last_user', response.id);
            await get().login(response.id);
            return response.id;
          } else {
            throw new Error('Invalid username or password');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear sensitive data
        set({
          user: null,
          isAuthenticated: false,
          profile: null,
          sessions: [],
          todaySessions: [],
        });
        
        // Clear last user and role from localStorage
        localStorage.removeItem('prerna_last_user');
        localStorage.removeItem('prerna_user_role');
        localStorage.removeItem('prerna_parent_linked');

        // Invoke backend logout to clear active session and conversation history
        invoke('logout').catch(() => {});
      },

      updateRole: (role) => {
        const { user } = get();
        if (role) {
          localStorage.setItem('prerna_user_role', role);
        } else {
          localStorage.removeItem('prerna_user_role');
        }
        if (user) {
          invoke('update_user_role', { userId: user.id, role }).catch(() => {});
        }
        set((state) => ({
          user: state.user ? { ...state.user, role } : null
        }));
      },

      updateProfile: (newProfile) => {
        set((state) => {
          const merged = state.profile ? { ...state.profile, ...newProfile } : (newProfile as UnifiedProfile);
          if (merged?.personality?.bigFive && !merged.sixteenType) {
            try {
              merged.sixteenType = deriveSixteenType(merged.personality.bigFive);
            } catch (e) {
              console.warn("Could not derive 16 personality type:", e);
            }
          }
          return { profile: merged };
        });
      },

      revokeConsent: async () => {
        const { user } = get();
        if (user) {
          try {
            await invoke('revoke_consent', { userId: user.id });
          } catch (e) {
            console.error("Failed to revoke consent on backend:", e);
          }
        }
        get().logout();
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        
        try {
          const userRole = data.role || 'teen';
          const userId = await invoke<string>('create_user', {
            user: {
              username: data.username,
              password_hash: data.passwordInput, // Will be hashed in backend
              age_range: data.ageRange,
              region: data.region || data.state || 'India',
              language: data.language || 'en',
              role: userRole,
              pin: data.pin || null,
              name: data.name || null,
              gender: data.gender || null,
              date_of_birth: data.dateOfBirth || null,
            },
          });
          
          // Remember last authenticated user ID & role
          localStorage.setItem('prerna_last_user', userId);
          localStorage.setItem('prerna_user_role', userRole);
          
          // Auto-login (create_user already set session.set_authenticated on backend)
          await get().login(userId);
          
          return userId;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loadProfile: async () => {
        const { user } = get();
        if (!user) return;
        
        set({ profileLoading: true });
        
        try {
          const profile = await invoke<UnifiedProfile>('get_unified_profile', {
            userId: user.id,
          });
          
          if (profile) {
            if (profile.personality?.bigFive && !profile.sixteenType) {
              try {
                profile.sixteenType = deriveSixteenType(profile.personality.bigFive);
              } catch {}
            }
            set({ profile, profileLoading: false });
          }
        } catch (error) {
          // Profile might not exist yet (new user)
          set({ profileLoading: false });
        }
      },

      refreshStreak: () => {
        const { sessions, user } = get();
        if (!user) return;
        
        // Calculate streak from session history
        const today = new Date().toISOString().split('T')[0];
        const lastSession = sessions[0];
        
        let currentStreak = 0;
        let lastCheckIn = '';
        
        if (lastSession) {
          const lastDate = lastSession.completedAt.split('T')[0];
          const diffDays = Math.floor(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (diffDays <= 1) {
            currentStreak = diffDays === 0 ? 1 : 2; // Simplified logic
            lastCheckIn = lastDate;
          }
        }
        
        // Build weekly progress
        const weeklyProgress = Array(7).fill(false);
        const todayIdx = new Date().getDay();
        
        sessions.slice(0, 7).forEach(session => {
          const sessionDate = new Date(session.completedAt);
          const daysAgo = Math.floor(
            (new Date().getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysAgo < 7) {
            const idx = (todayIdx - daysAgo + 7) % 7;
            weeklyProgress[idx] = true;
          }
        });
        
        set({
          streak: {
            currentStreak: currentStreak > 0 ? currentStreak : 1, // Start with at least 1 for newly logged in users
            longestStreak: Math.max(currentStreak, get().streak.longestStreak, 1),
            lastCheckIn,
            weeklyProgress,
          },
        });
      },

      recordSession: async (sessionData) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');
        
        const session: Session = {
          ...sessionData,
          id: crypto.randomUUID(),
        };

        const disclosureVersion = (sessionData.metadata?.disclosure_version as string) || '1.0';
        const disclosureShownAt = (sessionData.metadata?.disclosure_shown_at as number) || Date.now();
        
        await invoke('save_session', {
          session: {
            session_type: session.type,
            raw_choices: JSON.stringify(session.metadata),
            derived_traits: JSON.stringify(session.metadata?.derived_traits || (session.score ? { score: session.score } : {})),
            disclosure_version: disclosureVersion,
            disclosure_shown_at: disclosureShownAt,
          }
        });
        
        // Update local state
        set(state => ({
          sessions: [session, ...state.sessions],
          todaySessions: session.type !== 'ai_chat' 
            ? [session, ...state.todaySessions]
            : state.todaySessions,
        }));
        
        // Refresh streak if applicable
        if (['life_quest', 'skill_arena'].includes(session.type)) {
          get().refreshStreak();
        }
      },

      setActiveView: (view) => set({ activeView: view }),

      addJournalEntry: (entry) => {
        const newEntry: GrowthJournalEntry = {
          ...entry,
          id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          journalEntries: [newEntry, ...state.journalEntries]
        }));
      },

      deleteJournalEntry: (id) => {
        set(state => ({
          journalEntries: state.journalEntries.filter(e => e.id !== id)
        }));
      },

      toggleMitigation: (strategyId) => {
        set(state => ({
          completedMitigations: {
            ...state.completedMitigations,
            [strategyId]: (state.completedMitigations[strategyId] || 0) + 1,
          }
        }));
      },

      addCustomMitigation: (strategyData) => {
        const custom: MitigationStrategy = {
          ...strategyData,
          id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isCustom: true,
        };
        set(state => ({
          customMitigations: [custom, ...state.customMitigations]
        }));
      },

      deleteCustomMitigation: (id) => {
        set(state => ({
          customMitigations: state.customMitigations.filter(s => s.id !== id)
        }));
      },

      addTrackedNeed: (itemData) => {
        const item: TrackedNeedItem = {
          ...itemData,
          id: `need_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          trackedNeeds: [item, ...state.trackedNeeds]
        }));
      },

      updateTrackedNeedStatus: (id, status, userNotes) => {
        set(state => ({
          trackedNeeds: state.trackedNeeds.map(item =>
            item.id === id
              ? { ...item, status, userNotes: userNotes !== undefined ? userNotes : item.userNotes }
              : item
          )
        }));
      },

      deleteTrackedNeed: (id) => {
        set(state => ({
          trackedNeeds: state.trackedNeeds.filter(item => item.id !== id)
        }));
      },

      // Kaya Kalpa Vitality, Sleep & Movement Actions
      updateVitalityProfile: (data) => {
        set(state => ({
          vitality: {
            ...state.vitality,
            ...data,
            lastUpdated: new Date().toISOString(),
          }
        }));
      },

      logWaterGlass: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        set(state => {
          const isSameDay = state.vitality.lastWaterDate === todayStr;
          const currentCount = isSameDay ? state.vitality.waterGlassesToday : 0;
          return {
            vitality: {
              ...state.vitality,
              waterGlassesToday: currentCount + 1,
              lastWaterDate: todayStr,
            }
          };
        });
      },

      resetWaterToday: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        set(state => ({
          vitality: {
            ...state.vitality,
            waterGlassesToday: 0,
            lastWaterDate: todayStr,
          }
        }));
      },

      logSleepSession: (sessionData) => {
        const session: SleepSession = {
          ...sessionData,
          id: `sleep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          sleepSessions: [session, ...state.sleepSessions]
        }));
      },

      deleteSleepSession: (id) => {
        set(state => ({
          sleepSessions: state.sleepSessions.filter(s => s.id !== id)
        }));
      },

      logMovementEntry: (entryData) => {
        const entry: MovementEntry = {
          ...entryData,
          id: `move_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        set(state => ({
          movementEntries: [entry, ...state.movementEntries]
        }));
      },
    }),
    {
      name: 'prerna-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive UI, streak preferences, and private on-device growth data
      partialize: (state) => ({
        streak: state.streak,
        activeView: state.activeView,
        journalEntries: state.journalEntries,
        completedMitigations: state.completedMitigations,
        customMitigations: state.customMitigations,
        trackedNeeds: state.trackedNeeds,
        vitality: state.vitality,
        sleepSessions: state.sleepSessions,
        movementEntries: state.movementEntries,
      }),
    }
  )
);

// Selectors for common data access
export const useUser = () => useAppStore(state => state.user);
export const useProfile = () => useAppStore(state => state.profile);
export const useStreak = () => useAppStore(state => state.streak);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const useTodaySessions = () => useAppStore(state => state.todaySessions);
export const useJournalEntries = () => useAppStore(state => state.journalEntries);
export const useCompletedMitigations = () => useAppStore(state => state.completedMitigations);
export const useCustomMitigations = () => useAppStore(state => state.customMitigations);
export const useTrackedNeeds = () => useAppStore(state => state.trackedNeeds);
export const useVitality = () => useAppStore(state => state.vitality);
export const useSleepSessions = () => useAppStore(state => state.sleepSessions);
export const useMovementEntries = () => useAppStore(state => state.movementEntries);
