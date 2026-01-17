'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PricingCheckoutClient from './PricingCheckoutClient';
import { useGetTiers } from '@/service/tiers/hook';
import { Tier } from '@/service/tiers/types';
import TiersList from '@/app/dashboard/my-subscription/components/TiersList';

type PlanItem = Tier | {
  name: string;
  price: string;
  primaryFeatures?: string[]
};

export default function PricingPageClient() {
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: string } | null>(null);
  const [isTrial, setIsTrial] = useState(false);

  // We reuse TiersList from subscription page which handles fetching internally if needed,
  // BUT TiersList inside dashboard/my-subscription fetches tiers itself.
  // Wait, TiersList imports useGetTiers.
  // The user wants it to look like /my-subscription.
  // We can reuse TiersList component directly if it fits.
  // Let's check TiersList signature.
  // It takes `onSelectTier`.
  // It handles the cycle toggle internally.

  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  const handleSelectTier = (tier: Tier, cycle: 'monthly' | 'quarterly' | 'annual') => {
      let price = 0;
      switch(cycle) {
        case 'monthly': price = tier.monthly_price; break;
        case 'quarterly': price = tier.quaterly_price; break;
        case 'annual': price = tier.annual_price; break;
      }

      const priceString = new Intl.NumberFormat('en-GB', {
           style: 'currency', currency: 'GBP'
      }).format(Number(price));

      setSelectedTier({
          name: `${tier.name} (${cycle})`,
          price: priceString
      });
      setIsTrial(false);
  };

  if (selectedTier) {
    return (
      <PricingCheckoutClient
        planName={selectedTier.name}
        planPrice={selectedTier.price}
        isTrial={isTrial}
        isPayg={false} // Defaulting to subscription model since we are unifying UI
        listingId={listingId}
      />
    );
  }

  return (
    <div className="h-full md:py-10 md:px-20 flex flex-col items-center overflow-y-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-semibold">
          McomMall Packages and Pricing
        </h1>
        <p className="text-lg md:text-xl text-gray-800 font-medium mt-2">
          Select the package that serves your need.
        </p>
      </header>

      <section className="w-full flex flex-col items-center">
        <h3 className="text-xl md:text-2xl font-medium text-center mb-6">
            Select your plan
        </h3>
        {/* We can reuse the TiersList component from my-subscription to get the exact same look */}
        <TiersList onSelectTier={handleSelectTier} />
      </section>
    </div>
  );
}
