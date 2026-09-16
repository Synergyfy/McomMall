import * as z from 'zod';
import {
  CreatePlanInput,
  Plan,
  PlanTier,
  UpdatePlanInput,
  getActivePrice,
  getPriceAmount,
} from '@/app/admin/types/plan';

const quotaSchema = z.object({
  maxListings: z.coerce.number().min(0),
  allowProductListing: z.boolean(),
  allowServiceListing: z.boolean(),
  maxProducts: z.coerce.number().min(0),
  maxServices: z.coerce.number().min(0),
  maxGiftCardTemplates: z.coerce.number().min(0),
  maxCouponTemplates: z.coerce.number().min(0),
  maxLoyaltyPrograms: z.coerce.number().min(0),
  maxImagesPerListing: z.coerce.number().min(0),
  featuredListingAllowance: z.coerce.number().min(0),
});

const featureFlagsSchema = z.object({
  priorityInSearch: z.boolean(),
  advancedAnalytics: z.boolean(),
  dedicatedSupport: z.boolean(),
  allowCustomBranding: z.boolean(),
  allowGroupCreation: z.boolean(),
});

const configurationSchema = z.object({
  quotas: quotaSchema,
  featureFlags: featureFlagsSchema,
  disabledNavIds: z.array(z.string()).optional(),
});

const variantSchema = z.object({
  variantId: z.string().optional(),
  tier: z.nativeEnum(PlanTier),
  price: z.coerce.number().min(0, 'Must be 0 or greater'),
  stripePriceId: z.string().optional(),
  paypalPlanId: z.string().optional(),
  features: z.array(z.string()).optional(),
  configuration: configurationSchema,
  isActive: z.boolean(),
});

export const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers and hyphens',
    ),
  description: z.string().optional(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).length(3),
});

export type PlanFormValues = z.infer<typeof planSchema>;

export const VARIANT_ORDER = [
  PlanTier.STANDARD,
  PlanTier.PRO,
  PlanTier.PRO_PLUS,
] as const;

export const VARIANT_HINTS: Record<PlanTier, string> = {
  [PlanTier.STANDARD]: 'Standard · 90 days',
  [PlanTier.PRO]: 'Pro · 180 days',
  [PlanTier.PRO_PLUS]: 'Pro+ · 1 year',
};

export const DEFAULT_CONFIGURATION = {
  quotas: {
    maxListings: 10,
    allowProductListing: true,
    allowServiceListing: true,
    maxProducts: 5,
    maxServices: 5,
    maxGiftCardTemplates: 1,
    maxCouponTemplates: 1,
    maxLoyaltyPrograms: 0,
    maxImagesPerListing: 3,
    featuredListingAllowance: 0,
  },
  featureFlags: {
    priorityInSearch: false,
    advancedAnalytics: false,
    dedicatedSupport: false,
    allowCustomBranding: false,
    allowGroupCreation: false,
  },
  disabledNavIds: [],
};

export function defaultVariant(tier: PlanTier) {
  return {
    tier,
    price: 0,
    stripePriceId: '',
    paypalPlanId: '',
    features: [],
    configuration: DEFAULT_CONFIGURATION,
    isActive: true,
  };
}

export function blankPlanValues(): PlanFormValues {
  return {
    name: '',
    slug: '',
    description: '',
    isActive: true,
    variants: [
      defaultVariant(PlanTier.STANDARD),
      defaultVariant(PlanTier.PRO),
      defaultVariant(PlanTier.PRO_PLUS),
    ],
  };
}

export function planToFormValues(plan: Plan): PlanFormValues {
  const byTier = new Map(
    (plan.variants ?? []).map((variant) => [
      variant.tierLevel?.name,
      variant,
    ]),
  );

  return {
    name: plan.name,
    slug: plan.slug,
    description: plan.description ?? '',
    isActive: plan.isActive,
    variants: VARIANT_ORDER.map((tier) => {
      const variant = byTier.get(tier);
      const activePrice = variant ? getActivePrice(variant) : null;
      return {
        variantId: variant?.id,
        tier,
        price: getPriceAmount(activePrice),
        stripePriceId: activePrice?.stripePriceId ?? '',
        paypalPlanId: activePrice?.paypalPlanId ?? '',
        features: variant?.features ?? [],
        configuration: {
          quotas: {
            ...DEFAULT_CONFIGURATION.quotas,
            ...(variant?.configuration?.quotas ?? {}),
          },
          featureFlags: {
            ...DEFAULT_CONFIGURATION.featureFlags,
            ...(variant?.configuration?.featureFlags ?? {}),
          },
          disabledNavIds: variant?.configuration?.disabledNavIds ?? [],
        },
        isActive: variant?.isActive ?? true,
      };
    }),
  };
}

export function valuesToCreateInput(values: PlanFormValues): CreatePlanInput {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || undefined,
    variants: values.variants.map((variant) => ({
      tier: variant.tier,
      price: Number(variant.price),
      stripePriceId: variant.stripePriceId || undefined,
      paypalPlanId: variant.paypalPlanId || undefined,
      features: variant.features ?? [],
      configuration: {
        quotas: { ...variant.configuration.quotas },
        featureFlags: { ...variant.configuration.featureFlags },
        disabledNavIds: variant.configuration.disabledNavIds ?? [],
      },
    })),
  };
}

export interface VariantUpdateCall {
  variantId: string;
  data: {
    features: string[];
    configuration: PlanFormValues['variants'][number]['configuration'];
    isActive: boolean;
  };
  priceData: { amount: number; stripePriceId?: string; paypalPlanId?: string } | null;
}

export function valuesToUpdateCalls(
  plan: Plan,
  values: PlanFormValues,
): { planData: UpdatePlanInput; variantCalls: VariantUpdateCall[] } {
  const initialByTier = new Map(
    (plan.variants ?? []).map((variant) => [
      variant.tierLevel?.name,
      variant,
    ]),
  );

  const variantCalls: VariantUpdateCall[] = [];
  for (const formVariant of values.variants) {
    const initial = initialByTier.get(formVariant.tier);
    if (!initial) continue;

    const initialPrice = getActivePrice(initial);
    const priceChanged =
      getPriceAmount(initialPrice) !== Number(formVariant.price);
    const stripeChanged =
      (initialPrice?.stripePriceId ?? '') !== (formVariant.stripePriceId ?? '');
    const paypalChanged =
      (initialPrice?.paypalPlanId ?? '') !== (formVariant.paypalPlanId ?? '');

    variantCalls.push({
      variantId: initial.id,
      data: {
        features: formVariant.features ?? [],
        configuration: {
          quotas: { ...formVariant.configuration.quotas },
          featureFlags: { ...formVariant.configuration.featureFlags },
          disabledNavIds: formVariant.configuration.disabledNavIds ?? [],
        },
        isActive: formVariant.isActive,
      },
      priceData:
        priceChanged || stripeChanged || paypalChanged
          ? {
              amount: Number(formVariant.price),
              stripePriceId: formVariant.stripePriceId || undefined,
              paypalPlanId: formVariant.paypalPlanId || undefined,
            }
          : null,
    });
  }

  return {
    planData: {
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      isActive: values.isActive,
    },
    variantCalls,
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
