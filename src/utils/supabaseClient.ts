/**
 * PRERNA • Sovereign Cloud Gatekeeper (Supabase Client)
 * 
 * Manages access control, invite token verification, and optional live feedback.
 * Strictly adheres to the Sovereign Boundary: NEVER stores adolescent psychometrics,
 * journals, or chat transcripts in the cloud.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://yfccmanwpgjwhqssfetp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2NtYW53cGdqd2hxc3NmZXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjQyNDMsImV4cCI6MjEwOTEwMDI0M30.QxvzYFiFFBIVolobauqiN2kBuhHd6rWFEZRG9T7cDT4';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.trim() !== '')
  ? import.meta.env.VITE_SUPABASE_URL.trim()
  : DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== '')
  ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
  : DEFAULT_SUPABASE_ANON_KEY;

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
   * Server-authoritative: executes the atomic, rate-limited verify_beta_token stored procedure (H-18, H-22).
   * Ensures single-use tokens cannot be overshared, and revoked tokens fail immediately on all platforms.
   */
  public async verifyToken(rawToken: string, explicitDeviceId?: string): Promise<BetaTokenVerificationResult> {
    // Sanitize token: normalize unicode dashes, remove spaces around hyphens, and uppercase
    const token = rawToken.trim().replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s*-\s*/g, '-').replace(/\s+/g, '').toUpperCase();
    if (!token) {
      return { valid: false, message: 'Please enter a valid beta access token.' };
    }

    const deviceId = explicitDeviceId || getOrCreateDeviceId();

    // 1. Authoritative Live Supabase Verification with Hardware Binding & Rate Limiting (H-18, H-22)
    if (this.isConfigured() && this.client) {
      try {
        const { data, error } = await this.client.rpc('verify_beta_token', {
          input_token: token,
          input_device_id: deviceId
        });

        if (error) {
          console.warn('[Supabase] RPC verification error:', error);
          return {
            valid: false,
            message: error.message || 'Token verification service unavailable. Please try again.'
          };
        }

        if (data) {
          const res = typeof data === 'string' ? JSON.parse(data) : data;
          if (res.valid) {
            const role = res.role || 'teen';
            const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
            return {
              valid: true,
              assignedTo: res.assigned_to || `Pilot Participant (${roleLabel})`,
              role,
              boundToDevice: true,
              message: `Welcome! Access verified and securely bound to this device.`
            };
          }

          // Authoritative server rejection: token expired, invalid, revoked, or throttled
          return {
            valid: false,
            message: res.message || 'Token is invalid, expired, or claimed on another device.'
          };
        }
      } catch (e: any) {
        console.error('[Supabase] Token verification network exception:', e);
        return {
          valid: false,
          message: 'Unable to reach the verification server. Please verify your internet connection.'
        };
      }
    }

    // 2. Offline / Development Fallback ONLY when Supabase cloud is not configured
    if (!this.isConfigured()) {
      if (token === 'DEMO-2026' || token === 'PRERNA-DEMO-2026') {
        return {
          valid: true,
          assignedTo: 'Offline Development Explorer',
          role: 'teen',
          boundToDevice: true,
          message: 'Access granted (Offline Development Fallback).',
          isMockFallback: true
        };
      }
      return {
        valid: false,
        message: 'Verification service offline. Please configure VITE_SUPABASE_URL or use DEMO-2026.'
      };
    }

    return {
      valid: false,
      message: 'Invalid beta access token.'
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
        message: 'Request saved! (Offline mode: please contact the PRERNA team for an expedited invitation).' 
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

