import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Tier } from '../src/resources/tier/entities/tier.entity';
import { TierType } from '../src/resources/tier/enums/tier-type.enum';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.prod') });

const dataSource = new DataSource({
  type: 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USERNAME || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_NAME || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  entities: [Tier],
  ssl: { rejectUnauthorized: false },
  synchronize: false,
});

const defaultTiers = [
  {
    name: 'Free Plan',
    description: 'Basic tier for small local businesses starting out.',
    monthlyPrice: 0.0,
    quarterlyPrice: 0.0,
    annualPrice: 0.0,
    isDefault: true,
    isActive: true,
    type: TierType.STANDARD,
    features: [
      'Basic Business Profile',
      'Up to 5 product listings',
      'Up to 3 service listings',
      'Standard search placement',
      'Standard customer reviews',
    ],
    configuration: {
      quotas: {
        maxListings: 8,
        allowProductListing: true,
        allowServiceListing: true,
        maxProducts: 5,
        maxServices: 3,
        maxGiftCardTemplates: 1,
        maxCouponTemplates: 2,
        maxLoyaltyPrograms: 1,
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
    },
  },
  {
    name: 'Silver Plan',
    description: 'Designed for growing businesses looking to expand their local reach.',
    monthlyPrice: 29.99,
    quarterlyPrice: 79.99,
    annualPrice: 299.99,
    isDefault: false,
    isActive: true,
    type: TierType.STANDARD,
    features: [
      'Up to 25 product listings',
      'Up to 15 service listings',
      'Priority in local search results',
      '5 Coupon & Gift Card templates',
      'Standard performance analytics',
      'Email support',
    ],
    configuration: {
      quotas: {
        maxListings: 40,
        allowProductListing: true,
        allowServiceListing: true,
        maxProducts: 25,
        maxServices: 15,
        maxGiftCardTemplates: 5,
        maxCouponTemplates: 10,
        maxLoyaltyPrograms: 3,
        maxImagesPerListing: 6,
        featuredListingAllowance: 2,
      },
      featureFlags: {
        priorityInSearch: true,
        advancedAnalytics: false,
        dedicatedSupport: false,
        allowCustomBranding: true,
        allowGroupCreation: true,
      },
    },
  },
  {
    name: 'Gold Plan',
    description: 'Full-featured tier for established local brands and busy stores.',
    monthlyPrice: 59.99,
    quarterlyPrice: 159.99,
    annualPrice: 575.99,
    isDefault: false,
    isActive: true,
    type: TierType.STANDARD,
    features: [
      'Up to 100 product listings',
      'Up to 50 service listings',
      'Featured listing placements',
      'Unlimited coupon campaigns',
      'Advanced CRM & Analytics',
      'Priority support',
    ],
    configuration: {
      quotas: {
        maxListings: 150,
        allowProductListing: true,
        allowServiceListing: true,
        maxProducts: 100,
        maxServices: 50,
        maxGiftCardTemplates: 15,
        maxCouponTemplates: 30,
        maxLoyaltyPrograms: 10,
        maxImagesPerListing: 10,
        featuredListingAllowance: 5,
      },
      featureFlags: {
        priorityInSearch: true,
        advancedAnalytics: true,
        dedicatedSupport: true,
        allowCustomBranding: true,
        allowGroupCreation: true,
      },
    },
  },
  {
    name: 'Platinum Plan',
    description: 'Maximum visibility, featured placement, advanced automation, and 24/7 dedicated support.',
    monthlyPrice: 99.99,
    quarterlyPrice: 269.99,
    annualPrice: 959.88,
    isDefault: false,
    isActive: true,
    type: TierType.STANDARD,
    features: [
      'Unlimited product & service listings',
      'Maximum visibility in Local Search',
      'Featured listing placements',
      'Advanced marketing automation & Flow Builder',
      '24/7 dedicated account manager',
      'Unlimited loyalty & voucher campaigns',
      'Advanced CRM analytics insights',
    ],
    configuration: {
      quotas: {
        maxListings: -1,
        allowProductListing: true,
        allowServiceListing: true,
        maxProducts: -1,
        maxServices: -1,
        maxGiftCardTemplates: -1,
        maxCouponTemplates: -1,
        maxLoyaltyPrograms: -1,
        maxImagesPerListing: 15,
        featuredListingAllowance: 10,
      },
      featureFlags: {
        priorityInSearch: true,
        advancedAnalytics: true,
        dedicatedSupport: true,
        allowCustomBranding: true,
        allowGroupCreation: true,
      },
    },
  },
];

async function run() {
  console.log(`Connecting to: ${process.env.POSTGRES_HOST}...`);
  await dataSource.initialize();
  console.log('Database connected successfully.');

  const tierRepo = dataSource.getRepository(Tier);
  const existingTiers = await tierRepo.find();
  console.log(`Current existing tiers: ${existingTiers.length}`);
  existingTiers.forEach((t) => console.log(` - [${t.id}] ${t.name}: £${t.monthlyPrice}/mo`));

  for (const tierData of defaultTiers) {
    const existing = existingTiers.find(
      (t) => t.name.toLowerCase() === tierData.name.toLowerCase(),
    );
    if (existing) {
      console.log(`Updating existing tier: ${tierData.name}`);
      Object.assign(existing, tierData);
      await tierRepo.save(existing);
      console.log(`Updated ${tierData.name}`);
    } else {
      console.log(`Creating new tier: ${tierData.name}`);
      const newTier = tierRepo.create(tierData as any);
      await tierRepo.save(newTier);
      console.log(`Created ${tierData.name}`);
    }
  }

  const finalTiers = await tierRepo.find();
  console.log('\nFinal Tiers in Database:');
  finalTiers.forEach((t) =>
    console.log(
      ` - ID: ${t.id} | Name: "${t.name}" | Monthly: £${t.monthlyPrice} | Quarterly: £${t.quarterlyPrice} | Annual: £${t.annualPrice} | Default: ${t.isDefault}`,
    ),
  );

  await dataSource.destroy();
  console.log('\nDone!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
