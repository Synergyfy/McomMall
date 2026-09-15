import dataSource from '../data-source';
import { Sector } from '../../resources/taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../../resources/taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../../resources/taxonomy/entities/taxonomy-subcategory.entity';

const TAXONOMY_DATA = [
  {
    sector: {
      name: 'Food & Beverage',
      description: 'Restaurants, cafes, bars, and food services',
    },
    categories: [
      {
        name: 'Restaurants',
        description: 'Dine-in and takeout restaurants',
        subcategories: [
          'Italian',
          'Chinese',
          'Indian',
          'Japanese',
          'Mexican',
          'Thai',
          'Mediterranean',
          'British',
          'American',
          'Korean',
          'Vietnamese',
          'Caribbean',
          'French',
          'Greek',
          'African',
        ],
      },
      {
        name: 'Cafes & Coffee Shops',
        description: 'Coffee, tea, and light snacks',
        subcategories: [
          'Specialty Coffee',
          'Tea Rooms',
          'Juice Bars',
          'Smoothie Bars',
          'Bakeries',
        ],
      },
      {
        name: 'Bars & Pubs',
        description: 'Bars, pubs, and nightlife venues',
        subcategories: [
          'Cocktail Bars',
          'Gastropubs',
          'Wine Bars',
          'Craft Beer',
          'Sports Bars',
        ],
      },
      {
        name: 'Fast Food',
        description: 'Quick-service restaurants',
        subcategories: [
          'Burgers',
          'Pizza',
          'Chicken',
          'Fish & Chips',
          'Kebabs',
        ],
      },
      {
        name: 'Bakeries & Desserts',
        description: 'Bakeries, patisseries, and dessert shops',
        subcategories: [
          'Artisan Bread',
          'Cakes & Pastries',
          'Ice Cream',
          'Gelato',
          'Donuts',
        ],
      },
      {
        name: 'Catering & Events',
        description: 'Catering services and event food',
        subcategories: [
          'Corporate Catering',
          'Wedding Catering',
          'Party Food',
          'Meal Prep',
        ],
      },
    ],
  },
  {
    sector: {
      name: 'Retail',
      description: 'Shopping, fashion, electronics, and more',
    },
    categories: [
      {
        name: 'Fashion & Clothing',
        description: 'Apparel, footwear, and accessories',
        subcategories: [
          'Menswear',
          'Womenswear',
          'Childrenswear',
          'Sportswear',
          'Vintage',
          'Streetwear',
          'Luxury',
          'Lingerie',
          'Shoes',
          'Accessories',
        ],
      },
      {
        name: 'Electronics',
        description: 'Phones, computers, and gadgets',
        subcategories: [
          'Smartphones',
          'Laptops',
          'Tablets',
          'Audio',
          'Wearables',
          'Gaming',
          'Cameras',
          'Smart Home',
          'Accessories',
          'Refurbished',
        ],
      },
      {
        name: 'Health & Beauty',
        description: 'Cosmetics, skincare, and personal care',
        subcategories: [
          'Skincare',
          'Makeup',
          'Haircare',
          'Fragrances',
          'Natural & Organic',
          'Mens Grooming',
        ],
      },
      {
        name: 'Home & Living',
        description: 'Furniture, decor, and household items',
        subcategories: [
          'Furniture',
          'Lighting',
          'Bedding',
          'Kitchenware',
          'Storage',
          'Decor',
        ],
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sporting goods and outdoor equipment',
        subcategories: [
          'Fitness Equipment',
          'Cycling',
          'Running',
          'Camping',
          'Water Sports',
          'Team Sports',
        ],
      },
      {
        name: 'Books & Stationery',
        description: 'Books, magazines, and office supplies',
        subcategories: [
          'Fiction',
          'Non-Fiction',
          'Children Books',
          'Art Supplies',
          'Office Supplies',
        ],
      },
      {
        name: 'Gifts & Accessories',
        description: 'Gift shops and accessory stores',
        subcategories: [
          'Jewellery',
          'Watches',
          'Bags & Luggage',
          'Sunglasses',
          'Gift Boxes',
        ],
      },
    ],
  },
  {
    sector: {
      name: 'Health & Wellness',
      description: 'Spas, gyms, healthcare, and wellness services',
    },
    categories: [
      {
        name: 'Fitness & Gyms',
        description: 'Gyms, fitness studios, and personal training',
        subcategories: [
          'Weight Training',
          'Cardio',
          'CrossFit',
          'Yoga Studios',
          'Pilates',
          'Boxing',
          'Spin Classes',
          'Personal Training',
        ],
      },
      {
        name: 'Beauty & Spas',
        description: 'Beauty treatments and spa services',
        subcategories: [
          'Facials',
          'Massages',
          'Nail Salons',
          'Waxing',
          'Laser Treatment',
          'Microblading',
          'Spray Tanning',
        ],
      },
      {
        name: 'Hair Salons',
        description: 'Hair cutting, styling, and treatments',
        subcategories: [
          'Hair Cutting',
          'Colouring',
          'Styling',
          'Extensions',
          'Barbers',
          'Treatments',
        ],
      },
      {
        name: 'Healthcare',
        description: 'Medical and healthcare services',
        subcategories: [
          'Physiotherapy',
          'Chiropractic',
          'Opticians',
          'Dental',
          'Podiatry',
          'Mental Health',
        ],
      },
      {
        name: 'Alternative Therapy',
        description: 'Holistic and alternative treatments',
        subcategories: [
          'Acupuncture',
          'Homeopathy',
          'Reiki',
          'Reflexology',
          'Osteopathy',
          'Naturopathy',
        ],
      },
    ],
  },
  {
    sector: {
      name: 'Automotive',
      description: 'Auto sales, services, and parts',
    },
    categories: [
      {
        name: 'Car Dealers',
        description: 'New and used car sales',
        subcategories: [
          'New Cars',
          'Used Cars',
          'Certified Pre-Owned',
          'Electric Vehicles',
        ],
      },
      {
        name: 'Car Services',
        description: 'Repair, maintenance, and servicing',
        subcategories: [
          'General Repairs',
          'MOT Testing',
          'Oil Change',
          'Tyre Services',
          'Bodywork',
          'Diagnostics',
        ],
      },
      {
        name: 'Car Parts & Accessories',
        description: 'Parts, accessories, and modifications',
        subcategories: [
          'Engine Parts',
          'Exterior Accessories',
          'Interior Accessories',
          'Performance Parts',
          'Audio & Electronics',
        ],
      },
      {
        name: 'Car Wash & Detailing',
        description: 'Car cleaning and detailing services',
        subcategories: [
          'Hand Wash',
          'Full Detail',
          'Ceramic Coating',
          'Paint Protection',
          'Interior Cleaning',
        ],
      },
    ],
  },
  {
    sector: {
      name: 'Home & Garden',
      description: 'Home improvement, furniture, and gardening',
    },
    categories: [
      {
        name: 'Home Improvement',
        description: 'Renovation and repair services',
        subcategories: [
          'Plumbing',
          'Electrical',
          'Painting',
          'Carpentry',
          'Roofing',
          'Flooring',
        ],
      },
      {
        name: 'Garden & Landscaping',
        description: 'Garden design and maintenance',
        subcategories: [
          'Garden Design',
          'Lawn Care',
          'Tree Surgery',
          'Patio & Decking',
          'Fencing',
          'Planting',
        ],
      },
      {
        name: 'Interior Design',
        description: 'Interior design and consultancy',
        subcategories: [
          'Residential Design',
          'Commercial Design',
          'Colour Consultation',
          'Space Planning',
        ],
      },
      {
        name: 'Kitchen & Bathroom',
        description: 'Kitchen and bathroom fitting and supplies',
        subcategories: [
          'Kitchen Fitting',
          'Bathroom Fitting',
          'Kitchen Supplies',
          'Bathroom Supplies',
          'Appliances',
        ],
      },
      {
        name: 'Cleaning Services',
        description: 'Domestic and commercial cleaning',
        subcategories: [
          'Domestic Cleaning',
          'End of Tenancy',
          'Office Cleaning',
          'Carpet Cleaning',
          'Window Cleaning',
          'Deep Cleaning',
        ],
      },
    ],
  },
  {
    sector: {
      name: 'Professional Services',
      description: 'Business, legal, and financial services',
    },
    categories: [
      {
        name: 'Legal Services',
        description: 'Solicitors and legal advisors',
        subcategories: [
          'Family Law',
          'Property Law',
          'Corporate Law',
          'Immigration',
          'Employment Law',
          'Criminal Law',
        ],
      },
      {
        name: 'Accounting & Finance',
        description: 'Accountants, bookkeepers, and financial advisors',
        subcategories: [
          'Tax Returns',
          'Bookkeeping',
          'Payroll',
          'Business Planning',
          'Financial Advisory',
        ],
      },
      {
        name: 'Marketing & Design',
        description: 'Marketing agencies and design studios',
        subcategories: [
          'Digital Marketing',
          'Graphic Design',
          'Web Design',
          'Branding',
          'Social Media',
          'SEO',
        ],
      },
      {
        name: 'IT & Tech',
        description: 'IT support and technology services',
        subcategories: [
          'IT Support',
          'Software Development',
          'Cloud Services',
          'Cybersecurity',
          'Data Analytics',
        ],
      },
    ],
  },
];

