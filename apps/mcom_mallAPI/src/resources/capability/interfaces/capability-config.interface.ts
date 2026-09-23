export interface CapabilityQuotas {
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

export interface CapabilityFeatureFlags {
  priorityInSearch: boolean;
  advancedAnalytics: boolean;
  dedicatedSupport: boolean;
  allowCustomBranding: boolean;
  allowGroupCreation: boolean;
}

export interface CapabilityConfig {
  quotas: CapabilityQuotas;
  featureFlags: CapabilityFeatureFlags;
  trialDurationDays?: number;
}

// Backwards-compatible aliases
export type TierQuotas = CapabilityQuotas;
export type TierFeatureFlags = CapabilityFeatureFlags;
export type TierConfig = CapabilityConfig;
