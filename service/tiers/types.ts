export interface TierQuotas {
  maxActiveCampaigns: number;
  maxActiveRewards: number;
  maxRewardsPerCampaign: number;
  monthlyPointsAllowance: number;
  monthlyStampsAllowance: number;
  maxTeamMembers: number;
}

export interface TierFeatureFlags {
  canCreateCampaignFromScratch: boolean;
  canEditAdminTemplates: boolean;
  hasAccessToAdvancedAnalytics: boolean;
  hasAccessToCRM: boolean;
  canUpdateReward: boolean;
}

export interface TierConfiguration {
  quotas: TierQuotas;
  featureFlags: TierFeatureFlags;
  progressBonuses?: {
    active_campaign_bonus?: number;
  };
  pro?: {
    conditions: Record<string, number>;
    benefits: {
      quotas?: Partial<TierQuotas>;
      featureFlags?: Partial<TierFeatureFlags>;
      bonusPoints?: number;
      unlockNextTierPreview?: {
        percentNextTierPoints: number;
        additionalTeamMembers: number;
      };
    };
  };
  pro_plus?: {
    conditions: Record<string, number>;
    benefits: {
      quotas?: Partial<TierQuotas>;
      featureFlags?: Partial<TierFeatureFlags>;
      unlockNextTierPreview?: {
        percentNextTierPoints: number;
        additionalTeamMembers: number;
      };
    };
  };
  trial?: {
    quotas: Partial<TierQuotas>;
    featureFlags: Partial<TierFeatureFlags>;
  };
}

export interface Season {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export interface Tier {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  type: string; // e.g., 'standard'
  color_code: string;
  fixed_price: number;
  monthly_price: number;
  annual_price: number;
  quaterly_price: number;
  features: string[];
  status: string; // e.g., 'published'
  stripe_monthly_price_id: string;
  stripe_quarterly_price_id: string;
  stripe_annual_price_id: string;
  paypal_monthly_plan_id: string;
  paypal_quarterly_plan_id: string;
  paypal_annual_plan_id: string;
  qrCodeCount: number;
  configuration: TierConfiguration;
  season?: Season; // The example shows it, so it's likely present
}

// New API Interface matching the provided schema
export interface ApiTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  stripeMonthlyPriceId: string;
  stripeAnnualPriceId: string;
  paypalMonthlyPlanId: string;
  paypalAnnualPlanId: string;
  // Configuration structure might differ, but we'll try to use TierConfiguration or partial
  // For now, using any to avoid strict type conflicts during mapping if the structure differs significantly
  // detailed mapping will happen in the adapter.
  configuration: any;
  isActive: boolean;
}
