import dataSource from '../data-source';
import { User } from '../../resources/users/entities/user.entity';
import { Business } from '../../resources/listings/entities/listing.entity';
import {
  BusinessStatus,
  ListingType,
} from '../../resources/listings/listing.enum';
import { Product } from '../../resources/product/entities/product.entity';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

/**
 * Deterministic platform business that owns products created by MCOM Mall admins.
 * The admin app reads the same UUID from NEXT_PUBLIC_MCOM_PLATFORM_BUSINESS_ID
 * so the "Admin" side-filter can separate these from merchant products.
 */
export const PLATFORM_BUSINESS_ID = 'a11ce001-5eed-4a11-9c00-000000000001';
const PLATFORM_BUSINESS_NAME = 'MCOM Mall Admin';

const IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
];

interface SeedProduct {
  title: string;
  category: string;
  price: number;
}

// 24 merchant-created products. The first 16 are approved, the last 8 are
// waiting for admin approval so the moderation queue has real data.
const BUSINESS_PRODUCTS: SeedProduct[] = [
  { title: 'Edge Compute Gateway Mini', category: 'Electronics', price: 129 },
  { title: 'Studio Monitor Speaker Pair', category: 'Electronics', price: 89.5 },
  { title: 'Modular Desk Shelf', category: 'Home', price: 42 },
  { title: 'Everyday Canvas Backpack', category: 'Fashion', price: 38.99 },
  { title: 'Thermal Travel Mug', category: 'Home', price: 21.5 },
  { title: 'Wireless Ergonomic Mouse', category: 'Electronics', price: 34 },
  { title: 'Linen Weekend Shirt', category: 'Fashion', price: 46 },
  { title: 'Compact Air Purifier', category: 'Home', price: 118 },
  { title: 'Smart Door Sensor Kit', category: 'Electronics', price: 55 },
  { title: 'Merino Wool Scarf', category: 'Fashion', price: 29 },
  { title: 'Oak Desk Organiser', category: 'Home', price: 32.5 },
  { title: 'USB-C Docking Station', category: 'Electronics', price: 96 },
  { title: 'Performance Running Socks', category: 'Fashion', price: 14 },
  { title: 'Ceramic Coffee Dripper', category: 'Home', price: 18.75 },
  { title: 'Portable SSD 1TB', category: 'Electronics', price: 112 },
  { title: 'Minimalist Wallet', category: 'Fashion', price: 24 },
  { title: '4K Webcam Pro', category: 'Electronics', price: 74 },
  { title: 'Adjustable Laptop Stand', category: 'Electronics', price: 39 },
  { title: 'Cotton Throw Blanket', category: 'Home', price: 48 },
  { title: 'Waterproof Trail Jacket', category: 'Fashion', price: 92 },
  { title: 'Smart Plug 3-Pack', category: 'Electronics', price: 28 },
  { title: 'Bamboo Bath Set', category: 'Home', price: 26.5 },
  { title: 'Leather Card Holder', category: 'Fashion', price: 22 },
  { title: 'Bluetooth Mechanical Keyboard', category: 'Electronics', price: 78 },
];

// 10 platform-created products, all pre-approved and published.
const ADMIN_PRODUCTS: SeedProduct[] = [
  { title: 'MCOM Essential Hoodie', category: 'Fashion', price: 45 },
  { title: 'MCOM Everyday Tote', category: 'Fashion', price: 18 },
  { title: 'MCOM Ceramic Mug', category: 'Home', price: 12.5 },
  { title: 'MCOM Wireless Earbuds', category: 'Electronics', price: 59 },
  { title: 'MCOM Desk Mat', category: 'Home', price: 24 },
  { title: 'MCOM Charging Cable Kit', category: 'Electronics', price: 16 },
  { title: 'MCOM Cotton Cap', category: 'Fashion', price: 20 },
  { title: 'MCOM Notebook Set', category: 'Home', price: 14 },
  { title: 'MCOM Portable Speaker', category: 'Electronics', price: 68 },
  { title: 'MCOM Travel Bottle', category: 'Home', price: 19 },
];

const APPROVED_BUSINESS_COUNT = 16;

