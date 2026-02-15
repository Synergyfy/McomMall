'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetMyMembership } from '@/service/membership/hooks';
import CurrentPlanCard from './CurrentPlanCard';
import TiersList from './TiersList';
import PricingCheckoutClient from '@/app/pricing/components/PricingCheckoutClient';
import { Tier } from '@/service/tiers/types';
import { PlanType } from '@/service/payments/types';
import { useRouter } from 'next/navigation';

export default function MySubscriptionPageClient() {
  const router = useRouter();
  const { data: subscriptionStatus, isLoading } = useGetMyMembership();
  const [selectedTier, setSelectedTier] = useState<{ tier: Tier; cycle: 'monthly' | 'quarterly' | 'annual'; isTrial: boolean } | null>(null);
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  const handleSelectTier = async (tier: Tier, cycle: 'monthly' | 'quarterly' | 'annual', isTrial: boolean = false) => {
    if (isTrial) {
      router.push(`/dashboard/my-subscription/trial-confirmation?tierId=${tier.id}&tierName=${encodeURIComponent(tier.name)}`);
    } else {
      setSelectedTier({ tier, cycle, isTrial });
    }
  };

  const mapCycleToPlanType = (cycle: string): PlanType => {
    switch (cycle) {
      case 'monthly': return PlanType.MONTHLY;
      case 'quarterly': return PlanType.QUARTERLY;
      case 'annual': return PlanType.ANNUAL;
      default: return PlanType.MONTHLY;
    }
  };

  if (selectedTier && !selectedTier.isTrial) {
    let price: number = 0;
    switch (selectedTier.cycle) {
      case 'monthly':
        price = selectedTier.tier.monthly_price;
        break;
      case 'quarterly':
        price = selectedTier.tier.quaterly_price;
        break;
      case 'annual':
        price = selectedTier.tier.annual_price;
        break;
    }

    // Ensure price is formatted as a string for the checkout component
    const priceString = `£${price.toFixed(2)}`;
    const planType = mapCycleToPlanType(selectedTier.cycle);

    return (
      <PricingCheckoutClient
        planName={`${selectedTier.tier.name} (${selectedTier.cycle})`}
        planPrice={priceString}
        isTrial={false}
        isPayg={false} // Treat dynamic tiers as Co-Branded/Subscription
        listingId={listingId}
        tierId={selectedTier.tier.id}
        planType={planType}
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
