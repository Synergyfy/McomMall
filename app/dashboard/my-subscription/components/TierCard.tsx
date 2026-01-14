import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Tier } from '@/service/tiers/types';

interface TierCardProps {
  tier: Tier;
  billingCycle: 'monthly' | 'annual';
  onSelect: (tier: Tier) => void;
}

export default function TierCard({
  tier,
  billingCycle,
  onSelect,
}: TierCardProps) {
  const price =
    billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(Number(price));

  const generateFeatures = (tier: Tier) => {
    const features: string[] = [];
    const { quotas, featureFlags } = tier.configuration;

    if (quotas.maxListings > 0) features.push(`Up to ${quotas.maxListings} Listings`);
    if (quotas.maxProducts > 0) features.push(`Up to ${quotas.maxProducts} Products`);
    if (quotas.maxServices > 0) features.push(`Up to ${quotas.maxServices} Services`);
    if (quotas.maxImagesPerListing > 0) features.push(`${quotas.maxImagesPerListing} Images per Listing`);

    if (quotas.maxCouponTemplates > 0) features.push(`Up to ${quotas.maxCouponTemplates} Coupon Templates`);
    if (quotas.maxLoyaltyPrograms > 0) features.push(`Up to ${quotas.maxLoyaltyPrograms} Loyalty Programs`);
    if (quotas.maxGiftCardTemplates > 0) features.push(`Up to ${quotas.maxGiftCardTemplates} Gift Card Templates`);
    if (quotas.featuredListingAllowance > 0) features.push(`${quotas.featuredListingAllowance} Featured Listings`);

    if (quotas.allowProductListing) features.push('Product Listings Enabled');
    if (quotas.allowServiceListing) features.push('Service Listings Enabled');

    if (featureFlags.priorityInSearch) features.push('Priority in Search Results');
    if (featureFlags.advancedAnalytics) features.push('Advanced Analytics');
    if (featureFlags.dedicatedSupport) features.push('Dedicated Support');
    if (featureFlags.allowCustomBranding) features.push('Custom Branding');
    if (featureFlags.allowGroupCreation) features.push('Group Creation');

    return features;
  };

  const features = generateFeatures(tier);

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-white border-2 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
            {tier.name}
          </CardTitle>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
            {formattedPrice}
            <span className="text-sm font-normal text-gray-500 ml-1">
              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          </h3>
          {tier.description && (
            <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-sm text-gray-700"
              >
                <Check className="mr-2 h-4 w-4 text-blue-900 flex-shrink-0 mt-1" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => onSelect(tier)}
            className="w-full text-white bg-orange-600 hover:bg-orange-700"
          >
            Choose Plan
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
