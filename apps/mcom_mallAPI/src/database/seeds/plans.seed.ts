import dataSource from '../data-source';
import { Plan } from '../../resources/plans/entities/plan.entity';
import { PlanVariant } from '../../resources/plans/entities/plan-variant.entity';
import { PlansService } from '../../resources/plans/services/plans.service';
import { PlanTier } from '../../resources/plans/enums/plan-tier.enum';
import { CreatePlanDto } from '../../resources/plans/dto/create-plan.dto';

interface QuotaOverrides {
  maxListings?: number;
  allowProductListing?: boolean;
  allowServiceListing?: boolean;
  maxProducts?: number;
  maxServices?: number;
  maxGiftCardTemplates?: number;
  maxCouponTemplates?: number;
  maxLoyaltyPrograms?: number;
  maxImagesPerListing?: number;
  featuredListingAllowance?: number;
}

interface FlagOverrides {
  priorityInSearch?: boolean;
  advancedAnalytics?: boolean;
  dedicatedSupport?: boolean;
  allowCustomBranding?: boolean;
  allowGroupCreation?: boolean;
}

function configuration(
  quotas: QuotaOverrides,
  featureFlags: FlagOverrides = {},
) {
  return {
    quotas: {
      maxListings: 10,
      allowProductListing: true,
      allowServiceListing: true,
      maxProducts: 10,
      maxServices: 10,
      maxGiftCardTemplates: 1,
      maxCouponTemplates: 2,
      maxLoyaltyPrograms: 0,
      maxImagesPerListing: 3,
      featuredListingAllowance: 0,
      ...quotas,
    },
    featureFlags: {
      priorityInSearch: false,
      advancedAnalytics: false,
      dedicatedSupport: false,
      allowCustomBranding: false,
      allowGroupCreation: false,
      ...featureFlags,
    },
    disabledNavIds: [],
  };
}

