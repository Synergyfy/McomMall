import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Reward } from '../src/resources/customer/entities/reward.entity';
import { RewardType } from '../src/resources/customer/reward.enum';
import { Challenge } from '../src/resources/customer/entities/challenge.entity';
import { ChallengeType } from '../src/resources/customer/reward.enum';
import { QuizQuestion } from '../src/resources/quiz/entities/quiz-question.entity';
import { FlashSaleItem } from '../src/resources/flash-sales/entities/flash-sale-item.entity';
import { FlashSaleStatus } from '../src/resources/flash-sales/flash-sale.enum';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');

const dataSource = new DataSource({
  type: 'postgres',
  port: +process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USERNAME || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_NAME || 'dbname',
  host: process.env.POSTGRES_HOST || 'localhost',
  entities: [path.resolve(__dirname, '..', 'src') + '/**/*.entity{.ts,.js}'],
  synchronize: false,
});

const rewards: Array<Partial<Reward>> = [
  {
    title: 'Artisan Coffee Duo',
    brand: 'Grounded Cafe',
    category: 'Available',
    cost: 500,
    description: 'Two free premium beverages at any Grounded Cafe branch.',
    longDescription:
      'Indulge in our signature beverages, handcrafted to perfection. Valid for any two specialty coffee, tea, or blended drinks at any Grounded Cafe location within the MCOM Mall. Excludes retail merchandise.',
    rewardType: RewardType.VOUCHER,
    usageCondition:
      'Valid on any two beverages. Max value $12. Excludes retail merchandise.',
    badgeIcon: 'workspace_premium',
    isActive: true,
  },
  {
    title: '$20 Mall Voucher',
    brand: 'MCOM Retail',
    category: 'Available',
    cost: 1200,
    description:
      'Valid at all participating fashion and lifestyle retailers in MCOM Mall.',
    longDescription:
      'Receive $20 off your next purchase at any participating fashion, accessories, or lifestyle boutique in MCOM Mall.',
    rewardType: RewardType.VOUCHER,
    usageCondition:
      '$20 off. No minimum spend. Valid at participating retailers only.',
    badgeIcon: 'confirmation_number',
    isActive: true,
  },
  {
    title: 'Premium Fitness Pass',
    brand: 'Zenith Wellness',
    category: 'Available',
    cost: 2000,
    description:
      'Gain 7-day unlimited access to the Zenith Wellness Studio. Includes one personal trainer consultation.',
    longDescription:
      'Experience unlimited access to state-of-the-art yoga, fitness classes, and high-end gym equipment for 7 consecutive days.',
    rewardType: RewardType.QR,
    usageCondition:
      'One-time use. Scan QR at reception for access. Valid for 7 consecutive days from first scan.',
    badgeIcon: 'flash_on',
    isHot: true,
    isActive: true,
  },
  {
    title: 'Signature Craft Coffee',
    brand: 'Artisan Brew',
    category: 'Available',
    cost: 200,
    description:
      'Indulge in our Signature Craft Coffee, roasted in small batches to ensure complex flavor.',
    longDescription:
      'Indulge in our Signature Craft Coffee, meticulously roasted in small batches.',
    rewardType: RewardType.COUPON,
    usageCondition:
      'Redeemable for one large handcrafted coffee beverage. Excludes bottled drinks and merchandise.',
    badgeIcon: 'coffee',
    isActive: true,
  },
  {
    title: '$10 Shopping Voucher',
    brand: 'Luxe Threads',
    category: 'Available',
    cost: 800,
    description: 'Get $10 off your next purchase at Luxe Threads.',
    longDescription:
      'Get $10 off your next purchase at Luxe Threads. Min spend $50. Valid on full-price items only.',
    rewardType: RewardType.VOUCHER,
    usageCondition:
      '$10 off with min. $50 spend. Valid on full-price items only. Cannot be combined with other offers.',
    badgeIcon: 'checkroom',
    isActive: true,
  },
  {
    title: '50% Off at Urban Grill',
    brand: 'Urban Grill',
    category: 'Available',
    cost: 1500,
    description: 'Redeem 1,500 points for 50% off your meal.',
    longDescription:
      'Enjoy 50% off your total bill at Urban Grill. Valid on dine-in only. Maximum discount of $50.',
    rewardType: RewardType.COUPON,
    usageCondition:
      '50% off total bill (max $50 discount). Dine-in only. Valid Sunday-Thursday.',
    badgeIcon: 'restaurant',
    isHot: true,
    isActive: true,
  },
  {
    title: 'MCOM Welcome Code',
    brand: 'MCOM Rewards',
    category: 'Available',
    cost: 0,
    description: 'Enter code MCOM2024 for 500 bonus points on your account.',
    longDescription:
      'Welcome to MCOM Mall! Enter the exclusive code MCOM2024 to instantly receive 500 bonus points. Valid for new and existing members.',
    rewardType: RewardType.CODE,
    usageCondition:
      'One-time use per account. Code: MCOM2024. Enter in the Redeem Code section below.',
    badgeIcon: 'key',
    code: 'MCOM2024',
    pointsRequired: 500,
    isActive: true,
  },
  {
    title: 'VIP Early Access Code',
    brand: 'MCOM Rewards',
    category: 'Available',
    cost: 0,
    description: 'Enter VIP2024 for exclusive early access to seasonal sales.',
    longDescription:
      'VIP early access to all seasonal sales at MCOM Mall. Enter code VIP2024 to unlock 24-hour early access to every sale event this year.',
    rewardType: RewardType.CODE,
    usageCondition:
      'Code: VIP2024. Valid for one account only. Early access applies to all 2024 seasonal sales.',
    badgeIcon: 'key',
    isHot: true,
    code: 'VIP2024',
    pointsRequired: 0,
    isActive: true,
  },
  {
    title: 'Daily Spin Bonus',
    brand: 'MCOM Rewards',
    category: 'Available',
    cost: 0,
    description:
      'Spin the wheel daily for a chance to win bonus points, vouchers, or surprise rewards.',
    longDescription:
      'Come back every day to spin the MCOM Rewards wheel! Each spin gives you a random reward: 10-500 bonus points, discount vouchers, or exclusive surprise rewards.',
    rewardType: RewardType.GAMIFICATION,
    usageCondition: 'One free spin per day. Streak resets if you miss a day.',
    badgeIcon: 'casino',
    isHot: true,
    isActive: true,
  },
  {
    title: 'Shop & Earn Challenge',
    brand: 'MCOM Rewards',
    category: 'Available',
    cost: 0,
    description:
      'Spend $200 across 3 different stores this week and earn 1,000 bonus points.',
    longDescription:
      'Complete the weekly Shop & Earn Challenge: make purchases totaling $200 or more across at least 3 different MCOM Mall stores. Earn 1,000 bonus points on completion.',
    rewardType: RewardType.GAMIFICATION,
    usageCondition:
      'Must spend $200+ across 3+ different stores in one calendar week.',
    badgeIcon: 'flash_on',
    isHot: true,
    isActive: true,
  },
];

