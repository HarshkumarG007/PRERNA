import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeInvoke as invoke } from '../utils/mockBackend';

// Types
export interface User {
  id: string;
  ageRange: '13-15' | '16-18' | '19-22';
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
  };
  wellbeingScore: number;
  strengths: string[];
  growthAreas: string[];
  topCareer?: { role: string };
  llmSelfDiscoveryReport?: string;
}

export interface Session {
  id: string;
  type: 'life_quest' | 'skill_arena' | 'mood_mirror' | 'ai_chat';
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
  logout: () => void;
  updateRole: (role: 'teen' | 'parent' | 'educator') => void;
  updateProfile: (profile: Partial<UnifiedProfile>) => void;
  signup: (data: SignupData) => Promise<string>;
  loadProfile: () => Promise<void>;
  refreshStreak: () => void;
  recordSession: (session: Omit<Session, 'id'>) => Promise<void>;
  setActiveView: (view: AppState['activeView']) => void;
  revokeConsent: () => Promise<void>;
}

export interface SignupData {
  username: string;
  passwordInput: string;
  ageRange: User['ageRange'];
  region: string;
  language: string;
  pin: string;
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

      // Actions
      login: async (userId: string) => {
        set({ isLoading: true });
        
        try {
          const user = await invoke<User>('get_user', { userId });
          
          if (user) {
            set({ 
              user,
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
        
        // Clear last user from localStorage
        localStorage.removeItem('prerna_last_user');
      },

      updateRole: (role) => {
        set((state) => ({
          user: state.user ? { ...state.user, role } : null
        }));
      },

      updateProfile: (newProfile) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...newProfile } : (newProfile as UnifiedProfile)
        }));
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
          const userId = await invoke<string>('create_user', {
            user: {
              username: data.username,
              password_hash: data.passwordInput, // Will be hashed in backend
              age_range: data.ageRange,
              region: data.region,
              language: data.language,
            },
          });
          
          // Store PIN locally (hashed in production)
          localStorage.setItem(`prerna_pin_${userId}`, data.pin);
          localStorage.setItem('prerna_last_user', userId);
          
          // Auto-login
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
        
        await invoke('save_session', {
          session: {
            user_id: user.id,
            session_type: session.type,
            raw_choices: JSON.stringify(session.metadata),
            derived_traits: JSON.stringify(session.score ? { score: session.score } : {})
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
    }),
    {
      name: 'prerna-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        streak: state.streak,
        activeView: state.activeView,
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
