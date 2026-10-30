import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PartnerPlanTier = 'free' | 'trial' | 'partner_pro_monthly' | 'partner_pro_annual' | 'partner_lifetime';
export type SchoolLicenseTier = 'pilot' | 'campus_annual' | 'district_annual';

export interface SubscriptionState {
  // Partners B2C Subscription
  partnerPlan: PartnerPlanTier;
  partnerTrialDaysRemaining: number;
  partnerActivatedAt: string | null;
  partnerExpiresAt: string | null;

  // School B2B Licensing
  schoolLicense: SchoolLicenseTier;
  schoolPilotDaysRemaining: number;
  schoolActivatedAt: string | null;
  schoolExpiresAt: string | null;

  // Actions
  upgradePartnerPlan: (tier: PartnerPlanTier) => void;
  cancelPartnerPlan: () => void;
  upgradeSchoolLicense: (tier: SchoolLicenseTier) => void;
  setDemoPartnerPlan: (tier: PartnerPlanTier) => void;
  setDemoSchoolLicense: (tier: SchoolLicenseTier) => void;

  // Selectors
  isPartnerPro: () => boolean;
  isSchoolLicensed: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Defaults: Start new partners on 7-Day Sacred Trial
      partnerPlan: 'trial',
      partnerTrialDaysRemaining: 7,
      partnerActivatedAt: new Date().toISOString(),
      partnerExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),

      // Defaults: Start new schools on 60-Day Campus Pilot
      schoolLicense: 'pilot',
      schoolPilotDaysRemaining: 60,
      schoolActivatedAt: new Date().toISOString(),
      schoolExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),

      upgradePartnerPlan: (tier: PartnerPlanTier) => {
        const now = new Date();
        let expiresAt: string | null = null;

        if (tier === 'partner_pro_monthly') {
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (tier === 'partner_pro_annual') {
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        } else if (tier === 'partner_lifetime') {
          expiresAt = null; // Forever
        } else if (tier === 'trial') {
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        set({
          partnerPlan: tier,
          partnerTrialDaysRemaining: tier === 'trial' ? 7 : 0,
          partnerActivatedAt: now.toISOString(),
          partnerExpiresAt: expiresAt,
        });
      },

      cancelPartnerPlan: () => {
        set({
          partnerPlan: 'free',
          partnerTrialDaysRemaining: 0,
          partnerExpiresAt: null,
        });
      },

      upgradeSchoolLicense: (tier: SchoolLicenseTier) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

        set({
          schoolLicense: tier,
          schoolPilotDaysRemaining: tier === 'pilot' ? 60 : 0,
          schoolActivatedAt: now.toISOString(),
          schoolExpiresAt: expiresAt,
        });
      },

      setDemoPartnerPlan: (tier: PartnerPlanTier) => {
        get().upgradePartnerPlan(tier);
      },

      setDemoSchoolLicense: (tier: SchoolLicenseTier) => {
        get().upgradeSchoolLicense(tier);
      },

      isPartnerPro: () => {
        const { partnerPlan, partnerExpiresAt } = get();
        if (partnerPlan === 'partner_lifetime') return true;
        if (partnerPlan === 'partner_pro_monthly' || partnerPlan === 'partner_pro_annual') {
          if (!partnerExpiresAt) return true;
          return new Date(partnerExpiresAt).getTime() > Date.now();
        }
        if (partnerPlan === 'trial') {
          if (!partnerExpiresAt) return true;
          return new Date(partnerExpiresAt).getTime() > Date.now();
        }
        return false;
      },

      isSchoolLicensed: () => {
        const { schoolLicense, schoolExpiresAt } = get();
        if (schoolLicense === 'campus_annual' || schoolLicense === 'district_annual') {
          if (!schoolExpiresAt) return true;
          return new Date(schoolExpiresAt).getTime() > Date.now();
        }
        if (schoolLicense === 'pilot') {
          if (!schoolExpiresAt) return true;
          return new Date(schoolExpiresAt).getTime() > Date.now();
        }
        return false;
      },
    }),
    {
      name: 'prerna_subscription_vault',
    }
  )
);