const challenges: Array<Partial<Challenge>> = [
  {
    title: 'Shop & Earn Challenge',
    description:
      'Spend $200 across 3 different stores this week and earn 1,000 bonus points.',
    challengeType: ChallengeType.SHOP,
    target: 200,
    rewardPoints: 1000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    isActive: true,
  },
  {
    title: 'Spring Walkathon',
    description:
      'Complete the 10K steps challenge for 7 consecutive days to earn the badge + 200 bonus points.',
    challengeType: ChallengeType.STREAK,
    target: 7,
    rewardPoints: 200,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    isActive: true,
  },
];

const quizQuestions: Array<Partial<QuizQuestion>> = [
  {
    question: 'Which 3 elements should a promotional social post include?',
    options: [
      'Headline, Visual, Call to action',
      'Hashtag, Long paragraph, Link',
      'Only product name',
    ],
    correctAnswerIndex: 0,
    order: 0,
    isActive: true,
  },
  {
    question: 'Which is the best subjectline for a sale email',
    options: [
      'Big sale - CLick here',
      'Get 25% off your next order today',
      'Read this please',
    ],
    correctAnswerIndex: 1,
    order: 1,
    isActive: true,
  },
  {
    question: 'what tool would you use to speed up image creation',
    options: ['Excel', 'Canva', 'Powerpoint'],
    correctAnswerIndex: 1,
    order: 2,
    isActive: true,
  },
];

