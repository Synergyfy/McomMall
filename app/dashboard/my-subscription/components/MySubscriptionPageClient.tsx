'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetSubscriptionStatus } from '@/service/payments/hook';
import CurrentPlanCard from './CurrentPlanCard';
import TiersList from './TiersList';
import PricingCheckoutClient from '@/app/pricing/components/PricingCheckoutClient';
import { Tier } from '@/service/tiers/types';

export default function MySubscriptionPageClient() {
  const { data: subscriptionStatus, isLoading } = useGetSubscriptionStatus();
  const [selectedTier, setSelectedTier] = useState<{ tier: Tier; cycle: 'monthly' | 'annual' } | null>(null);
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  const handleSelectTier = (tier: Tier, cycle: 'monthly' | 'annual') => {
    setSelectedTier({ tier, cycle });
  };

  if (selectedTier) {
    const price = selectedTier.cycle === 'monthly' ? selectedTier.tier.monthlyPrice : selectedTier.tier.annualPrice;

    // Ensure price is formatted as a string for the checkout component
    // If it's a number, convert to string. If string, keep it.
    // The PricingCheckoutClient expects a string like "£10.00" or just "10.00" (it strips non-numeric chars).
    // Let's format it nicely if it's not already.
    const priceString = typeof price === 'number'
      ? `£${price.toFixed(2)}`
      : price.toString();

    return (
      <PricingCheckoutClient
        planName={`${selectedTier.tier.name} (${selectedTier.cycle})`}
        planPrice={priceString}
        isTrial={false}
        isPayg={false} // Treat dynamic tiers as Co-Branded/Subscription
        listingId={listingId}
      />
    );
  }

  return (
    <div className="h-full md:py-10 md:px-20 flex flex-col items-center overflow-y-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-semibold">
          My Subscription
        </h1>
        <p className="text-xl text-gray-800 font-medium">
          View your current subscription and manage your plan.
        </p>
      </header>

      {isLoading && <p>Loading...</p>}

      {subscriptionStatus && (
        <div className="mb-10 w-full max-w-4xl">
           <CurrentPlanCard subscription={subscriptionStatus} />
        </div>
      )}

      <section className="w-full flex flex-col items-center">
        <h3 className="text-xl md:text-2xl font-medium text-center mb-6">
            Select your plan
        </h3>
        <TiersList onSelectTier={handleSelectTier} />
      </section>
    </div>
  );
}
