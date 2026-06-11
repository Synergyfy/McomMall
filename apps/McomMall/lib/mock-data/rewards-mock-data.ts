export type RewardType = 'coupon' | 'voucher' | 'qr' | 'event' | 'gift' | 'loyalty' | 'gamification' | 'code';

export interface PointsBreakdown {
  earned: number;
  used: number;
  pending: number;
}

export interface RewardDetails {
  id: string;
  title: string;
  brand: string;
  category: string;
  cost: number;
  expiryText: string;
  description: string;
  image: string;
  badgeIcon: 'workspace_premium' | 'confirmation_number' | 'flash_on' | 'coffee' | 'checkroom' | 'casino' | 'restaurant' | 'shopping_bag' | 'celebration' | 'diamond' | 'key';
  isHot?: boolean;
  longDescription: string;
  status?: 'available' | 'claimed' | 'redeemed' | 'expired' | 'pending';
  redeemedDate?: string;
  redeemedTime?: string;
  tier?: 'Gold' | 'Silver' | 'Bronze';
  progress?: number;
  benefits?: string[];
  isUrgent?: boolean;
  urgencyText?: string;
  isLocked?: boolean;
  pointsRequired?: number;
  rewardType: RewardType;
  usageCondition?: string;
  valueUsed?: number;
  accumulationRules?: string;
  code?: string;
  isOptedIn?: boolean;
}

