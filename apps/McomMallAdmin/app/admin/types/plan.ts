export enum PlanTier {
  STANDARD = 'STANDARD',
  PRO = 'PRO',
  PRO_PLUS = 'PRO_PLUS',
}

export interface PlanTierLevel {
  id: string;
  name: PlanTier;
  sortOrder: number;
  durationDays: number | null;
  isCalendarYear: boolean;
}

export interface PlanPrice {
  id: string;
  planVariantId: string;
  currency: string;
  amount: number | string;
  stripePriceId: string | null;
  paypalPlanId: string | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface PlanQuota {
  maxListings: number;
  allowProductListing: boolean;
  allowServiceListing: boolean;
  maxProducts: number;
  maxServices: number;
  maxGiftCardTemplates: number;
  maxCouponTemplates: number;
  maxLoyaltyPrograms: number;
  maxImagesPerListing: number;
  featuredListingAllowance: number;
}

export interface PlanFeatureFlags {
  priorityInSearch: boolean;
  advancedAnalytics: boolean;
  dedicatedSupport: boolean;
  allowCustomBranding: boolean;
  allowGroupCreation: boolean;
}

export interface PlanVariantConfiguration {
  quotas: PlanQuota;
  featureFlags: PlanFeatureFlags;
  disabledNavIds?: string[];
}

export interface PlanVariant {
  id: string;
  planId: string;
  tierLevelId: string;
  tierLevel: PlanTierLevel;
  isActive: boolean;
  features: string[] | null;
  configuration: PlanVariantConfiguration;
  prices: PlanPrice[];
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  variants: PlanVariant[];
}

export interface CreatePlanVariantInput {
  tier: PlanTier;
  price: number;
  stripePriceId?: string;
  paypalPlanId?: string;
  features?: string[];
  configuration: PlanVariantConfiguration;
}

export interface CreatePlanInput {
  name: string;
  slug: string;
  description?: string;
  variants: CreatePlanVariantInput[];
}

export interface UpdatePlanInput {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePlanVariantInput {
  features?: string[];
  configuration?: PlanVariantConfiguration;
  isActive?: boolean;
}

export interface CreatePlanPriceInput {
  amount: number;
  currency?: string;
  stripePriceId?: string;
  paypalPlanId?: string;
}

/** Active (sellable) price of a variant, or null when none exists. */
export function getActivePrice(variant: PlanVariant): PlanPrice | null {
  const active = variant.prices?.find((price) => price.isActive);
  return active ?? variant.prices?.[0] ?? null;
}

export function getPriceAmount(price: PlanPrice | null): number {
  if (!price) return 0;
  return typeof price.amount === 'string'
    ? parseFloat(price.amount)
    : price.amount;
}

/** Human duration label driven by the tier level rule (leap-safe by backend). */
export function getVariantDurationLabel(variant: PlanVariant): string {
  const level = variant.tierLevel;
  if (!level) return '';
  if (level.isCalendarYear) return '1 year';
  if (typeof level.durationDays === 'number') return `${level.durationDays} days`;
  return '';
}

export function getTierLabel(tier: PlanTier): string {
  if (tier === PlanTier.PRO_PLUS) return 'Pro+';
  if (tier === PlanTier.PRO) return 'Pro';
  return 'Standard';
}
