#!/usr/bin/env node
/**
 * Seeds a demo catalogue for a business owner identified by email:
 * products, services, a gift-card template, a voucher product, and two
 * business coupon templates.
 *
 * Idempotent: re-running updates the same rows instead of duplicating them.
 *
 * Usage:
 *   node scripts/seed-partner-demo.js gejaj97050@juicehour.com
 */
require('dotenv').config();
const { Client } = require('pg');

const email = (process.argv[2] || 'gejaj97050@juicehour.com').trim();
const force = process.argv.includes('--force');

const PRODUCTS = [
  {
    title: 'First-Time Buyer Guide',
    productType: 'digital',
    price: 19.99,
    salePrice: 14.99,
    sku: 'GJ-FTB-GUIDE',
    shortDescription: 'A practical step-by-step guide to buying your first home.',
    description:
      'Everything a first-time buyer needs: affordability, deposits, solicitors, surveys, and completion. Delivered instantly as a PDF.',
    category: 'Financial Services',
    tags: 'mortgage,first-time-buyer,guide',
    media:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
  },
  {
    title: 'Mortgage Document Checklist Pack',
    productType: 'digital',
    price: 9.99,
    salePrice: null,
    sku: 'GJ-MORTGAGE-CHECKLIST',
    shortDescription: 'The exact documents lenders ask for, in one checklist.',
    description:
      'ID, income, address, deposit and affordability evidence — with a printable checklist and submission tips.',
    category: 'Financial Services',
    tags: 'mortgage,documents,checklist',
    media:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
  },
  {
    title: 'Homebuyer Welcome Pack',
    productType: 'physical',
    price: 35,
    salePrice: 30,
    sku: 'GJ-WELCOME-PACK',
    shortDescription: 'A printed planning pack for your home-buying journey.',
    description:
      'A5 folder with budget worksheets, viewing checklists, and a moving-day planner. Posted within 2 working days.',
    category: 'Financial Services',
    tags: 'homebuyer,planning,pack',
    media:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    stock: 50,
  },
];

const SERVICES = [
  {
    name: 'Mortgage Eligibility Review',
    description:
      'A 45-minute review of your income, deposit and credit profile to confirm how much you could borrow.',
    pricingModel: 'fixed',
    fixedPrice: 75,
    category: 'Mortgage Advice',
    subcategory: 'Eligibility',
    duration: 45,
  },
  {
    name: 'Remortgage Advisory Session',
    description:
      'Hourly advice on remortgaging, product transfers and switching lenders to reduce your monthly payment.',
    pricingModel: 'perHour',
    pricePerHour: 120,
    category: 'Mortgage Advice',
    subcategory: 'Remortgage',
    duration: 60,
  },
  {
    name: 'First-Time Buyer Consultation',
    description:
      'A one-hour consultation covering affordability, government schemes, deposits and next steps.',
    pricingModel: 'fixed',
    fixedPrice: 95,
    category: 'Mortgage Advice',
    subcategory: 'First-Time Buyer',
    duration: 60,
  },
];

const COUPONS = [
  {
    code: 'GJ-10-OFF',
    title: '£10 Off Mortgage Review',
    description: '£10 off any mortgage eligibility review booked through MCOM Mall.',
    discountType: 'fixed',
    discountValue: 10,
  },
  {
    code: 'GJ-15PCT',
    title: '15% Off First Consultation',
    description: '15% off a first-time buyer consultation.',
    discountType: 'percentage',
    discountValue: 15,
  },
];

