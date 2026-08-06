import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';

// Types
export interface User {
  id: string;
  ageRange: '13-15' | '16-18' | '19-22';
  region: string;
  language: string;
  createdAt: string;
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
  logout: () => void;
  signup: (data: SignupData) => Promise<string>;
  loadProfile: () => Promise<void>;
  refreshStreak: () => void;
  recordSession: (session: Omit<Session, 'id'>) => Promise<void>;
  setActiveView: (view: AppState['activeView']) => void;
}

export interface SignupData {
  ageRange: User['ageRange'];
  region: string;
  language: string;
  pin: string;
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
          // Temporarily Mocking the Tauri invoke because we haven't implemented get_user in rust yet
          // const user = await invoke<User>('get_user', { userId });
          const user: User = {
            id: userId,
            ageRange: '16-18',
            region: 'Delhi',
            language: 'en',
            createdAt: new Date().toISOString()
          };
          
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

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        
        try {
          // Temporarily mock the tauri invoke because we are relying on old `create_user` from earlier mockup phase
          // const userId = await invoke<string>('create_user', {
          //   user: {
          //     age_range: data.ageRange,
          //     region: data.region,
          //     language: data.language,
          //   },
          // });
          
          const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
          
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
          // Temporarily mock getting the unified profile
          // const profile = await invoke<UnifiedProfile>('get_unified_profile', {
          //   userId: user.id,
          // });
          const profile: UnifiedProfile = {
            userId: user.id,
            generatedAt: new Date().toISOString(),
            personality: {
                bigFive: { openness: 60, conscientiousness: 70, extraversion: 50, agreeableness: 80, neuroticism: 40 },
                riasec: { realistic: 30, investigative: 40, artistic: 80, social: 70, enterprising: 20, conventional: 10 },
                emotional: { resilience: 60, empathy: 80, emotionalAwareness: 70, impulseControl: 60, socialIntuition: 75 }
            },
            cognition: {
                logicalReasoning: 60, verbalFluency: 70, spatialIntelligence: 50, creativeDivergence: 80, processingSpeed: 60, workingMemory: 65, learningStyle: 'visual'
            },
            archetype: {
                name: "The Dreamer", description: "Creative and empathetic", traits: ["Creative", "Empathetic"]
            },
            wellbeingScore: 78,
            strengths: ["Creativity", "Empathy"],
            growthAreas: ["Logic"]
          };
          
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
        
        // Temporarily mocked backend save
        // await invoke('save_session', { ... });
        
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