const flashSaleItems: Array<Partial<FlashSaleItem>> = [
  {
    title: 'Do Pass Yourself',
    category: 'Appliances',
    price: 120.0,
    discountedPrice: 99.99,
    itemsLeft: 15,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Awoof Deals',
    category: 'Phones & Tablets',
    price: 850.0,
    discountedPrice: 799.99,
    itemsLeft: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Up to 80% Off',
    category: 'Health & Beauty',
    price: 50.0,
    discountedPrice: 39.99,
    itemsLeft: 25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Send Packages Securely',
    category: 'Home & Office',
    price: 200.0,
    discountedPrice: 179.99,
    itemsLeft: 5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Unbeatable Offers',
    category: 'Electronics',
    price: 500.0,
    discountedPrice: 449.99,
    itemsLeft: 12,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Earn While You Shop',
    category: 'Fashion',
    price: 70.0,
    discountedPrice: 59.99,
    itemsLeft: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Unlock Your Deal',
    category: 'Supermarket',
    price: 30.0,
    discountedPrice: 24.99,
    itemsLeft: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
  {
    title: 'Deals Reloaded',
    category: 'Computing',
    price: 1200.0,
    discountedPrice: 1099.99,
    itemsLeft: 8,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
  },
];

async function seedRewards() {
  const repo = dataSource.getRepository(Reward);
  let inserted = 0;
  for (const reward of rewards) {
    const exists = await repo.findOne({ where: { title: reward.title } });
    if (exists) {
      console.log(`[SKIP] Reward "${reward.title}" already exists.`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would insert reward "${reward.title}".`);
      continue;
    }
    await repo.save(repo.create(reward));
    inserted += 1;
    console.log(`[OK] Inserted reward "${reward.title}".`);
  }
  return inserted;
}

async function seedChallenges() {
  const repo = dataSource.getRepository(Challenge);
  let inserted = 0;
  for (const challenge of challenges) {
    const exists = await repo.findOne({ where: { title: challenge.title } });
    if (exists) {
      console.log(`[SKIP] Challenge "${challenge.title}" already exists.`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would insert challenge "${challenge.title}".`);
      continue;
    }
    await repo.save(repo.create(challenge));
    inserted += 1;
    console.log(`[OK] Inserted challenge "${challenge.title}".`);
  }
  return inserted;
}

async function seedQuizQuestions() {
  const repo = dataSource.getRepository(QuizQuestion);
  let inserted = 0;
  for (const question of quizQuestions) {
    const exists = await repo.findOne({ where: { question: question.question } });
    if (exists) {
      console.log(`[SKIP] Quiz question "${question.question}" already exists.`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would insert quiz question "${question.question}".`);
      continue;
    }
    await repo.save(repo.create(question));
    inserted += 1;
    console.log(`[OK] Inserted quiz question "${question.question}".`);
  }
  return inserted;
}

async function seedFlashSaleItems() {
  const repo = dataSource.getRepository(FlashSaleItem);
  let inserted = 0;
  for (const item of flashSaleItems) {
    const exists = await repo.findOne({ where: { title: item.title } });
    if (exists) {
      console.log(`[SKIP] Flash sale item "${item.title}" already exists.`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would insert flash sale item "${item.title}".`);
      continue;
    }
    await repo.save(repo.create(item));
    inserted += 1;
    console.log(`[OK] Inserted flash sale item "${item.title}".`);
  }
  return inserted;
}

async function run() {
  console.log(DRY_RUN ? 'DRY RUN MODE - no writes will occur' : 'SEED MODE');
  try {
    await dataSource.initialize();
    console.log('Database connected.\n');

    const rewardCount = await seedRewards();
    const challengeCount = await seedChallenges();
    const quizCount = await seedQuizQuestions();
    const flashCount = await seedFlashSaleItems();

    console.log(
      `\nSeeding complete. Rewards: ${rewardCount}, Challenges: ${challengeCount}, Quiz questions: ${quizCount}, Flash sale items: ${flashCount}.`,
    );
    await dataSource.destroy();
  } catch (error) {
    console.error('Error running seed script:', error);
    process.exit(1);
  }
}

run();