(async () => {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USERNAME || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_NAME || 'dbname',
  });

  await client.connect();
  try {
    await client.query('BEGIN');

    const user = (
      await client.query(
        'SELECT id, email FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email],
      )
    ).rows[0];
    if (!user) throw new Error(`User not found: ${email}`);

    let business = (
      await client.query(
        'SELECT id, "businessName" FROM businesses WHERE "userId" = $1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1',
        [user.id],
      )
    ).rows[0];

    if (!business) {
      business = (
        await client.query(
          `INSERT INTO businesses
             (id, "listingType", "businessName", "shortDescription", about,
              "businessPhone", "businessEmail", status, "userId", "isVerified",
              "businessType", industry)
           VALUES
             (uuid_generate_v4(), ARRAY['product','service']::businesses_listingtype_enum[],
              $1, $2, $3, $4, $5, 'published'::businesses_status_enum, $6, true,
              'products', 'financial-insurance')
           RETURNING id, "businessName"`,
          [
            email.split('@')[0],
            'Mortgage and homebuyer advice.',
            'Independent mortgage guidance for first-time buyers and remortgagers.',
            '+44 20 0000 0000',
            email,
            user.id,
          ],
        )
      ).rows[0];
    }

    // Guard: SKUs and coupon codes are globally unique. Refuse to run when a
    // row already belongs to a different business instead of silently moving
    // someone else's catalogue (the ON CONFLICT update used to do that).
    const productSkus = PRODUCTS.map((p) => p.sku);
    const couponCodes = COUPONS.map((c) => c.code);
    const foreignSkus = (
      await client.query(
        `SELECT sku FROM "Products"
         WHERE sku = ANY($1::text[])
           AND "businessId" IS DISTINCT FROM $2
           AND deleted_at IS NULL`,
        [productSkus, business.id],
      )
    ).rows.map((r) => r.sku);
    const foreignCodes = (
      await client.query(
        `SELECT code FROM coupons
         WHERE code = ANY($1::text[])
           AND "businessId" IS DISTINCT FROM $2
           AND deleted_at IS NULL`,
        [couponCodes, business.id],
      )
    ).rows.map((r) => r.code);
    if (foreignSkus.length || foreignCodes.length) {
      if (force) {
        console.warn(
          `--force: skipping ${foreignSkus.length} SKU(s) and ${foreignCodes.length} coupon code(s) owned by another business.`,
        );
      } else {
        throw new Error(
          `Refusing to seed: ${foreignSkus.length} SKU(s) and ${foreignCodes.length} coupon code(s) ` +
            `already belong to another business (${[...foreignSkus, ...foreignCodes].join(', ')}). ` +
            `Give this business unique SKUs/codes or run with --force to skip those rows.`,
        );
      }
    }

    const claimableSkus = new Set(
      force
        ? productSkus.filter((sku) => !foreignSkus.includes(sku))
        : productSkus,
    );
    const claimableCodes = new Set(
      force
        ? couponCodes.filter((code) => !foreignCodes.includes(code))
        : couponCodes,
    );

    // ── Products ────────────────────────────────────────────────────────
    for (const [index, product] of PRODUCTS.entries()) {
      if (!claimableSkus.has(product.sku)) continue;
      await client.query(
        `INSERT INTO "Products"
           (id, title, "productType", price, "salePrice", sku,
            "shortDescription", description, media, tags, category,
            "productStatus", visibility, "businessId", "isFeatured",
            "isRotatorEligible", "isPromotionEligible", "enableStockManagement",
            stock)
         VALUES
           (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            'published', 'public', $11, $12, false, true, $13, $14)
         ON CONFLICT (sku) DO UPDATE SET
           title = EXCLUDED.title,
           "productType" = EXCLUDED."productType",
           price = EXCLUDED.price,
           "salePrice" = EXCLUDED."salePrice",
           "shortDescription" = EXCLUDED."shortDescription",
           description = EXCLUDED.description,
           media = EXCLUDED.media,
           tags = EXCLUDED.tags,
           category = EXCLUDED.category,
           "productStatus" = EXCLUDED."productStatus",
           visibility = EXCLUDED.visibility,
           "enableStockManagement" = EXCLUDED."enableStockManagement",
           stock = EXCLUDED.stock,
           deleted_at = NULL`,
        [
          product.title,
          product.productType,
          product.price,
          product.salePrice,
          product.sku,
          product.shortDescription,
          product.description,
          product.media,
          product.tags,
          product.category,
          business.id,
          index === 0,
          product.productType === 'physical',
          product.stock ?? 0,
        ],
      );
    }

    // ── Services ────────────────────────────────────────────────────────
    for (const [index, service] of SERVICES.entries()) {
      await client.query(
        `INSERT INTO services
           (id, "businessId", name, description, media, "isActive",
            "pricingModel", "fixedPrice", "pricePerHour", category,
            subcategory, status, duration, "isFeatured", "isRotatorEligible",
            "isPromotionEligible", "requireApproval")
         VALUES
           (uuid_generate_v4(), $1, $2, $3, $4, true,
            $5::services_pricingmodel_enum, $6, $7, $8, $9, 'published', $10,
            $11, false, true, false)
         ON CONFLICT ("businessId", name) DO UPDATE SET
           description = EXCLUDED.description,
           media = EXCLUDED.media,
           "isActive" = EXCLUDED."isActive",
           "pricingModel" = EXCLUDED."pricingModel",
           "fixedPrice" = EXCLUDED."fixedPrice",
           "pricePerHour" = EXCLUDED."pricePerHour",
           category = EXCLUDED.category,
           subcategory = EXCLUDED.subcategory,
           status = EXCLUDED.status,
           duration = EXCLUDED.duration,
           "isFeatured" = EXCLUDED."isFeatured",
           "deletedAt" = NULL`,
        [
          business.id,
          service.name,
          service.description,
          JSON.stringify([
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
          ]),
          service.pricingModel,
          service.fixedPrice ?? null,
          service.pricePerHour ?? null,
          service.category,
          service.subcategory,
          service.duration,
          index === 0,
        ],
      );
    }

    // ── Gift-card template ──────────────────────────────────────────────
    const giftCardTemplate = (
      await client.query(
        `INSERT INTO gift_card_templates
           (id, name, description, "backgroundImageUrl", "backgroundColor",
            "textColor", "fixedAmounts", "allowCustomAmount", "minCustomAmount",
            "maxCustomAmount", "expiryPeriodDays", "isActive", "allowReloading",
            "ownerId")
         VALUES
           (uuid_generate_v4(), $1, $2, $3, $4, $5, $6::numeric[], true, 5, 500,
            365, true, false, $7)
         RETURNING id, name`,
        [
          `${business.businessName} Gift Card`,
          'A flexible gift card for mortgage advice, guides and homebuyer packs.',
          'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1600&q=80',
          '#f58220',
          '#ffffff',
          [10, 25, 50, 100],
          user.id,
        ],
      )
    ).rows[0];

    // ── Voucher product ─────────────────────────────────────────────────
    const voucherProduct = (
      await client.query(
        `INSERT INTO voucher_products
           (id, name, description, "fixedAmounts", "allowCustomAmount",
            "minCustomAmount", "maxCustomAmount", usage, "isEnabled",
            "expiryDays", "allowPartialRedemption", "backgroundImage",
            "textColor", "allowReloading", "voucherType", "valueType", value,
            status, "userId")
         VALUES
           (uuid_generate_v4(), $1, $2, $3::numeric[], true, 5, 250,
            'both'::voucher_products_usage_enum, true, 365, true, $4, '#1f2937',
            false, 'gift_voucher', 'fixed', 0, 'active', $5)
         RETURNING id, name`,
        [
          `${business.businessName} Reward Voucher`,
          'Redeemable against mortgage consultations and homebuyer products.',
          [10, 25, 50],
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80',
          user.id,
        ],
      )
    ).rows[0];

    // ── Coupon templates (business coupons) ─────────────────────────────
    const coupons = [];
    for (const coupon of COUPONS) {
      if (!claimableCodes.has(coupon.code)) continue;
      const row = (
        await client.query(
          `INSERT INTO coupons
             (id, code, title, description, "sourceType", "discountValue",
              "discountType", "usageLimit", "perUserLimit", status, "startDate",
              "expiresAt", "businessId")
           VALUES
             (uuid_generate_v4(), $1, $2, $3, 'business'::coupons_sourcetype_enum,
              $4, $5::coupons_discounttype_enum, 100, 1,
              'active'::coupons_status_enum, now(), now() + interval '1 year', $6)
           ON CONFLICT (code) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             "discountValue" = EXCLUDED."discountValue",
             "discountType" = EXCLUDED."discountType",
             "usageLimit" = EXCLUDED."usageLimit",
             "perUserLimit" = EXCLUDED."perUserLimit",
             status = EXCLUDED.status,
             "startDate" = EXCLUDED."startDate",
             "expiresAt" = EXCLUDED."expiresAt",
               deleted_at = NULL
           RETURNING id, code, title`,
          [
            coupon.code,
            coupon.title,
            coupon.description,
            coupon.discountValue,
            coupon.discountType,
            business.id,
          ],
        )
      ).rows[0];
      coupons.push(row);
    }

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          user: user.email,
          business,
          products: PRODUCTS.length,
          services: SERVICES.length,
          giftCardTemplate,
          voucherProduct,
          coupons,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
