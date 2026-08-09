/**
 * Parent Dashboard Permissions
 * Teen-controlled sharing with granular privacy
 */

import { UnifiedProfile } from '../synthesis/fusionEngine';
import { invoke } from '@tauri-apps/api/core';

export interface SharingPreferences {
  userId: string;
  lastUpdated: string;
  
  // What teen is willing to share
  shares: {
    wellbeingScore: boolean;      // Overall "happiness" metric only
    careerInterests: boolean;   // Top 3 career fields, no details
    strengths: boolean;         // Positive traits only
    dailyCheckIn: boolean;      // "Checked in today" status
    concerns: boolean;          // Only if teen opts in
  };
  
  // What requires explicit approval each time
  requiresApproval: {
    fullProfile: boolean;
    chatHistory: boolean;
    riskAlerts: boolean;
  };
}

export class ParentPermissionManager {
  static async getPreferences(userId: string): Promise<SharingPreferences> {
    try {
      const stored = await invoke<SharingPreferences>('get_sharing_preferences', { userId });
      if (stored) return stored;
    } catch (e) {
      console.warn("Failed to get preferences from backend, using defaults", e);
    }
    
    // Default: minimal sharing
    return {
      userId,
      lastUpdated: new Date().toISOString(),
      shares: {
        wellbeingScore: true,
        careerInterests: true,
        strengths: true,
        dailyCheckIn: true,
        concerns: false, // Opt-in only
      },
      requiresApproval: {
        fullProfile: true,
        chatHistory: true,
        riskAlerts: true,
      },
    };
  }

  static async updatePreferences(prefs: SharingPreferences): Promise<void> {
    prefs.lastUpdated = new Date().toISOString();
    try {
      await invoke('update_sharing_preferences', { preferences: prefs });
    } catch (e) {
      console.error("Failed to update preferences", e);
    }
  }

  static async requestApproval(): Promise<boolean> {
    // In production: Send notification to teen's app (IPC call to Tauri)
    // The parent CANNOT self-approve on the teen's behalf.
    alert("Request sent to your teen's device. Waiting for their approval...");
    return false;
  }

  static generateShareableData(
    fullProfile: UnifiedProfile,
    prefs: SharingPreferences
  ): ParentSafeProfile {
    // Note: In production, the backend firewall directly sends ParentSafeProfile.
    // This is a fallback purely for UI formatting if needed.
    const safe: ParentSafeProfile = {
      lastUpdated: fullProfile.generatedAt,
      teenName: 'Your Teen', // Anonymized
      conversationStarters: []
    };

    if (prefs.shares.wellbeingScore) {
      safe.wellbeing = {
        score: fullProfile.wellbeingScore,
        trend: 'unavailable' as any, // P0.5 Fix: Never fabricate trend
        interpretation: this.interpretWellbeing(fullProfile.wellbeingScore),
      };
    }

    if (prefs.shares.careerInterests) {
      safe.careerInterests = fullProfile.careerMatches
        .slice(0, 3)
        .map(c => ({
          field: c.field,
          role: c.role,
          why: c.whyFit[0], // Single, positive reason
        }));
    }

    if (prefs.shares.strengths) {
      safe.strengths = fullProfile.strengths.slice(0, 5);
    }

    if (prefs.shares.dailyCheckIn) {
      safe.lastActive = new Date().toISOString();
      safe.checkInStreak = undefined; // P0.5 Fix: Never fabricate streak
    }

    if (prefs.shares.concerns && fullProfile.riskFactors.length > 0) {
      safe.concerns = fullProfile.riskFactors.map(r => ({
        category: r.category,
        severity: r.severity,
        suggestedAction: r.recommendedIntervention,
      }));
    }

    // Generate conversation starters
    safe.conversationStarters = this.generateConversationStarters(fullProfile, prefs);

    return safe;
  }

  private static interpretWellbeing(score: number): string {
    if (score >= 80) return "Thriving - strong emotional foundation";
    if (score >= 60) return "Doing well - some areas to nurture";
    if (score >= 40) return "Managing - extra support could help";
    return "Struggling - needs attention and care";
  }

  private static generateConversationStarters(
    profile: UnifiedProfile,
    prefs: SharingPreferences
  ): string[] {
    const starters: string[] = [];

    if (prefs.shares.careerInterests && profile.careerMatches.length > 0) {
      const top = profile.careerMatches[0];
      starters.push(
        `I noticed you're interested in ${top.field}. Want to tell me more about what draws you to it?`
      );
    }

    if (prefs.shares.strengths && profile.strengths.length > 0) {
      const strength = profile.strengths[0];
      starters.push(
        `I've seen how you exhibit ${strength.toLowerCase()}. That's a real gift. How do you feel about it?`
      );
    }

    // Culturally appropriate for Indian parents
    starters.push(
      "I want to support you better. What's one thing I could do differently?",
      "I'm proud of how you're figuring things out. What's been on your mind lately?"
    );

    return starters;
  }
}

export interface ParentSafeProfile {
  lastUpdated: string;
  teenName: string;
  wellbeing?: {
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    interpretation: string;
  };
  careerInterests?: {
    field: string;
    role: string;
    why: string;
  }[];
  strengths?: string[];
  lastActive?: string;
  checkInStreak?: number;
  concerns?: {
    category: string;
    severity: string;
    suggestedAction: string;
  }[];
  bigFive?: Record<string, number>;
  riasec?: Record<string, number>;
  conversationStarters: string[];
}
