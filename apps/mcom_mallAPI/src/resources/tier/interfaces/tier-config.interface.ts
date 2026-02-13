export interface TierQuotas {
  maxListings: number; // Total listings (product + service) -1 for unlimited
  allowProductListing: boolean;
  allowServiceListing: boolean;
  maxProducts: number; // -1 for unlimited
  maxServices: number; // -1 for unlimited
  maxGiftCardTemplates: number; // -1 for unlimited
  maxCouponTemplates: number; // -1 for unlimited
  maxLoyaltyPrograms: number; // -1 for unlimited
  maxImagesPerListing: number;
  featuredListingAllowance: number;
}

export interface TierFeatureFlags {
  priorityInSearch: boolean;
  advancedAnalytics: boolean;
  dedicatedSupport: boolean;
  allowCustomBranding: boolean;
  allowGroupCreation: boolean;
}

export interface TierConfig {
  quotas: TierQuotas;
  featureFlags: TierFeatureFlags;
  trialDurationDays?: number; // Optional override for trial duration (default 30)
}
