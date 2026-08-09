/**
 * Parent Dashboard Permissions
 * Teen-controlled sharing with granular privacy
 */

import { UnifiedProfile } from '../synthesis/fusionEngine';

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
  private static STORAGE_KEY = 'prerna_parent_sharing';

  static getPreferences(userId: string): SharingPreferences {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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

  static updatePreferences(prefs: SharingPreferences): void {
    prefs.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
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
    const safe: ParentSafeProfile = {
      lastUpdated: fullProfile.generatedAt,
      teenName: 'Your Teen', // Anonymized
      conversationStarters: []
    };

    if (prefs.shares.wellbeingScore) {
      safe.wellbeing = {
        score: fullProfile.wellbeingScore,
        trend: 'stable', // Would calculate from history
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
      safe.checkInStreak = 5; // Would calculate from actual data
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
