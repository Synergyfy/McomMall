import { motion } from 'framer-motion';
import PricingCard from './PricingCard';
import ComparisonTable from './ComparisonTable';
import TrialInfo from './TrialInfo';
import { TableFeature, FeatureGroup } from '../types/index';
import { paygTiers } from '../data/pricingData';

const paygPlans = ['90 Days', '180 Days', '270 Days'];

const paygFeatures: TableFeature[] = [
  {
    name: 'Basic Directory Listing (247 GBS / MCOM Hub)',
    availability: [true, true, true],
    tooltip: 'Lists your business on key directories for visibility.',
  },
  {
    name: 'Claim & Verify Business Listing',
    availability: [true, true, true],
    tooltip: 'Verify your business to enhance credibility.',
  },
  {
    name: 'External Evergreen Reward QR Code',
    availability: [true, true, true],
    tooltip: 'Generates a QR code for customer rewards.',
  },
  {
    name: 'Wallet Overview (Business Dashboard)',
    availability: [true, true, true],
    tooltip: 'Dashboard for managing payments and credits.',
  },
  {
    name: 'Basic eGift / eCard Setup',
    availability: [true, true, true],
    tooltip: 'Basic setup for digital gift cards.',
  },
  {
    name: 'Customer Analytics (Basic)',
    availability: [true, true, true],
    tooltip: 'Basic insights into customer behavior and trends.',
  },
  {
    name: 'Loyalty CardX (Basic Template Access)',
    availability: [false, true, true],
    tooltip: 'Access to basic loyalty card templates.',
  },
  {
    name: 'Cashback Rate Configuration',
    availability: [false, true, true],
    tooltip: 'Customize cashback rates for customers.',
  },
  {
    name: 'Bonus Offers for Spare Stock',
    availability: [false, true, true],
    tooltip: 'Create offers from excess stock.',
  },
  {
    name: 'Stock Audit Tool (Basic)',
    availability: [false, true, true],
    tooltip: 'Tool to audit and manage stock levels.',
  },
  {
    name: 'MCOM Deals (Basic Publishing)',
    availability: [false, false, true],
    tooltip: 'Publish basic deals on the MCOM platform.',
  },
  {
    name: 'MCOM SocialBio Profile',
    availability: [false, false, true],
    tooltip: 'Create a social bio profile for marketing.',
  },
  {
    name: 'Videogram (QR-linked Video Cards)',
    availability: [false, false, true],
    tooltip: 'Link videos to QR codes on cards.',
  },
  {
    name: 'Reward Program Integration (Internal)',
    availability: [false, false, false],
    tooltip: 'Integrate internal reward systems.',
  },
  {
    name: 'Cross-Sell with Other Business Owners',
    availability: [false, false, false],
    tooltip: 'Enable cross-selling with other businesses.',
  },
  {
    name: 'Marketing Campaign Builder (Basic)',
    availability: [false, false, false],
    tooltip: 'Basic tool for creating marketing campaigns.',
  },
  {
    name: '247 GBS Co-Branded Partner Branding',
    availability: [false, false, false],
    tooltip: 'Branding as a 247 GBS partner.',
  },
  {
    name: 'Marketing Campaign Builder (Advanced)',
    availability: [false, false, false],
    tooltip: 'Advanced campaign creation tools.',
  },
  {
    name: 'Full Loyalty CardX Customisation',
    availability: [false, false, false],
    tooltip: 'Full customization of loyalty cards.',
  },
  {
    name: 'Advanced Analytics & Insights',
    availability: [false, false, false],
    tooltip: 'Detailed customer insights and performance metrics.',
  },
  {
    name: 'Internal Reward + Loyalty Management',
    availability: [false, false, false],
    tooltip: 'Manage internal rewards and loyalty.',
  },
  {
    name: 'MCOM Co-Branded Marketing Traffic Package',
    availability: [false, false, false],
    tooltip: 'Access to co-branded marketing traffic.',
  },
  {
    name: 'Dedicated Account Support',
    availability: [false, false, false],
    tooltip: 'Dedicated support for your account.',
  },
  {
    name: 'Hyper Local Hub Partnership Eligibility',
    availability: [false, false, false],
    tooltip: 'Eligibility for local hub partnerships.',
  },
  {
    name: 'Advanced Stock Audit & Spare Capacity Monetisation',
    availability: [false, false, false],
    tooltip: 'Advanced tools for stock and monetization.',
  },
  {
    name: 'Full MCOM Product Suite Access (All Features)',
    availability: [false, false, false],
    tooltip: 'Access to all MCOM features.',
  },
  {
    name: 'DealMachine AI for Performance Tracking',
    availability: [false, false, false],
    tooltip: 'AI-powered tool for tracking and optimizing performance.',
  },
  {
    name: 'Seasonal Campaigns (Spring/Summer/Autumn/Winter)',
    availability: [false, false, false],
    tooltip: 'Run campaigns for each season.',
  },
  {
    name: 'White Label Branding (eGift, Loyalty, Dashboard)',
    availability: [false, false, false],
    tooltip: 'White-label branding for various tools.',
  },
  {
    name: 'VistaPrint Integration for Physical Cards',
    availability: [false, false, false],
    tooltip: 'Integrate with VistaPrint for physical cards.',
  },
];

const paygFeatureGroups: FeatureGroup[] = [
  { name: 'Core Access', features: paygFeatures.slice(0, 6) },
  { name: 'Loyalty Tools', features: paygFeatures.slice(6, 10) },
  { name: 'Engagement Tools', features: paygFeatures.slice(10, 13) },
  { name: 'Advanced Integration', features: paygFeatures.slice(13, 17) },
  { name: 'Marketing Advanced', features: paygFeatures.slice(17, 22) },
  { name: 'Support and Partnerships', features: paygFeatures.slice(22, 24) },
  { name: 'Premium Features', features: paygFeatures.slice(24) },
];

import { PricingTier } from '../types';

interface PayAsYouGoContentProps {
  listingId: string | null;
  onPayNow: (tier: PricingTier) => void;
  onStartTrial: (tier: PricingTier) => void;
}

export default function PayAsYouGoContent({
  listingId,
  onPayNow,
  onStartTrial,
}: PayAsYouGoContentProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-900">
        Pay As You Go Pricing
      </h1>
      <section className="w-full flex flex-col lg:flex-row items-center justify-center mb-12 gap-8">
        <div className="w-full lg:w-2/3">
          <TrialInfo />
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 h-fit">
        {paygTiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <PricingCard
              tier={
                tier as PricingTier & { accent: 'teal' | 'purple' | 'yellow' }
              }
              isPayg={true}
              listingId={listingId}
              onPayNow={onPayNow}
              onStartTrial={onStartTrial}
            />
          </motion.div>
        ))}
      </div>
      <ComparisonTable
        plans={paygPlans}
        featureGroups={paygFeatureGroups}
        accentHeaders={['blue-900', 'orange-800', 'black-500']}
      />
    </motion.div>
  );
}
