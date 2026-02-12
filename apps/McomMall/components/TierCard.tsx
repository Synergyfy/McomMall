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
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  onSelect: (tier: Tier) => void;
  onStartTrial?: (tier: Tier) => void;
}

export default function TierCard({
  tier,
  billingCycle = 'monthly', // Default to monthly if not provided
  onSelect,
  onStartTrial,
}: TierCardProps) {
  let price = 0;
  let cycleLabel = '';

  switch (billingCycle) {
    case 'monthly':
      price = tier.monthly_price;
      cycleLabel = '/mo';
      break;
    case 'quarterly':
      price = tier.quaterly_price;
      cycleLabel = '/qtr';
      break;
    case 'annual':
      price = tier.annual_price;
      cycleLabel = '/yr';
      break;
  }

  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(Number(price));

  // Use color_code or fallback to default
  const themeColor = tier.color_code || '#EA580C'; // Default to orange-600
  const seasonBg = tier.season?.bgColor;
  const seasonText = tier.season?.textColor;

  // Extract quotas for display
  const { quotas } = tier.configuration;

  // Define quota items to display
  const quotaItems = [
    { label: `${quotas.maxListings} Listings`, value: quotas.maxListings > 0 },
    { label: `${quotas.maxProducts} Products`, value: quotas.maxProducts > 0 },
    { label: `${quotas.maxServices} Services`, value: quotas.maxServices > 0 },
    { label: `${quotas.maxCouponTemplates} Coupon Templates`, value: quotas.maxCouponTemplates > 0 },
    { label: `${quotas.maxGiftCardTemplates} Gift Card Templates`, value: quotas.maxGiftCardTemplates > 0 },
    { label: `${quotas.maxLoyaltyPrograms} Loyalty Programs`, value: quotas.maxLoyaltyPrograms > 0 },
    { label: `${quotas.maxImagesPerListing} Images Per Listing`, value: quotas.maxImagesPerListing > 0 },
    { label: 'Product Listing Allowed', value: quotas.allowProductListing },
    { label: 'Service Listing Allowed', value: quotas.allowServiceListing },
  ].filter(item => item.value); // Only show positive quotas/allowed features

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="flex flex-col h-full bg-white border-2 shadow-md relative overflow-hidden"
        style={{ borderColor: themeColor }}
      >
        {tier.season && (
          <div
            className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg"
            style={{
              backgroundColor: seasonBg || themeColor,
              color: seasonText || '#fff'
            }}
          >
            {tier.season.name}
          </div>
        )}

        <CardHeader>
          <CardTitle
            className="text-lg sm:text-xl font-bold"
            style={{ color: themeColor }}
          >
            {tier.name}
          </CardTitle>
          <h3
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: themeColor }}
          >
            {formattedPrice}
            <span className="text-sm font-normal text-gray-500 ml-1">
              {cycleLabel}
            </span>
          </h3>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Quotas Section */}
          {quotaItems.length > 0 && (
            <ul className="space-y-2 mb-4">
              {quotaItems.map((item, index) => (
                <li key={`quota-${index}`} className="flex items-start text-sm text-gray-700 font-medium">
                  <Check
                    className="mr-2 h-4 w-4 flex-shrink-0 mt-1"
                    style={{ color: themeColor }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}

          {/* Existing Features Section */}
          {tier.features.length > 0 && (
            <>
              <hr className="border-gray-100 my-2" />
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <Check
                      className="mr-2 h-4 w-4 flex-shrink-0 mt-1"
                      style={{ color: themeColor }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={() => onSelect(tier)}
            className="w-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: themeColor }}
          >
            {onStartTrial ? 'Pay Now' : 'Choose Plan'}
          </Button>
          {onStartTrial && (
            <Button
              onClick={() => onStartTrial(tier)}
              className="w-full bg-white hover:bg-gray-50 transition-colors border-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Start 7-Day Trial
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
