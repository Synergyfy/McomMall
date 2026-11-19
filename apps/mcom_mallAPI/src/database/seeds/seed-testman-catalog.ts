import dataSource from '../data-source';
import { User } from '../../resources/users/entities/user.entity';
import { Business } from '../../resources/listings/entities/listing.entity';
import { Product } from '../../resources/product/entities/product.entity';
import { Service } from '../../resources/services/entities/service.entity';
import { PricingModel } from '../../resources/services/service.enum';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

const EMAIL = 'testman00@gmail.com';

const PRODUCTS = [
  {
    title: 'Classic Cotton T-Shirt',
    category: 'Apparel',
    price: 19.99,
    short: 'Soft everyday cotton tee.',
    description:
      'A breathable 100% cotton t-shirt with a relaxed fit. Ideal for everyday wear and easy to layer.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Organic Coffee Beans 500g',
    category: 'Food & Drink',
    price: 14.5,
    short: 'Medium roast whole-bean coffee.',
    description:
      'Single-origin organic arabica beans, medium roasted for a smooth chocolatey finish. 500g resealable bag.',
    image:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Leather Notebook',
    category: 'Stationery',
    price: 24,
    short: 'Hand-finished A5 notebook.',
    description:
      'A5 hardback notebook with a full-grain leather cover and 160 pages of cream paper. Perfect for notes and sketches.',
    image:
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ceramic Plant Pot',
    category: 'Home & Garden',
    price: 16,
    short: 'Minimal matte ceramic planter.',
    description:
      'A 16cm matte ceramic plant pot with a drainage hole and matching saucer. Fits most small houseplants.',
    image:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Bluetooth Headphones',
    category: 'Electronics',
    price: 59.99,
    short: 'Over-ear wireless headphones.',
    description:
      'Wireless over-ear headphones with 30-hour battery life, active noise cancelling and a built-in microphone.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Stainless Steel Water Bottle',
    category: 'Outdoor',
    price: 22,
    short: 'Insulated 750ml bottle.',
    description:
      'Double-walled stainless steel bottle that keeps drinks cold for 24 hours or hot for 12. Leak-proof lid.',
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Scented Soy Candle',
    category: 'Home Fragrance',
    price: 18.5,
    short: 'Amber & vanilla soy candle.',
    description:
      'Hand-poured soy wax candle with amber and vanilla notes. Up to 40 hours burn time in an amber glass jar.',
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Canvas Tote Bag',
    category: 'Accessories',
    price: 12,
    short: 'Heavyweight everyday tote.',
    description:
      'Durable 12oz cotton canvas tote with reinforced handles and an internal pocket. Machine washable.',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Desk Lamp',
    category: 'Home Office',
    price: 34.99,
    short: 'Adjustable LED desk lamp.',
    description:
      'Dimmable LED desk lamp with three colour temperatures, a flexible arm and a USB charging port.',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Running Shoes',
    category: 'Footwear',
    price: 74.95,
    short: 'Lightweight daily trainers.',
    description:
      'Breathable mesh running shoes with responsive cushioning and a grippy outsole for daily training.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  },
];

const SERVICES = [
  {
    name: 'Home Cleaning',
    category: 'Home Services',
    price: 65,
    duration: 120,
    description:
      'A thorough two-hour clean of your home, including kitchen, bathrooms, floors and dusting.',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Personal Training Session',
    category: 'Fitness',
    price: 45,
    duration: 60,
    description:
      'One-to-one personal training session tailored to your goals, with a written follow-up plan.',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Haircut & Styling',
    category: 'Beauty',
    price: 35,
    duration: 45,
    description:
      'Consultation, wash, cut and finish with a stylist. Includes recommendations for home styling.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Laptop Repair',
    category: 'Tech Services',
    price: 80,
    duration: 90,
    description:
      'Diagnostics and repair for common laptop issues. Parts are quoted separately after inspection.',
    image:
      'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Interior Design Consultation',
    category: 'Design',
    price: 120,
    duration: 60,
    description:
      'A one-hour consultation covering layout, colour and styling with a written summary of recommendations.',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Yoga Class',
    category: 'Wellness',
    price: 18,
    duration: 60,
    description:
      'Small-group vinyasa yoga class suitable for all levels. Mats and props provided.',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Photography Session',
    category: 'Creative',
    price: 150,
    duration: 90,
    description:
      'A 90-minute portrait or product photography session, including 10 edited digital images.',
    image:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bike Tune-Up',
    category: 'Repairs',
    price: 50,
    duration: 60,
    description:
      'Gear indexing, brake adjustment, drivetrain clean and safety check for your bicycle.',
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massage Therapy',
    category: 'Wellness',
    price: 70,
    duration: 60,
    description:
      'A relaxing full-body massage using your choice of pressure, with oils and hot towels included.',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Garden Maintenance',
    category: 'Home Services',
    price: 55,
    duration: 90,
    description:
      'Lawn mowing, hedge trimming and general tidying for small to medium gardens. Green waste removed.',
    image:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
  },
];

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const businessRepo = dataSource.getRepository(Business);
  const productRepo = dataSource.getRepository(Product);
  const serviceRepo = dataSource.getRepository(Service);

  const user = await userRepo.findOne({ where: { email: EMAIL } });
  if (!user) {
    throw new Error(`User ${EMAIL} not found`);
  }

  const business = await businessRepo.findOne({
    where: { user: { id: user.id } },
    relations: ['category'],
  });
  if (!business) {
    throw new Error(`No business found for ${EMAIL}`);
  }

  let createdProducts = 0;
  for (const [index, item] of PRODUCTS.entries()) {
    const sku = `TM-PROD-${String(index + 1).padStart(3, '0')}`;
    const exists = await productRepo.findOne({ where: { sku } });
    if (exists) continue;

    const product = productRepo.create({
      business,
      title: item.title,
      productType: 'physical',
      category: item.category,
      price: item.price,
      salePrice: index % 3 === 0 ? Number((item.price * 0.9).toFixed(2)) : undefined,
      shortDescription: item.short,
      description: item.description,
      sku,
      stock: 25 + index * 3,
      lowStockThreshold: 5,
      enableStockManagement: true,
      useVariantPricing: false,
      productStatus: 'published',
      visibility: 'public',
      approvalStatus: ApprovalStatus.APPROVED,
      enableReviews: true,
      tags: [item.category, 'seed'],
      media: [item.image],
      weight: 0.2 + index * 0.05,
    });
    await productRepo.save(product);
    createdProducts += 1;
  }

  let createdServices = 0;
  for (const item of SERVICES) {
    const exists = await serviceRepo.findOne({
      where: { businessId: business.id, name: item.name },
    });
    if (exists) continue;

    const service = serviceRepo.create({
      business,
      businessId: business.id,
      name: item.name,
      description: item.description,
      category: item.category,
      status: 'published',
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      pricingModel: PricingModel.FIXED,
      fixedPrice: item.price,
      duration: item.duration,
      requireApproval: false,
      media: [item.image],
      tags: [item.category, 'seed'],
    });
    await serviceRepo.save(service);
    createdServices += 1;
  }

  console.log(
    `Seeded ${createdProducts} products and ${createdServices} services for ${EMAIL} (business ${business.businessName}).`
  );
  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
