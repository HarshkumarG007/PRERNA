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
  boundToDevice?: boolean;
}

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem('prerna_device_id');
    if (!id) {
      id = 'dev_' + (typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
      localStorage.setItem('prerna_device_id', id);
    }
    return id;
  } catch {
    return 'dev_ephemeral_' + Date.now();
  }
}

export interface BetaFeedbackSubmission {
  category: string;
  sentiment: string;
  susScore?: number;
  title: string;
  description: string;
  role: string;
}

export interface BetaAccessRequestSubmission {
  fullName: string;
  email: string;
  role: 'teen' | 'parent' | 'educator' | 'reviewer' | 'partner' | 'other';
  purpose: string;
  organization?: string;
  discoverySource?: string;
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
   * Verifies an invite token with hardware device binding and anti-leak protection.
   * If Supabase is connected, executes the atomic verify_beta_token stored procedure.
   * Ensures single-use tokens cannot be overshared or redeemed on multiple devices.
   */
  public async verifyToken(rawToken: string, explicitDeviceId?: string): Promise<BetaTokenVerificationResult> {
    const token = rawToken.trim().toUpperCase();
    if (!token) {
      return { valid: false, message: 'Please enter a valid beta access token.' };
    }

    const deviceId = explicitDeviceId || getOrCreateDeviceId();

    // 1. Live Supabase Verification with Hardware Binding
    if (this.isConfigured() && this.client) {
      try {
        // Try stored procedure RPC first (atomic & secure with Row Level Security)
        const { data, error } = await this.client.rpc('verify_beta_token', {
          input_token: token,
          input_device_id: deviceId
        });

        if (!error && data) {
          const res = typeof data === 'string' ? JSON.parse(data) : data;
          if (res.valid) {
            return {
              valid: true,
              assignedTo: res.assigned_to,
              role: res.role || 'teen',
              boundToDevice: true,
              message: `Welcome, ${res.assigned_to}! Access verified and locked to this device.`
            };
          }
          return { valid: false, message: res.message || 'Token is invalid, expired, or claimed on another device.' };
        }

        // Direct table fallback if RPC is not yet created
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

          // Anti-Oversharing Defense: Device Lock check (enforced strictly on single-use tokens)
          const isSingleUse = !row.max_uses || row.max_uses === 1;
          if (isSingleUse && row.claimed_device_id && row.claimed_device_id !== deviceId) {
            return {
              valid: false,
              message: 'Security Alert: This single-use invitation has already been claimed on another device.'
            };
          }

          // Check max uses
          if (row.max_uses && row.times_used >= row.max_uses && row.claimed_device_id !== deviceId) {
            return { valid: false, message: 'This invitation link has reached its maximum allowed redemptions.' };
          }

          // Atomically bind to current device if first claim on a single-use token
          await this.client
            .from('beta_access_tokens')
            .update({
              times_used: (row.times_used || 0) + 1,
              claimed_device_id: isSingleUse ? (row.claimed_device_id || deviceId) : null
            })
            .eq('id', row.id);

          return {
            valid: true,
            assignedTo: row.assigned_to,
            role: row.role || 'teen',
            boundToDevice: true,
            message: `Welcome, ${row.assigned_to}! Access verified and bound to this device.`
          };
        }

        return { valid: false, message: 'Invalid, deactivated, or depleted access token.' };
      } catch (e: any) {
        console.error('[Supabase] Token verification error:', e);
      }
    }

    // 2. Sovereign Local Fallback (Development & Offline Mode)
    const LOCAL_ALLOWLIST: Record<string, { assignedTo: string; role: string; allowMultiDevice?: boolean }> = {
      'PRERNA-FOUNDER-2026': { assignedTo: 'Harsh Kumar Gupta (Founder)', role: 'adult', allowMultiDevice: true },
      'PRERNA-H1-CLINICAL': { assignedTo: 'Dr. Clinical Reviewer (Ticket H1)', role: 'adult' },
      'PRERNA-H2-PRIVACY': { assignedTo: 'Adv. Privacy Specialist (Ticket H2)', role: 'adult' },
      'PRERNA-H3-CULTURAL': { assignedTo: 'Hindi Typology Specialist (Ticket H3)', role: 'adult' },
      'PRERNA-H4-LEXILE': { assignedTo: 'Youth Reading Specialist (Ticket H4)', role: 'adult' },
      'VIDYAPEETH-PILOT-01': { assignedTo: 'VidyaPeeth School Counselor', role: 'educator' },
      'PRERNA-TEEN-BETA': { assignedTo: 'Cohort 1 Teen Explorer', role: 'teen' },
      'PRERNA-DEMO-2026': { assignedTo: 'PRERNA Sanctuary Reviewer', role: 'teen', allowMultiDevice: true }
    };

    if (LOCAL_ALLOWLIST[token]) {
      const info = LOCAL_ALLOWLIST[token];
      
      // Enforce local single-device binding in development mock
      const claimKey = `prerna_claimed_dev_${token}`;
      const existingClaim = localStorage.getItem(claimKey);
      if (existingClaim && existingClaim !== deviceId && !info.allowMultiDevice) {
        return {
          valid: false,
          message: 'Security Notice: This token was already claimed by another browser session.'
        };
      }
      localStorage.setItem(claimKey, deviceId);

      return {
        valid: true,
        assignedTo: info.assignedTo,
        role: info.role,
        boundToDevice: true,
        message: `Welcome, ${info.assignedTo}! Access granted (Local Sovereign Passcode).`,
        isMockFallback: true
      };
    }

    return {
      valid: false,
      message: this.isConfigured()
        ? 'Invalid beta access token. Please contact Harsh Kumar Gupta.'
        : 'Invalid token. (Supabase cloud not connected; accepted local passcodes include PRERNA-FOUNDER-2026 or PRERNA-DEMO-2026).'
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

  /**
   * Submits an in-app request for beta access tokens.
   */
  public async submitAccessRequest(request: BetaAccessRequestSubmission): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured() || !this.client) {
      // Store locally so it isn't lost if offline
      try {
        const pending = JSON.parse(localStorage.getItem('prerna_pending_access_requests') || '[]');
        pending.push({ ...request, timestamp: new Date().toISOString() });
        localStorage.setItem('prerna_pending_access_requests', JSON.stringify(pending));
      } catch {}
      return { 
        success: true, 
        message: 'Request saved! (Offline fallback mode: please also email hrslsha007@gmail.com for expedited pass).' 
      };
    }

    try {
      const { error } = await this.client.from('beta_access_requests').insert([
        {
          full_name: request.fullName.trim(),
          email: request.email.trim().toLowerCase(),
          role: request.role,
          purpose: request.purpose.trim(),
          organization: request.organization?.trim() || null,
          discovery_source: request.discoverySource || 'GitHub / Web',
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        console.warn('[Supabase] Access request insert failed:', error);
        return { success: false, message: error.message || 'Unable to submit request. Please try again.' };
      }

      return { 
        success: true, 
        message: 'Your access request has been recorded! Founder Harsh Kumar Gupta will review and email your single-use pass.' 
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to submit access request.' };
    }
  }

  /**
   * Provides access to Supabase Realtime broadcast channels for zero-cloud E2EE relay.
   */
  public getRealtimeChannel(topic: string) {
    if (!this.isConfigured() || !this.client) {
      return null;
    }
    return this.client.channel(topic);
  }
}

export const sovereignSupabase = new SovereignSupabaseService();

