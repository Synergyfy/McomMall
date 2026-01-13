export interface Quotas {
  maxListings: number;
  maxProducts: number;
  maxServices: number;
  maxCouponTemplates: number;
  maxLoyaltyPrograms: number;
  allowProductListing: boolean;
  allowServiceListing: boolean;
  maxImagesPerListing: number;
  maxGiftCardTemplates: number;
  featuredListingAllowance: number;
}

export interface FeatureFlags {
  dedicatedSupport: boolean;
  priorityInSearch: boolean;
  advancedAnalytics: boolean;
  allowGroupCreation: boolean;
  allowCustomBranding: boolean;
}

export interface TierConfiguration {
  quotas: Quotas;
  featureFlags: FeatureFlags;
}

export interface Tier {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string | null;
  monthlyPrice: string | number; // API example shows string "10.00" but schema example shows number 29.99. Handling both.
  annualPrice: string | number;
  stripeMonthlyPriceId: string | null;
  stripeAnnualPriceId: string | null;
  paypalMonthlyPlanId: string | null;
  paypalAnnualPlanId: string | null;
  configuration: TierConfiguration;
  isActive: boolean;
}
