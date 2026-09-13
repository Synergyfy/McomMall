const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env.prod');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const client = new Client({
  host: envConfig.POSTGRES_HOST || 'aws-1-eu-central-1.pooler.supabase.com',
  port: parseInt(envConfig.POSTGRES_PORT || '6543'),
  user: envConfig.POSTGRES_USERNAME,
  password: envConfig.POSTGRES_PASSWORD,
  database: envConfig.POSTGRES_NAME || 'postgres',
  ssl: { rejectUnauthorized: false },
});

const defaultTiers = [
  {
    name: 'Free Plan',
    description: 'Basic tier for small local businesses starting out.',
    monthlyPrice: 0.00,
    quarterlyPrice: 0.00,
    annualPrice: 0.00,
    isDefault: true,
    isActive: true,
    type: 'STANDARD',
    features: [
      'Basic Business Profile',
      'Up to 5 product listings',
      'Up to 3 service listings',
      'Standard search placement',
      'Standard customer reviews',
    ].join(','),
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
    type: 'STANDARD',
    features: [
      'Up to 25 product listings',
      'Up to 15 service listings',
      'Priority in local search results',
      '5 Coupon & Gift Card templates',
      'Standard performance analytics',
      'Email support',
    ].join(','),
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
    type: 'STANDARD',
    features: [
      'Up to 100 product listings',
      'Up to 50 service listings',
      'Featured listing placements',
      'Unlimited coupon campaigns',
      'Advanced CRM & Analytics',
      'Priority support',
    ].join(','),
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
    type: 'STANDARD',
    features: [
      'Unlimited product & service listings',
      'Maximum visibility in Local Search',
      'Featured listing placements',
      'Advanced marketing automation & Flow Builder',
      '24/7 dedicated account manager',
      'Unlimited loyalty & voucher campaigns',
      'Advanced CRM analytics insights',
    ].join(','),
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

async function main() {
  console.log(`Connecting to database at ${envConfig.POSTGRES_HOST}...`);
  await client.connect();
  console.log('Connected!');

  for (const tier of defaultTiers) {
    const existing = await client.query('SELECT id, name FROM tiers WHERE LOWER(name) = LOWER($1)', [tier.name]);
    if (existing.rows.length > 0) {
      console.log(`Updating existing tier: ${tier.name} (${existing.rows[0].id})`);
      await client.query(
        `UPDATE tiers SET 
          description = $1,
          "monthlyPrice" = $2,
          "quarterlyPrice" = $3,
          "annualPrice" = $4,
          features = $5,
          configuration = $6,
          "isActive" = $7,
          "isDefault" = $8,
          type = $9,
          updated_at = NOW()
        WHERE id = $10`,
        [
          tier.description,
          tier.monthlyPrice,
          tier.quarterlyPrice,
          tier.annualPrice,
          tier.features,
          JSON.stringify(tier.configuration),
          tier.isActive,
          tier.isDefault,
          tier.type,
          existing.rows[0].id,
        ]
      );
      console.log(`✓ Updated ${tier.name}`);
    } else {
      console.log(`Inserting new tier: ${tier.name}`);
      await client.query(
        `INSERT INTO tiers (
          name, description, "monthlyPrice", "quarterlyPrice", "annualPrice", 
          features, configuration, "isActive", "isDefault", type, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )`,
        [
          tier.name,
          tier.description,
          tier.monthlyPrice,
          tier.quarterlyPrice,
          tier.annualPrice,
          tier.features,
          JSON.stringify(tier.configuration),
          tier.isActive,
          tier.isDefault,
          tier.type,
        ]
      );
      console.log(`✓ Inserted ${tier.name}`);
    }
  }

  const result = await client.query('SELECT id, name, "monthlyPrice", "quarterlyPrice", "annualPrice", "isDefault", "isActive" FROM tiers ORDER BY "monthlyPrice" ASC');
  console.log('\n--- Current Tiers in Database ---');
  console.table(result.rows);

  await client.end();
}

main().catch((err) => {
  console.error('Error running seed script:', err);
  process.exit(1);
});
