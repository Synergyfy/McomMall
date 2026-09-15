export type PlanTierLevelName = 'STANDARD' | 'PRO' | 'PRO_PLUS';

export interface PlanTierLevel {
  id: string;
  name: PlanTierLevelName;
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

export interface PlanVariantConfiguration {
  quotas: {
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
  };
  featureFlags: {
    priorityInSearch: boolean;
    advancedAnalytics: boolean;
    dedicatedSupport: boolean;
    allowCustomBranding: boolean;
    allowGroupCreation: boolean;
  };
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  variants: PlanVariant[];
}

/** Currently sellable price of a variant (backend keeps exactly one active). */
export function getActivePrice(variant: PlanVariant): PlanPrice | null {
  const active = variant.prices?.find((price) => price.isActive);
  return active ?? variant.prices?.[0] ?? null;
}

export function getPriceAmount(price: PlanPrice | null): number {
  if (!price) return 0;
  const amount = Number(price.amount);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatPlanPrice(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

/** Duration label driven by the tier-level rule (90 days / 180 days / 1 year). */
export function getVariantDurationLabel(variant: PlanVariant): string {
  const level = variant.tierLevel;
  if (!level) return '';
  if (level.isCalendarYear) return '1 year';
  if (typeof level.durationDays === 'number') {
    return `${level.durationDays} days`;
  }
  return '';
}

export function getTierLabel(name: PlanTierLevelName): string {
  if (name === 'PRO_PLUS') return 'Pro+';
  if (name === 'PRO') return 'Pro';
  return 'Standard';
}

/** Variants in display order (Standard → Pro → Pro+), active first. */
export function getSellableVariants(plan: Plan): PlanVariant[] {
  return [...(plan.variants ?? [])]
    .filter((variant) => variant.isActive)
    .sort(
      (a, b) =>
        (a.tierLevel?.sortOrder ?? 99) - (b.tierLevel?.sortOrder ?? 99),
    );
}
