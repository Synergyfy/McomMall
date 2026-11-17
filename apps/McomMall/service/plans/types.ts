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

export function formatQuotaValue(value: number | undefined): string {
  if (value === -1) return 'Unlimited';
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return String(value);
}

export interface PlanQuotaFeature {
  label: string;
  value: string;
}

/** Quota rows shown on public plan cards and comparison tables. */
export function getPlanQuotaFeatures(
  variant: PlanVariant,
): PlanQuotaFeature[] {
  const quotas = variant.configuration?.quotas;
  if (!quotas) return [];

  return [
    {
      label: 'Products',
      value: quotas.allowProductListing
        ? formatQuotaValue(quotas.maxProducts)
        : 'Not included',
    },
    {
      label: 'Services',
      value: quotas.allowServiceListing
        ? formatQuotaValue(quotas.maxServices)
        : 'Not included',
    },
    {
      label: 'Images per listing',
      value: formatQuotaValue(quotas.maxImagesPerListing),
    },
    {
      label: 'Gift card templates',
      value: formatQuotaValue(quotas.maxGiftCardTemplates),
    },
    {
      label: 'Coupon templates',
      value: formatQuotaValue(quotas.maxCouponTemplates),
    },
    {
      label: 'Loyalty programs',
      value: formatQuotaValue(quotas.maxLoyaltyPrograms),
    },
    {
      label: 'Featured slots',
      value: formatQuotaValue(quotas.featuredListingAllowance),
    },
  ];
}

export const PLAN_FEATURE_FLAGS: Array<{
  key: keyof PlanVariantConfiguration['featureFlags'];
  label: string;
}> = [
  { key: 'priorityInSearch', label: 'Priority in search' },
  { key: 'advancedAnalytics', label: 'Advanced analytics' },
  { key: 'dedicatedSupport', label: 'Dedicated support' },
  { key: 'allowCustomBranding', label: 'Custom branding' },
  { key: 'allowGroupCreation', label: 'Group creation' },
];

/** Feature flags enabled by admin, in display order. */
export function getEnabledPlanFeatureFlags(
  variant: PlanVariant,
): Array<{ key: string; label: string }> {
  const flags = variant.configuration?.featureFlags;
  if (!flags) return [];
  return PLAN_FEATURE_FLAGS.filter((flag) => flags[flag.key]).map((flag) => ({
    key: flag.key,
    label: flag.label,
  }));
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
