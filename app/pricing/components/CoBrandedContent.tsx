import { useState } from 'react';
import { motion } from 'framer-motion';
import PricingCard from './PricingCard';
import ComparisonTable from './ComparisonTable';
import { PricingTier, TableFeature, FeatureGroup } from '../types/index';
import { ShieldCheck, LayoutDashboard, Rocket, Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { PaymentGatewayDialog } from '@/components/PaymentGatewayDialog';
import { coBrandedTiers } from '../data/pricingData';

const coBrandedPlans = ['Standard', 'Pro', 'Pro Plus'];

const coBrandedFeatures: TableFeature[] = [
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
    availability: [true, true, true],
    tooltip: 'Access to basic loyalty card templates.',
  },
  {
    name: 'Cashback Rate Configuration',
    availability: [true, true, true],
    tooltip: 'Customize cashback rates for customers.',
  },
  {
    name: 'Bonus Offers for Spare Stock',
    availability: [true, true, true],
    tooltip: 'Create offers from excess stock.',
  },
  {
    name: 'Stock Audit Tool (Basic)',
    availability: [true, true, true],
    tooltip: 'Tool to audit and manage stock levels.',
  },
  {
    name: 'MCOM Deals (Basic Publishing)',
    availability: [true, true, true],
    tooltip: 'Publish basic deals on the MCOM platform.',
  },
  {
    name: 'MCOM SocialBio Profile',
    availability: [true, true, true],
    tooltip: 'Create a social bio profile for marketing.',
  },
  {
    name: 'Videogram (QR-linked Video Cards)',
    availability: [true, true, true],
    tooltip: 'Link videos to QR codes on cards.',
  },
  {
    name: 'Reward Program Integration (Internal)',
    availability: [true, true, true],
    tooltip: 'Integrate internal reward systems.',
  },
  {
    name: 'Cross-Sell with Other Business Owners',
    availability: [true, true, true],
    tooltip: 'Enable cross-selling with other businesses.',
  },
  {
    name: 'Marketing Campaign Builder (Basic)',
    availability: [true, true, true],
    tooltip: 'Basic tool for creating marketing campaigns.',
  },
  {
    name: '247 GBS Co-Branded Partner Branding',
    availability: [true, true, true],
    tooltip: 'Branding as a 247 GBS partner.',
  },
  {
    name: 'Marketing Campaign Builder (Advanced)',
    availability: [false, true, true],
    tooltip: 'Advanced campaign creation tools.',
  },
  {
    name: 'Full Loyalty CardX Customisation',
    availability: [false, true, true],
    tooltip: 'Full customization of loyalty cards.',
  },
  {
    name: 'Advanced Analytics & Insights',
    availability: [false, true, true],
    tooltip: 'Detailed customer insights and performance metrics.',
  },
  {
    name: 'Internal Reward + Loyalty Management',
    availability: [false, true, true],
    tooltip: 'Manage internal rewards and loyalty.',
  },
  {
    name: 'MCOM Co-Branded Marketing Traffic Package',
    availability: [false, true, true],
    tooltip: 'Access to co-branded marketing traffic.',
  },
  {
    name: 'Dedicated Account Support',
    availability: [false, true, true],
    tooltip: 'Dedicated support for your account.',
  },
  {
    name: 'Hyper Local Hub Partnership Eligibility',
    availability: [false, false, true],
    tooltip: 'Eligibility for local hub partnerships.',
  },
  {
    name: 'Advanced Stock Audit & Spare Capacity Monetisation',
    availability: [false, false, true],
    tooltip: 'Advanced tools for stock and monetization.',
  },
  {
    name: 'Full MCOM Product Suite Access (All Features)',
    availability: [false, false, true],
    tooltip: 'Access to all MCOM features.',
  },
  {
    name: 'DealMachine AI for Performance Tracking',
    availability: [false, false, true],
    tooltip: 'AI-powered tool for tracking and optimizing performance.',
  },
  {
    name: 'Seasonal Campaigns (Spring/Summer/Autumn/Winter)',
    availability: [false, false, true],
    tooltip: 'Run campaigns for each season.',
  },
  {
    name: 'White Label Branding (eGift, Loyalty, Dashboard)',
    availability: [false, false, true],
    tooltip: 'White-label branding for various tools.',
  },
  {
    name: 'VistaPrint Integration for Physical Cards',
    availability: [false, false, true],
    tooltip: 'Integrate with VistaPrint for physical cards.',
  },
];