const PLANS: CreatePlanDto[] = [
  {
    name: 'Bronze',
    slug: 'bronze',
    description: 'For new businesses getting started on the high street.',
    variants: [
      {
        tier: PlanTier.STANDARD,
        price: 29.99,
        features: ['10 listings', '90 days access', 'Basic analytics'],
        configuration: configuration({}),
      },
      {
        tier: PlanTier.PRO,
        price: 49.99,
        features: ['25 listings', '180 days access', 'Priority in search'],
        configuration: configuration(
          {
            maxListings: 25,
            maxProducts: 25,
            maxServices: 25,
            maxImagesPerListing: 5,
            maxGiftCardTemplates: 2,
            maxCouponTemplates: 5,
            maxLoyaltyPrograms: 1,
            featuredListingAllowance: 1,
          },
          { priorityInSearch: true, advancedAnalytics: true },
        ),
      },
      {
        tier: PlanTier.PRO_PLUS,
        price: 89.99,
        features: [
          '50 listings',
          'Full year access',
          'Dedicated support',
          'Custom branding',
        ],
        configuration: configuration(
          {
            maxListings: 50,
            maxProducts: 50,
            maxServices: 50,
            maxImagesPerListing: 10,
            maxGiftCardTemplates: 5,
            maxCouponTemplates: 10,
            maxLoyaltyPrograms: 2,
            featuredListingAllowance: 3,
          },
          {
            priorityInSearch: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            allowCustomBranding: true,
          },
        ),
      },
    ],
  },
  {
    name: 'Silver',
    slug: 'silver',
    description: 'For growing businesses winning repeat local customers.',
    variants: [
      {
        tier: PlanTier.STANDARD,
        price: 59.99,
        features: ['25 listings', '90 days access', 'Priority in search'],
        configuration: configuration(
          {
            maxListings: 25,
            maxProducts: 25,
            maxServices: 25,
            maxImagesPerListing: 5,
            maxGiftCardTemplates: 2,
            maxCouponTemplates: 5,
            maxLoyaltyPrograms: 1,
            featuredListingAllowance: 1,
          },
          { priorityInSearch: true },
        ),
      },
      {
        tier: PlanTier.PRO,
        price: 99.99,
        features: [
          '60 listings',
          '180 days access',
          'Advanced analytics',
          'Dedicated support',
        ],
        configuration: configuration(
          {
            maxListings: 60,
            maxProducts: 60,
            maxServices: 60,
            maxImagesPerListing: 10,
            maxGiftCardTemplates: 5,
            maxCouponTemplates: 12,
            maxLoyaltyPrograms: 3,
            featuredListingAllowance: 4,
          },
          {
            priorityInSearch: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
          },
        ),
      },
      {
        tier: PlanTier.PRO_PLUS,
        price: 159.99,
        features: [
          '120 listings',
          'Full year access',
          'Custom branding',
          'Group creation',
        ],
        configuration: configuration(
          {
            maxListings: 120,
            maxProducts: 120,
            maxServices: 120,
            maxImagesPerListing: 15,
            maxGiftCardTemplates: 8,
            maxCouponTemplates: 20,
            maxLoyaltyPrograms: 5,
            featuredListingAllowance: 6,
          },
          {
            priorityInSearch: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            allowCustomBranding: true,
            allowGroupCreation: true,
          },
        ),
      },
    ],
  },
  {
    name: 'Gold',
    slug: 'gold',
    description: 'For established brands dominating the high street.',
    variants: [
      {
        tier: PlanTier.STANDARD,
        price: 99.99,
        features: ['60 listings', '90 days access', 'Advanced analytics'],
        configuration: configuration(
          {
            maxListings: 60,
            maxProducts: 60,
            maxServices: 60,
            maxImagesPerListing: 10,
            maxGiftCardTemplates: 5,
            maxCouponTemplates: 12,
            maxLoyaltyPrograms: 3,
            featuredListingAllowance: 4,
          },
          { priorityInSearch: true, advancedAnalytics: true },
        ),
      },
      {
        tier: PlanTier.PRO,
        price: 169.99,
        features: [
          '150 listings',
          '180 days access',
          'Dedicated support',
          'Custom branding',
        ],
        configuration: configuration(
          {
            maxListings: 150,
            maxProducts: 150,
            maxServices: 150,
            maxImagesPerListing: 15,
            maxGiftCardTemplates: 10,
            maxCouponTemplates: 25,
            maxLoyaltyPrograms: 6,
            featuredListingAllowance: 8,
          },
          {
            priorityInSearch: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            allowCustomBranding: true,
          },
        ),
      },
      {
        tier: PlanTier.PRO_PLUS,
        price: 249.99,
        features: [
          '500 listings',
          'Full year access',
          'Everything in Pro, unlimited scale',
        ],
        configuration: configuration(
          {
            maxListings: 500,
            maxProducts: 300,
            maxServices: 300,
            maxImagesPerListing: 20,
            maxGiftCardTemplates: 15,
            maxCouponTemplates: 40,
            maxLoyaltyPrograms: 10,
            featuredListingAllowance: 12,
          },
          {
            priorityInSearch: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            allowCustomBranding: true,
            allowGroupCreation: true,
          },
        ),
      },
    ],
  },
];

async function seed(): Promise<void> {
  // Mirror TypeORM CLI behaviour: never synchronize when seeding.
  dataSource.setOptions({ synchronize: false });
  await dataSource.initialize();

  const plansService = new PlansService(
    dataSource.getRepository(Plan),
    dataSource.getRepository(PlanVariant),
    dataSource,
  );

  let created = 0;
  let skipped = 0;

  for (const dto of PLANS) {
    const existing = await dataSource
      .getRepository(Plan)
      .findOne({ where: { slug: dto.slug } });
    if (existing) {
      console.log(`= Plan exists, skipped: ${dto.slug}`);
      skipped++;
      continue;
    }
    const plan = await plansService.create(dto);
    created++;
    console.log(
      `+ Plan created: ${plan.name} (${plan.variants.length} variants)`,
    );
    for (const variant of plan.variants) {
      const amount = variant.prices?.[0]
        ? Number((variant.prices[0] as unknown as { amount: string }).amount)
        : 0;
      console.log(`    - ${variant.tierLevel.name}: £${amount.toFixed(2)}`);
    }
  }

  console.log(`\nSeeding complete: ${created} created, ${skipped} skipped.`);
  await dataSource.destroy();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Plans seed failed:', err);
  process.exit(1);
});