export interface RewardHistoryEntry {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'pending';
  title: string;
  subtitle: string;
  date: string;
  points: number;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export const POINTS_BREAKDOWN: PointsBreakdown = {
  earned: 3240,
  used: 1500,
  pending: 100,
};

export const REWARDS_MOCK_DATA: Record<string, RewardDetails> = {
  "coffee-duo": {
    id: "coffee-duo",
    title: "Artisan Coffee Duo",
    brand: "Grounded Cafe",
    category: "Available",
    cost: 500,
    expiryText: "Exp. in 2 days",
    description: "Two free premium beverages at any Grounded Cafe branch.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsJoL2j41rPDG8AEWLNiVNSz4dQQvhmzX8XfsIOVykpxjqsB5Dymprj7ucVK8ixVpaKPIc9cG-b8EnPexKSHgfREuIv2lj30524j2bblzysf09c5J8GXOd1O35F6Z-7DtIqCQaZq1Mfzqlaq9CcM0g5HvMCNbEVzmgRRjeRpRzcBuwXnBENHt1RFC_0SwTWEfFPEqlAUD5MfZV_S5UhzqcxxLRzsBEL0F8eh1UtADT7JNZrayj2yqUKM5v9",
    badgeIcon: "workspace_premium",
    longDescription: "Indulge in our signature beverages, handcrafted to perfection. This reward is valid for any two specialty coffee, tea, or blended drinks at any Grounded Cafe location within the MCOM Mall. Excludes retail merchandise.",
    rewardType: "voucher",
    usageCondition: "Valid on any two beverages. Max value $12. Excludes retail merchandise.",
  },
  "mall-voucher": {
    id: "mall-voucher",
    title: "$20 Mall Voucher",
    brand: "MCOM Retail",
    category: "Available",
    cost: 1200,
    expiryText: "Exp. in 15 days",
    description: "Valid at all participating fashion and lifestyle retailers in MCOM Mall.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLt3G68y76ETxF9Y3JwbDncDXieIjIQZuMXUqR3GxN-l6QnVzcq2ZgWeQAjivHISy43wMmI5JjmFXWsVHfoO5vzCJXOiocLpOUfdhiAL_665zU6nsdponIxLsoEokVosVhHTuOeC1sBDtF_TasjMPEiAYGLfzKc5mUlCOPuGOxauIKkGoRh4lpXU0w6Xb91Ln5bukYkwpHwas5XQVCFJQ7rR8i2hhSk6niWda4PIsMRzVXAIICuhzwp7sTaE",
    badgeIcon: "confirmation_number",
    longDescription: "Receive $20 off your next purchase at any participating fashion, accessories, or lifestyle boutique in MCOM Mall. Combine this with existing merchant sales for ultimate savings.",
    rewardType: "voucher",
    usageCondition: "$20 off. No minimum spend. Valid at participating retailers only.",
  },
  "fitness-pass": {
    id: "fitness-pass",
    title: "Premium Fitness Pass",
    brand: "Zenith Wellness",
    category: "Available",
    cost: 2000,
    expiryText: "Limited Edition",
    description: "Gain 7-day unlimited access to the Zenith Wellness Studio. Includes one personal trainer consultation.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLuvXDsDRqGEO0TtRIF51l0Ut12tx3hR-mfN5EJYB6F0zInDeRVcm3aAkeGP_-vPebmuAMEDyiZp1Qu2RD7652rbi_lS0HBoRjBURHAXsSU938nYr8hN5B0bd36OlT_9FJQsMN3MrRxmMQNSJ7HW3gNrHfFQPHncfY4t2lfPX2ngbuQ4rZL0GgYSR8d5bmMHI0y9rCIbLVWCN8LZuige0KWNqdXd8lXGzZ5LpmBCURksCgzHJr6G3uco50U",
    badgeIcon: "flash_on",
    isHot: true,
    longDescription: "Experience unlimited access to state-of-the-art yoga, fitness classes, and high-end gym equipment for 7 consecutive days. Also includes a 45-minute 1-on-1 consultation with a certified wellness coach.",
    rewardType: "qr",
    usageCondition: "One-time use. Scan QR at reception for access. Valid for 7 consecutive days from first scan.",
  },
  "signature-coffee": {
    id: "signature-coffee",
    title: "Signature Craft Coffee",
    brand: "Artisan Brew",
    category: "Available",
    cost: 200,
    expiryText: "Expires in 3 days",
    description: "Indulge in our Signature Craft Coffee, roasted in small batches to ensure complex flavor.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsIDKv5UKmzhbNjFxrVOUmcCcVPt7GgJKW1QZqS0O9RWClVjgN9CtAON5CXL5u5WfHg01UMMq6cUd67amU7jhSnCcau1j6rPAVUv_boWOom1Q1eTacJf1_FNb65t_prI3mrIlxSHBOKFnPA1XTsmf8AV8-d355_lkZi_Zg0w0AMV5te1qTwSn9UG7nR8IfvvHg9pdn4BYCatv6BJAfWXrhjkvqKkxj7y-4kh8qF5nx5bhm41sFAVDFKadA",
    badgeIcon: "coffee",
    longDescription: "Indulge in our Signature Craft Coffee, meticulously roasted in small batches to ensure a flavor profile that is both robust and complex. This reward is redeemable for any large handcrafted coffee beverage at any Artisan Brew kiosk within the MCOM Mall ecosystem.",
    rewardType: "coupon",
    usageCondition: "Redeemable for one large handcrafted coffee beverage. Excludes bottled drinks and merchandise.",
  },
  "fashion-voucher": {
    id: "fashion-voucher",
    title: "$10 Shopping Voucher",
    brand: "Luxe Threads",
    category: "Available",
    cost: 800,
    expiryText: "Exp. in 7 days",
    description: "Get $10 off your next purchase at Luxe Threads.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLufbTwq8skrKtjAzURHGFrM9ChHpJMt7Gyqyxu1WiXeZIs7Dkrbcn0V_wbwGTQWlIvJABpvE4X6D6wcRbNoHDm9YfBb4_Su4I_cwzWSeHL75FS_5ocjGeB3ROemrReQjHl9-kyraYJthWghALkldxaedMRz2y6WJdrDpAplKy0XMdIn3pvDIyr7GGgNpHYYrVU0xG2c8bD8jekyyV84ahcrsq0kX1JdJnxpPPqHRzKaqKtKOz3PKiBdYwso",
    badgeIcon: "checkroom",
    longDescription: "Get $10 off your next purchase at Luxe Threads. Min spend $50. Valid on full-price items only.",
    rewardType: "voucher",
    usageCondition: "$10 off with min. $50 spend. Valid on full-price items only. Cannot be combined with other offers.",
  },
  "vip-pass": {
    id: "vip-pass",
    title: "VIP After-Hours Pass",
    brand: "Urban Threads",
    category: "Available",
    cost: 1500,
    expiryText: "Exp. in 30 days",
    description: "Exclusive after-hours shopping experience at Urban Threads.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtA2WXu98-CP01KCDFM6nFciDMNlJvnhmL3EEAkgRLPYs2JmUQVPbCMmkX5izILeVjzodRRbbhvJHYjrui6Y8sij8MYflokDSH3TuGx1rFP8M5i8O_av3uv6JfkxQjIYmNZvnv8VDUGlu6T5gkWzV4ZkgvkyJdzzLE9NfheNPoOISSSQFRIryGNVlv1d1LIDiMTEOr-SW8ffT7wCJdMTKk8ihhX1zXaCztB_GittynO9UU3kGRmt9iARWSp",
    badgeIcon: "casino",
    isLocked: true,
    pointsRequired: 500,
    longDescription: "Get exclusive after-hours access to Urban Threads flagship store. Includes personal styling consultation and champagne.",
    rewardType: "qr",
    usageCondition: "QR required for entry. Valid for one after-hours event only. Includes personal styling + champagne.",
  },
  "dining-voucher": {
    id: "dining-voucher",
    title: "50% Off at Urban Grill",
    brand: "Urban Grill",
    category: "Available",
    cost: 1500,
    expiryText: "Exp. in 14 days",
    description: "Redeem 1,500 points for 50% off your meal.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLuswlTI_bj5tl9xSpeEYdvOwZ1q92dpOyZX7JGlGBdIqDaCFjMolkirnlamjgRy2ejAj4cw17ARaaXF92sYkG4NR-1LTxSKK3iIR3VdYD2X3bSC6_SdiR1OQA7f-pv9MHHAxhgTqinTZRzuA_kz2AFG_aJa8YMNLZv8rMC7x6C97tVTGC_uS8AvgShNawdC-zhNLPKOhGj4H9YfIrtwILiIrb3NVU82ltPDchgwvip_ex22iYflnP5xUaWk",
    badgeIcon: "restaurant",
    isHot: true,
    longDescription: "Enjoy 50% off your total bill at Urban Grill. Valid on dine-in only. Maximum discount of $50.",
    rewardType: "coupon",
    usageCondition: "50% off total bill (max $50 discount). Dine-in only. Valid Sunday-Thursday.",
  },

  /* ===== EVENT REWARDS ===== */
  "halloween-spooktacular": {
    id: "halloween-spooktacular",
    title: "Halloween Spooktacular Treat",
    brand: "MCOM Events",
    category: "Available",
    cost: 300,
    expiryText: "Exp. Oct 31",
    description: "Free spooky-themed dessert at participating cafes. Part of the Halloween campaign.",
    image: "",
    badgeIcon: "celebration",
    longDescription: "Celebrate Halloween with a complimentary spooky-themed dessert at any participating MCOM Mall cafe. Present this reward at checkout during the Halloween event period. One per customer.",
    rewardType: "event",
    usageCondition: "Valid Oct 25-31 only. One per customer. Participating cafes only.",
    isHot: true,
  },
  "christmas-market": {
    id: "christmas-market",
    title: "Christmas Market Voucher",
    brand: "MCOM Events",
    category: "Available",
    cost: 500,
    expiryText: "Exp. Dec 31",
    description: "$5 credit at the Christmas Market pop-up stalls.",
    image: "",
    badgeIcon: "celebration",
    longDescription: "$5 spending credit at any Christmas Market pop-up stall within MCOM Mall. Perfect for gifts, treats, and holiday cheer. Valid throughout the holiday season.",
    rewardType: "event",
    usageCondition: "$5 credit. Valid Dec 1-31 at Christmas Market stalls only. Non-refundable.",
  },
  "spring-walkathon": {
    id: "spring-walkathon",
    title: "Spring Walkathon Badge",
    brand: "MCOM Wellness",
    category: "Available",
    cost: 0,
    expiryText: "Campaign ends Apr 15",
    description: "Earn this badge by completing the 10K steps challenge for 7 consecutive days.",
    image: "",
    badgeIcon: "diamond",
    longDescription: "Complete the MCOM Spring Walkathon challenge: 10,000 steps daily for 7 consecutive days. Track your progress in-app and unlock this exclusive Spring Walkathon badge + 200 bonus points.",
    rewardType: "event",
    usageCondition: "Must complete 7 consecutive days of 10K+ steps tracked via the MCOM app.",
    isHot: true,
  },

  /* ===== GAMIFICATION REWARDS ===== */
  "daily-spin-bonus": {
    id: "daily-spin-bonus",
    title: "Daily Spin Bonus",
    brand: "MCOM Rewards",
    category: "Available",
    cost: 0,
    expiryText: "1 spin per day",
    description: "Spin the wheel daily for a chance to win bonus points, vouchers, or surprise rewards.",
    image: "",
    badgeIcon: "casino",
    longDescription: "Come back every day to spin the MCOM Rewards wheel! Each spin gives you a random reward: 10-500 bonus points, discount vouchers, or exclusive surprise rewards. Streak bonuses available for consecutive daily spins.",
    rewardType: "gamification",
    usageCondition: "One free spin per day. Streak resets if you miss a day.",
    isHot: true,
  },
  "streak-7-badge": {
    id: "streak-7-badge",
    title: "7-Day Streak Badge",
    brand: "MCOM Rewards",
    category: "Available",
    cost: 0,
    expiryText: "Lifetime badge",
    description: "Awarded for logging into MCOM Rewards for 7 consecutive days.",
    image: "",
    badgeIcon: "diamond",
    longDescription: "This exclusive badge celebrates your 7-day login streak. Wear it on your profile and unlock a 2x points multiplier for the next 3 days. Keep your streak alive to reach higher tiers!",
    rewardType: "gamification",
    usageCondition: "Awarded automatically after 7 consecutive daily logins. 2x points multiplier active for 3 days from badge award.",
  },
  "shopping-challenge": {
    id: "shopping-challenge",
    title: "Shop & Earn Challenge",
    brand: "MCOM Rewards",
    category: "Available",
    cost: 0,
    expiryText: "Challenge ends Sunday",
    description: "Spend $200 across 3 different stores this week and earn 1,000 bonus points.",
    image: "",
    badgeIcon: "flash_on",
    isHot: true,
    longDescription: "Complete the weekly Shop & Earn Challenge: make purchases totaling $200 or more across at least 3 different MCOM Mall stores. Earn 1,000 bonus points on completion. Track your progress in-app.",
    rewardType: "gamification",
    usageCondition: "Must spend $200+ across 3+ different stores in one calendar week. Receipts must be scanned in-app.",
  },

  /* ===== CODE REWARDS ===== */
  "mcom-promo-2024": {
    id: "mcom-promo-2024",
    title: "MCOM Welcome Code",
    brand: "MCOM Rewards",
    category: "Available",
    cost: 0,
    expiryText: "No expiry",
    description: "Enter code MCOM2024 for 500 bonus points on your account.",
    image: "",
    badgeIcon: "key",
    longDescription: "Welcome to MCOM Mall! Enter the exclusive code MCOM2024 to instantly receive 500 bonus points. Valid for new and existing members. This code can only be redeemed once per account.",
    rewardType: "code",
    usageCondition: "One-time use per account. Code: MCOM2024. Enter in the Redeem Code section below.",
    code: "MCOM2024",
  },
  "vip-access-24": {
    id: "vip-access-24",
    title: "VIP Early Access Code",
    brand: "MCOM Rewards",
    category: "Available",
    cost: 0,
    expiryText: "Exp. Dec 31 2024",
    description: "Enter VIP2024 for exclusive early access to seasonal sales.",
    image: "",
    badgeIcon: "key",
    isHot: true,
    longDescription: "VIP early access to all seasonal sales at MCOM Mall. Enter code VIP2024 to unlock 24-hour early access to every sale event this year. Includes flash sales and limited drops.",
    rewardType: "code",
    usageCondition: "Code: VIP2024. Valid for one account only. Early access applies to all 2024 seasonal sales.",
    code: "VIP2024",
  },

  /* ===== GIFT REWARDS ===== */
  "birthday-gift": {
    id: "birthday-gift",
    title: "Birthday Gift Voucher",
    brand: "MCOM Rewards",
    category: "Available",
    cost: 0,
    expiryText: "Exp. 30 days from issue",
    description: "A $15 birthday voucher credited automatically to your account.",
    image: "",
    badgeIcon: "casino",
    longDescription: "Happy Birthday from MCOM Mall! Enjoy a $15 birthday voucher to spend anywhere in the mall. This gift is automatically credited to your account on your birthday. Valid for 30 days.",
    rewardType: "gift",
    usageCondition: "$15 credit. Valid on any purchase at any MCOM Mall store. Expires 30 days from issue date.",
  },
};

export const POINTS_HISTORY: RewardHistoryEntry[] = [
  {
    id: "hist-1",
    type: "earned",
    title: "Fashion Store",
    subtitle: "Oct 24, 2023 • Purchase",
    date: "2023-10-24",
    points: 1200,
    icon: "checkroom",
    iconBg: "bg-[#f8ddd2]",
    iconColor: "text-[#a23f00]"
  },
  {
    id: "hist-2",
    type: "redeemed",
    title: "Coffee Duo",
    subtitle: "Oct 23, 2023 • Redeemed",
    date: "2023-10-23",
    points: -500,
    icon: "coffee",
    iconBg: "bg-[#ff9969]/20",
    iconColor: "text-[#97471d]"
  },
  {
    id: "hist-3",
    type: "bonus",
    title: "Daily Spin",
    subtitle: "Oct 22, 2023 • Bonus",
    date: "2023-10-22",
    points: 50,
    icon: "casino",
    iconBg: "bg-[#cfe4ff]",
    iconColor: "text-[#00629f]"
  },
  {
    id: "hist-4",
    type: "pending",
    title: "Pending Points",
    subtitle: "Verification in progress",
    date: "2023-10-21",
    points: 100,
    icon: "pending",
    iconBg: "bg-[#e2bfb0]/20",
    iconColor: "text-[#8e7164]"
  }
];

export const LOYALTY_MEMBERSHIPS: RewardDetails[] = [
  {
    id: "loyalty-1",
    title: "Urban Threads",
    brand: "Urban Threads",
    category: "Loyalty",
    cost: 0,
    expiryText: "Active",
    description: "Gold Tier - Progress to Platinum",
    image: "",
    badgeIcon: "workspace_premium",
    tier: "Gold",
    progress: 75,
    benefits: ["Free Shipping", "Early Access"],
    longDescription: "Gold tier member with 75% progress to Platinum.",
    rewardType: "loyalty",
    accumulationRules: "Earn 1 point per $1 spent. 2x points on weekends.",
    isOptedIn: true,
  },
  {
    id: "loyalty-2",
    title: "Brew & Co",
    brand: "Brew & Co",
    category: "Loyalty",
    cost: 0,
    expiryText: "Standard",
    description: "Silver Tier",
    image: "",
    badgeIcon: "coffee",
    tier: "Silver",
    progress: 40,
    benefits: ["10% Off", "Free Refill"],
    longDescription: "Silver tier member working towards Gold.",
    rewardType: "loyalty",
    accumulationRules: "Earn 1 point per $3 spent. Bonus 50 pts on every 10th purchase.",
    isOptedIn: true,
  },
  {
    id: "loyalty-3",
    title: "Green Market",
    brand: "Green Market",
    category: "Loyalty",
    cost: 0,
    expiryText: "Standard",
    description: "Bronze Tier - Reach 500 points for Silver",
    image: "",
    badgeIcon: "confirmation_number",
    tier: "Bronze",
    progress: 25,
    benefits: ["5% Off"],
    longDescription: "Bronze tier member. Earn more to unlock Silver benefits.",
    rewardType: "loyalty",
    accumulationRules: "Earn 1 point per $5 spent. Double points on organic purchases.",
    isOptedIn: true,
  }
];

export const REDEEMED_REWARDS: RewardDetails[] = [
  {
    id: "redeemed-1",
    title: "50% Off Lunch",
    brand: "Skyline Pizzeria",
    category: "Redeemed",
    cost: 800,
    expiryText: "Success",
    description: "Redeemed on Oct 24, 2023",
    image: "",
    badgeIcon: "restaurant",
    status: "redeemed",
    redeemedDate: "Oct 24, 2023",
    redeemedTime: "14:32 PM",
    longDescription: "50% off lunch voucher redeemed successfully at Skyline Pizzeria.",
    rewardType: "coupon",
    valueUsed: 800,
  },
  {
    id: "redeemed-2",
    title: "Complimentary Tote",
    brand: "Urban Threads",
    category: "Redeemed",
    cost: 1200,
    expiryText: "Success",
    description: "Redeemed on Oct 22, 2023",
    image: "",
    badgeIcon: "shopping_bag",
    status: "redeemed",
    redeemedDate: "Oct 22, 2023",
    redeemedTime: "10:15 AM",
    longDescription: "Complimentary tote bag redeemed at Urban Threads.",
    rewardType: "gift",
    valueUsed: 1200,
  },
  {
    id: "redeemed-3",
    title: "Double Points Pass",
    brand: "Reward System",
    category: "Redeemed",
    cost: 500,
    expiryText: "Failed",
    description: "Expired on Oct 15, 2023",
    image: "",
    badgeIcon: "flash_on",
    status: "expired",
    redeemedDate: "Oct 15, 2023",
    redeemedTime: "Expired",
    longDescription: "Double points pass - redemption failed.",
    rewardType: "voucher",
    valueUsed: 500,
  }
];

export const EXPIRING_REWARDS: RewardDetails[] = [
  {
    id: "expiring-1",
    title: "Free Croissant",
    brand: "Artisan Bakery",
    category: "Expiring",
    cost: 100,
    expiryText: "Expires in 4 hours",
    description: "Local Favorite",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLs1X1lKb5eXQpjh5mlW3Ma9aPGpgxMLoNtXZcyNXoN0q5vcPGIONfRsqaP42HUoJnGTQtJsMDMKxK5czo3re1SWzQ2NYq4xN--G01-A_aO0YM6AAIeCgLkjjkZFLXPZqLcUa8h5YAms-frOQPiEnIe0r7NqeONK4kBU-QjV7nKu_vEd3uOu-aWqREfLr_oNme72rDfzsvZ-_6ZCzzVOxfqp2K02OKn-yanQGt11AasXWm-q0qd9iktx07c",
    badgeIcon: "coffee",
    isUrgent: true,
    urgencyText: "Expires Soon",
    longDescription: "Free artisan croissant with any beverage purchase.",
    rewardType: "coupon",
    usageCondition: "Free with any beverage purchase. One per customer.",
  },
  {
    id: "expiring-2",
    title: "BOGO Fitness Pass",
    brand: "Peak Performance Gym",
    category: "Expiring",
    cost: 1000,
    expiryText: "Expires in 1 day",
    description: "Buy One Get One Free",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLvCPIza0D9m-sMlkrklRXskSjulR1d4cJQoP0mcnMqaU3RPscmMbYPAYblbFLfztkeYP6M2zp2J1HZ05lnfMozGdlWXp2zLvwpW1rLk0R0Ynbd7byAT96cDlgDd_CmGaIbBwHIa-T9RDVu8xgdFYSWDGW25FOu_Ud8NgFiEsjSxe0HeIOJj1NisDvPPtTdGs1jQTFT35EdgytSMrt_CrRQwWPrQCVBRnwlI-XUzG9j6QuCAMATlR3qzSII8",
    badgeIcon: "flash_on",
    isUrgent: true,
    urgencyText: "Expires Soon",
    longDescription: "Buy one fitness pass and get one free at Peak Performance Gym.",
    rewardType: "qr",
    usageCondition: "BOGO offer. QR must be scanned at check-in. Valid for day passes only.",
  },
  {
    id: "expiring-3",
    title: "$5 Mall Credit",
    brand: "Urban Mall Universal Credit",
    category: "Expiring",
    cost: 400,
    expiryText: "Expires in 2 days",
    description: "Universal credit for all stores",
    image: "",
    badgeIcon: "confirmation_number",
    longDescription: "$5 mall credit redeemable at any participating store in Urban Mall.",
    rewardType: "gift",
    usageCondition: "$5 credit. Redeemable at any participating Urban Mall store. Non-transferable.",
  },
  {
    id: "expiring-4",
    title: "Coffee Loyalty Reward",
    brand: "Brew & Co",
    category: "Expiring",
    cost: 0,
    expiryText: "Expires in 5 days",
    description: "Free coffee - loyalty milestone reward",
    image: "",
    badgeIcon: "coffee",
    longDescription: "Free coffee reward earned through Brew & Co loyalty program.",
    rewardType: "loyalty",
    usageCondition: "Free any size coffee. Valid at Brew & Co locations only.",
  },
];