const coBrandedFeatureGroups: FeatureGroup[] = [
  { name: 'Core Access', features: coBrandedFeatures.slice(0, 6) },
  { name: 'Loyalty Tools', features: coBrandedFeatures.slice(6, 10) },
  { name: 'Engagement Tools', features: coBrandedFeatures.slice(10, 13) },
  { name: 'Advanced Integration', features: coBrandedFeatures.slice(13, 17) },
  { name: 'Marketing Advanced', features: coBrandedFeatures.slice(17, 22) },
  {
    name: 'Support and Partnerships',
    features: coBrandedFeatures.slice(22, 24),
  },
  { name: 'Premium Features', features: coBrandedFeatures.slice(24) },
];

interface CoBrandedContentProps {
  listingId: string | null;
}

export default function CoBrandedContent({ listingId }: CoBrandedContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  const handlePayNow = () => {
    setIsTrial(false);
    setIsDialogOpen(true);
  };

  const handleStartTrial = () => {
    setIsTrial(true);
    setIsDialogOpen(true);
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="max-w-7xl mx-auto flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-900">
          Co-Branded Pricing
        </h1>
        <section className="w-full flex flex-col items-center justify-center mb-12">
          <div className="w-full p-6 sm:p-8 bg-white rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* Left Column: Intro + Video */}
              <div className="flex flex-col items-center md:items-start">
                <h2 className="text-2xl sm:text-3xl font-bold text-center md:text-left mb-2">
                  Your Co-Branded Launchpad
                </h2>
                <p className="text-center md:text-left text-gray-600 mb-6 text-base sm:text-lg font-medium">
                  Unlock your brand’s growth with a £365 onboarding fee. Choose
                  from Standard, Pro, or Pro Plus plans and gain access to
                  tools, support, and marketing designed to boost your
                  visibility from day one.
                </p>

                {/* Video Demo */}
                <div className="w-full aspect-video mb-6">
                  <iframe
                    className="w-full h-full rounded-lg shadow-md"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Right Column: Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category 1 */}
                <div className="flex items-start space-x-4">
                  <ShieldCheck className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Verification
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base mt-1">
                      Confirm your business ownership and get listed across the
                      full 247GBS directory network for instant credibility and
                      trust.
                    </p>
                  </div>
                </div>

                {/* Category 2 */}
                <div className="flex items-start space-x-4">
                  <LayoutDashboard className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Dashboard
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base mt-1">
                      Preview the MCOM Dashboard, explore wallet and loyalty
                      features, and try essential tools that give you a taste of
                      what’s ahead.
                    </p>
                  </div>
                </div>

                {/* Category 3 */}
                <div className="flex items-start space-x-4">
                  <Rocket className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Marketing
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base mt-1">
                      Gain exposure with co-branded promotions, your own QR
                      code, and access to seasonal campaigns to attract new
                      customers quickly.
                    </p>
                  </div>
                </div>

                {/* Category 4 */}
                <div className="flex items-start space-x-4">
                  <Headset className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Support
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base mt-1">
                      Get guided onboarding, expert help at every step, and
                      flexible payment options that make launching easier than
                      ever.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-8">
              <Button
                onClick={handlePayNow}
                className="w-full sm:w-1/2 md:w-1/4 text-white bg-orange-600 hover:bg-orange-700"
              >
                Pay Now
              </Button>
              <Button
                onClick={handleStartTrial}
                className="w-full sm:w-1/2 md:w-1/4 border bg-white text-orange-600 border-orange-600 hover:border-orange-700 hover:bg-white"
              >
                Start Trial
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {coBrandedTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingCard
                tier={
                  tier as PricingTier & { accent: 'teal' | 'purple' | 'yellow' }
                }
                isPayg={false}
                listingId={listingId}
              />
            </motion.div>
          ))}
        </div>
        <ComparisonTable
          plans={coBrandedPlans}
          featureGroups={coBrandedFeatureGroups}
          accentHeaders={['blue-900', 'orange-800', 'black-500']}
        />
      </motion.div>
      <PaymentGatewayDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        planName="Co-Branded Launchpad"
        planPrice="£365"
        listingId={listingId}
        isTrial={isTrial}
      />
    </>
  );
}
