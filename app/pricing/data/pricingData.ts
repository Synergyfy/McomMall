import { PricingTier } from '../types';

// Data from PayAsYouGoContent.tsx
export const paygTiers: PricingTier[] = [
  {
    name: '90 Days',
    price: '£90',
    primaryFeatures: [
      'Basic Access to MCOM Ecosystem – Limited to services in the purchased seasonal package (Winter, Spring, Summer, or Autumn).',
      'External Evergreen Reward Programme QR Code – One QR code for the main store; additional codes can be purchased for other branches or partner locations.',
      'Directory Listing – Business listed on 247GBS Business Directories & MCOM Lead Traffic Hub (after claim & verification).',
      'MCOM Wallet Access – Limited features for payment acceptance & reward credits.',
      'Seasonal Campaign Participation – Eligible to join network-wide promotions during your active 30-day season.',
    ],
    secondaryFeatures: [
      'Spare Capacity & Stock Audit Tool – Can be used to identify excess stock and create simple offers.',
      'Basic Consumer Rewards – Offer rewards via the Evergreen Programme (managed by 247GBS, not customisable).',
      '7-day, 15-day, or 21-day Challenges – Option to earn credits to reduce future subscription costs.',
      'Referral Credits – Limited ability to refer other businesses and earn credits.',
      'Access to Smart Money Solutions – Basic package (VoIP, POS devices, Elavon payment solutions).',
      'Marketing Exposure – Inclusion in seasonal directory promotions for the active quarter.',
    ],
    accent: 'teal',
  },
  {
    name: '180 Days',
    price: '£150',
    inherits: '90 Days',
    primaryFeatures: [
      'Coverage for two seasonal packages (e.g., Winter + Spring).',
      'Extended marketing exposure in seasonal directory promotions across two seasons.',
    ],
    accent: 'purple',
  },
  {
    name: '270 Days',
    price: '£240',
    inherits: '180 Days',
    primaryFeatures: [
      'Coverage for three seasonal packages (e.g., Winter + Spring + Summer).',
      'Extended marketing exposure in seasonal directory promotions across three seasons.',
    ],
    accent: 'yellow',
  },
];

// Data from CoBrandedContent.tsx
export const coBrandedTiers: PricingTier[] = [
  {
    name: 'Mcom Standard',
    price: '£300 / year',
    primaryFeatures: [
      'All PAYG Benefits – Full access without seasonal limitation.',
      'Customisable Rewards & Loyalty Program – Internal loyalty program setup (Visit-based, Spend-based, Referral-based, Seasonal campaigns).',
      'White-Label Branding – Loyalty cards, eGift cards, and marketing materials in own brand (logo, colours, fonts).',
      'Multiple QR Codes – For multiple branches, departments, or partner locations.',
      'Cross-Selling Network Access – Ability to sell and promote other business owners’ products via your own loyalty system.',
    ],
    secondaryFeatures: [
      'Full Dashboard Access – Advanced analytics, customer insights, loyalty performance, eGift & eCard management.',
      'eGift Card Creation & Sale – Pre-purchased cards (physical or digital) with QR codes, audio/video attachments, and SaaS resale options.',
      'Integration with MCOMECARD – Load rewards, cashback, and promotions directly onto the consumer’s card.',
      'Run Independent Campaigns – Marketing and advertising with or without 247GBS support.',
      'Product & Service Sales Rights – Sell 247GBS products/services independently or as a licensed sales agent.',
    ],
    accent: 'teal',
  },
  {
    name: 'Mcom Pro',
    price: '£600 / year',
    inherits: 'Standard',
    primaryFeatures: [
      'Priority Marketing Campaigns – Access to 247GBS traffic leads and campaign packages.',
      'Advanced Stock Audit Integration – AI-powered DealMachine integration for excess stock promotions.',
      'Hyper-Local Partnerships – Ability to partner with local stalls, events, and services for joint loyalty programs.',
    ],
    accent: 'purple',
  },
  {
    name: 'Mcom Pro Plus',
    price: '£900 / year',
    inherits: 'Pro',
    primaryFeatures: [
      'All Features Activated – No restrictions.',
      'Hyper Local Hub Partnership Eligibility – Bid to run physical MCOM Hyper Local Support Hubs.',
      'Complete Automation – Seasonal preset campaigns (Winter, Spring, Summer, Autumn) auto-activated.',
    ],
    secondaryFeatures: [
      'National & Regional Campaign Control – Lead and manage campaigns in assigned territories.',
      'Unlimited Consumer Rewards – No cap on loyalty members or rewards given.',
      'AI & BOT Marketing Automation – Seasonal templates, predictive consumer offers, automated upsell campaigns.',
    ],
    accent: 'yellow',
  },
];