async function seed() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Connected.\n');

  const sectorRepo = dataSource.getRepository(Sector);
  const categoryRepo = dataSource.getRepository(TaxonomyCategory);
  const subcategoryRepo = dataSource.getRepository(TaxonomySubcategory);

  let sectorsCreated = 0;
  let categoriesCreated = 0;
  let subcategoriesCreated = 0;

  for (const sectorData of TAXONOMY_DATA) {
    // Upsert sector
    let sector = await sectorRepo.findOne({
      where: { name: sectorData.sector.name },
    });
    if (!sector) {
      sector = sectorRepo.create(sectorData.sector);
      await sectorRepo.save(sector);
      sectorsCreated++;
      console.log(`  + Sector: ${sector.name}`);
    } else {
      console.log(`  = Sector exists: ${sector.name}`);
    }

    for (const catData of sectorData.categories) {
      // Upsert category
      let category = await categoryRepo.findOne({
        where: { name: catData.name },
      });
      if (!category) {
        category = categoryRepo.create({
          name: catData.name,
          description: catData.description,
          sectorId: sector.id,
        });
        await categoryRepo.save(category);
        categoriesCreated++;
        console.log(`    + Category: ${category.name}`);
      } else {
        console.log(`    = Category exists: ${category.name}`);
      }

      for (const subName of catData.subcategories) {
        // Upsert subcategory
        let subcategory = await subcategoryRepo.findOne({
          where: { name: subName },
        });
        if (!subcategory) {
          subcategory = subcategoryRepo.create({
            name: subName,
            categoryId: category.id,
          });
          await subcategoryRepo.save(subcategory);
          subcategoriesCreated++;
        }
      }
    }
  }

  console.log(`\nSeeding complete:`);
  console.log(`  Sectors:      ${sectorsCreated} created`);
  console.log(`  Categories:   ${categoriesCreated} created`);
  console.log(`  Subcategories: ${subcategoriesCreated} created`);

  await dataSource.destroy();
  console.log('\nDatabase connection closed.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