async function seedProducts(
  productRepo: ReturnType<typeof dataSource.getRepository<Product>>,
  business: Business,
  items: SeedProduct[],
  options: {
    prefix: string;
    origin: 'business' | 'admin';
    isApproved: (index: number) => boolean;
    reviewerId: string;
  },
): Promise<{ created: number; approved: number; pending: number }> {
  let created = 0;
  let approved = 0;
  let pending = 0;

  for (const [index, item] of items.entries()) {
    const sku = `${options.prefix}-${String(index + 1).padStart(3, '0')}`;
    const exists = await productRepo.findOne({ where: { sku } });
    if (exists) continue;

    const isApproved = options.isApproved(index);
    const approvalStatus = isApproved
      ? ApprovalStatus.APPROVED
      : ApprovalStatus.PENDING;

    const product = productRepo.create({
      business,
      title: item.title,
      productType: 'physical',
      category: item.category,
      price: item.price,
      salePrice:
        index % 4 === 0
          ? Number((item.price * 0.9).toFixed(2))
          : undefined,
      shortDescription: `${item.title} from the ${options.origin} catalog seed.`,
      description: `${item.title} is a ${item.category.toLowerCase()} product added by the ${options.origin} catalog seed. It is ${
        isApproved ? 'already approved and visible in the catalog' : 'waiting for admin approval'
      }.`,
      sku,
      stock: index % 5 === 0 ? 4 : 12 + (index % 7) * 6,
      lowStockThreshold: 5,
      enableStockManagement: true,
      useVariantPricing: false,
      productStatus: 'published',
      visibility: 'public',
      approvalStatus,
      reviewNote: null,
      reviewedBy: isApproved ? options.reviewerId : null,
      reviewedAt: isApproved ? new Date() : null,
      adminDisabled: false,
      enableReviews: true,
      tags: [item.category, 'seed', options.origin, approvalStatus],
      media: [IMAGES[index % IMAGES.length]],
      weight: 0.2 + (index % 6) * 0.1,
      length: 10,
      width: 10,
      height: 5,
    });

    await productRepo.save(product);
    created += 1;
    if (isApproved) approved += 1;
    else pending += 1;
  }

  return { created, approved, pending };
}

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const businessRepo = dataSource.getRepository(Business);
  const productRepo = dataSource.getRepository(Product);

  const owner =
    (await userRepo.findOne({ where: { email: 'admin@mcommall.local' } })) ??
    (await userRepo.findOne({ where: {}, order: { created_at: 'ASC' } }));
  if (!owner) throw new Error('No user found to own the seeded products');

  const business = await businessRepo.findOne({
    where: { businessName: 'FutureTech Systems' },
  });
  if (!business) {
    throw new Error('FutureTech Systems business not found');
  }

  let platformBusiness = await businessRepo.findOne({
    where: { id: PLATFORM_BUSINESS_ID },
  });
  if (!platformBusiness) {
    platformBusiness = businessRepo.create({
      id: PLATFORM_BUSINESS_ID,
      user: owner,
      listingType: [ListingType.PRODUCT],
      businessName: PLATFORM_BUSINESS_NAME,
      legalName: 'MCOM Mall',
      shortDescription:
        'Platform-owned catalog for products created by MCOM Mall administrators.',
      about:
        'Internal business used to group platform-created products separately from merchant listings.',
      businessPhone: '+442080000000',
      businessEmail: owner.email,
      businessType: 'platform',
      industry: 'Retail',
      website: 'https://mcommall.com',
      status: BusinessStatus.PUBLISHED,
      isVerified: true,
      isClaimed: true,
      logoUrl: IMAGES[4],
      tags: [] as never,
    } as Partial<Business>);
    await businessRepo.save(platformBusiness);
  }

  const businessResult = await seedProducts(productRepo, business, BUSINESS_PRODUCTS, {
    prefix: 'SEED-BIZ',
    origin: 'business',
    isApproved: (index) => index < APPROVED_BUSINESS_COUNT,
    reviewerId: owner.id,
  });

  const adminResult = await seedProducts(productRepo, platformBusiness, ADMIN_PRODUCTS, {
    prefix: 'SEED-ADM',
    origin: 'admin',
    isApproved: () => true,
    reviewerId: owner.id,
  });

  console.log(
    `Business catalog: ${businessResult.created} created ` +
      `(${businessResult.approved} approved, ${businessResult.pending} pending)`,
  );
  console.log(
    `Admin catalog: ${adminResult.created} created ` +
      `(${adminResult.approved} approved, ${adminResult.pending} pending)`,
  );
  console.log(`Platform business ID: ${PLATFORM_BUSINESS_ID}`);

  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
