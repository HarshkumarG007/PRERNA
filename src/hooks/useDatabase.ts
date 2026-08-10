import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Types matching Rust models
export interface NewUser {
  age_range: '13-15' | '16-18' | '19-22';
  region: string;
  language: string;
}

export interface User {
  id: string;
  created_at: string;
  age_range: string;
  region: string;
  language: string;
}

export interface AssessmentSession {
  id: string;
  user_id: string;
  session_type: 'life_quest' | 'skill_arena' | 'mood_mirror' | 'social_compass' | 'body_clock';
  started_at: string;
  completed_at?: string;
  raw_choices: string;
  derived_traits: string;
}

export interface TraitSnapshot {
  id: string;
  item_bank_version: string;
  big_five: {
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
  confidence_score: number;
}

export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invokeCommand = useCallback(async <T>(command: string, args?: unknown): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      return await invoke<T>(command, args as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // User operations
  const createUser = useCallback(async (user: NewUser): Promise<string | null> => {
    return invokeCommand<string>('create_user', { user });
  }, [invokeCommand]);

  const getUser = useCallback(async (userId: string): Promise<User | null> => {
    return invokeCommand<User>('get_user', { userId });
  }, [invokeCommand]);

  // Session operations
  const saveSession = useCallback(async (session: {
    session_type: string;
    raw_choices: string;
    derived_traits: string;
    disclosure_version: string;
    disclosure_shown_at: number;
  }): Promise<string | null> => {
    return invokeCommand<string>('save_session', { session });
  }, [invokeCommand]);

  const getUserSessions = useCallback(async (userId: string): Promise<AssessmentSession[] | null> => {
    return invokeCommand<AssessmentSession[]>('get_user_sessions', { userId });
  }, [invokeCommand]);

  // Trait operations
  const saveTraitSnapshot = useCallback(async (snapshot: {
    user_id: string;
    item_bank_version: string;
    big_five: TraitSnapshot['big_five'];
    riasec: TraitSnapshot['riasec'];
    multiple_intel: unknown;
    emotional_profile: unknown;
    confidence_score: number;
  }): Promise<string | null> => {
    return invokeCommand<string>('save_trait_snapshot', { snapshot });
  }, [invokeCommand]);

  const getLatestSnapshot = useCallback(async (userId: string): Promise<TraitSnapshot | null> => {
    return invokeCommand<TraitSnapshot>('get_latest_snapshot', { userId });
  }, [invokeCommand]);

  // Data export/delete
  const exportUserData = useCallback(async (userId: string): Promise<unknown | null> => {
    return invokeCommand('export_user_data', { userId });
  }, [invokeCommand]);

  const deleteUserData = useCallback(async (userId: string): Promise<boolean> => {
    const result = await invokeCommand<null>('delete_user_data', { userId });
    return result !== null;
  }, [invokeCommand]);

  const getHealthMetrics = useCallback(async (): Promise<unknown | null> => {
    return invokeCommand('get_health_metrics');
  }, [invokeCommand]);

  return {
    loading,
    error,
    createUser,
    getUser,
    saveSession,
    getUserSessions,
    saveTraitSnapshot,
    getLatestSnapshot,
    exportUserData,
    deleteUserData,
    getHealthMetrics,
  };
}
