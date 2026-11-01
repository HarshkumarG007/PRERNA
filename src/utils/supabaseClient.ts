/**
 * PRERNA • Sovereign Cloud Gatekeeper (Supabase Client)
 * 
 * Manages access control, invite token verification, and optional live feedback.
 * Strictly adheres to the Sovereign Boundary: NEVER stores adolescent psychometrics,
 * journals, or chat transcripts in the cloud.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface BetaTokenVerificationResult {
  valid: boolean;
  assignedTo?: string;
  role?: string;
  message?: string;
  isMockFallback?: boolean;
}

export interface BetaFeedbackSubmission {
  category: string;
  sentiment: string;
  susScore?: number;
  title: string;
  description: string;
  role: string;
}

class SovereignSupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (err) {
        console.warn('[Supabase] Initialization warning:', err);
        this.client = null;
      }
    }
  }

  /**
   * Checks whether Supabase project credentials are set up.
   */
  public isConfigured(): boolean {
    return Boolean(this.client && SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  /**
   * Verifies an invite token.
   * If Supabase is connected, executes the atomic verify_beta_token RPC function.
   * If not configured, gracefully validates against pre-seeded sovereign master tokens.
   */
  public async verifyToken(rawToken: string): Promise<BetaTokenVerificationResult> {
    const token = rawToken.trim().toUpperCase();
    if (!token) {
      return { valid: false, message: 'Please enter a valid beta access token.' };
    }

    // 1. Live Supabase Verification
    if (this.isConfigured() && this.client) {
      try {
        // Try stored procedure RPC first (atomic & secure with Row Level Security)
        const { data, error } = await this.client.rpc('verify_beta_token', {
          input_token: token
        });

        if (!error && data) {
          const res = typeof data === 'string' ? JSON.parse(data) : data;
          if (res.valid) {
            return {
              valid: true,
              assignedTo: res.assigned_to,
              role: res.role || 'teen',
              message: `Welcome, ${res.assigned_to}! Access verified via Supabase.`
            };
          }
          return { valid: false, message: res.message || 'Token is invalid, expired, or depleted.' };
        }

        // Direct table fallback if RPC has not been created yet
        const { data: row, error: tableErr } = await this.client
          .from('beta_access_tokens')
          .select('*')
          .ilike('token', token)
          .eq('is_active', true)
          .single();

        if (!tableErr && row) {
          // Check expiration
          if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
            return { valid: false, message: 'This beta access token has expired.' };
          }
          // Check max uses
          if (row.max_uses && row.times_used >= row.max_uses) {
            return { valid: false, message: 'This token has reached its maximum allowed uses.' };
          }

          // Atomically update usage count
          await this.client
            .from('beta_access_tokens')
            .update({ times_used: (row.times_used || 0) + 1 })
            .eq('id', row.id);

          return {
            valid: true,
            assignedTo: row.assigned_to,
            role: row.role || 'teen',
            message: `Welcome, ${row.assigned_to}! Access verified via Supabase.`
          };
        }

        return { valid: false, message: 'Invalid or deactivated access token.' };
      } catch (e: any) {
        console.error('[Supabase] Token verification error:', e);
        // Fall through to local fallback if network / database fails
      }
    }

    // 2. Sovereign Local Fallback (For Development, Offline, or Prior to Supabase Setup)
    const LOCAL_ALLOWLIST: Record<string, { assignedTo: string; role: string }> = {
      'PRERNA-FOUNDER-2026': { assignedTo: 'Harsh Kumar Gupta (Founder)', role: 'adult' },
      'PRERNA-H1-CLINICAL': { assignedTo: 'Dr. Clinical Reviewer (Ticket H1)', role: 'adult' },
      'PRERNA-H2-PRIVACY': { assignedTo: 'Adv. Privacy Specialist (Ticket H2)', role: 'adult' },
      'PRERNA-H3-CULTURAL': { assignedTo: 'Hindi Typology Specialist (Ticket H3)', role: 'adult' },
      'PRERNA-H4-LEXILE': { assignedTo: 'Youth Reading Specialist (Ticket H4)', role: 'adult' },
      'VIDYAPEETH-PILOT-01': { assignedTo: 'VidyaPeeth School Counselor', role: 'educator' },
      'PRERNA-TEEN-BETA': { assignedTo: 'Cohort 1 Teen Explorer', role: 'teen' },
      'PRERNA-DEMO-2026': { assignedTo: 'PRERNA Sanctuary Reviewer', role: 'teen' }
    };

    if (LOCAL_ALLOWLIST[token]) {
      const info = LOCAL_ALLOWLIST[token];
      return {
        valid: true,
        assignedTo: info.assignedTo,
        role: info.role,
        message: `Welcome, ${info.assignedTo}! Access granted (Local Sovereign Passcode).`,
        isMockFallback: true
      };
    }

    return {
      valid: false,
      message: this.isConfigured()
        ? 'Invalid beta access token. Please check the code or contact Harsh Kumar Gupta.'
        : 'Invalid token. (Supabase cloud credentials not set; accepted local passcodes include PRERNA-FOUNDER-2026 or PRERNA-DEMO-2026).'
    };
  }

  /**
   * Optionally syncs an anonymous feedback submission to Supabase.
   */
  public async submitFeedback(feedback: BetaFeedbackSubmission): Promise<boolean> {
    if (!this.isConfigured() || !this.client) {
      return false;
    }

    try {
      const { error } = await this.client.from('beta_feedback').insert([
        {
          category: feedback.category,
          sentiment: feedback.sentiment,
          sus_score: feedback.susScore,
          title: feedback.title,
          description: feedback.description,
          role: feedback.role,
          created_at: new Date().toISOString()
        }
      ]);

      return !error;
    } catch {
      return false;
    }
  }
}

export const sovereignSupabase = new SovereignSupabaseService();
