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
import { redirectToMcomSolutionsSubscription } from '@/service/auth/hook';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function MySubscriptionPageClient() {
  const router = useRouter();
  const { data: subscriptionStatus, isLoading } = useGetMyMembership();
  const [selectedTier, setSelectedTier] = useState<{ tier: Tier; cycle: 'monthly' | 'quarterly' | 'annual' } | null>(null);
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  const handleSelectTier = async (tier: Tier, cycle: 'monthly' | 'quarterly' | 'annual') => {
    setSelectedTier({ tier, cycle });
  };

  const mapCycleToPlanType = (cycle: string): PlanType => {
    switch (cycle) {
      case 'monthly': return PlanType.MONTHLY;
      case 'quarterly': return PlanType.QUARTERLY;
      case 'annual': return PlanType.ANNUAL;
      default: return PlanType.MONTHLY;
    }
  };

  const hasActivePlan = subscriptionStatus?.isActive || subscriptionStatus?.status === 'active' || subscriptionStatus?.status === 'paid';

  if (selectedTier) {
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

    const priceString = `£${price.toFixed(2)}`;
    const planType = mapCycleToPlanType(selectedTier.cycle);

    return (
      <PricingCheckoutClient
        planName={`${selectedTier.tier.name} (${selectedTier.cycle})`}
        planPrice={priceString}
        isTrial={false}
        isPayg={false}
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

      {!hasActivePlan && !isLoading && (
        <div className="w-full max-w-4xl mb-10">
          <div className="border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/50 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <Lock className="w-7 h-7 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Upgrade Required
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Unlock advanced platform features by subscribing to a platform plan.
            </p>
            <Button
              size="lg"
              onClick={() => redirectToMcomSolutionsSubscription()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:shadow-orange-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Subscribe to Mcom Mall
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {hasActivePlan && (
        <section className="w-full flex flex-col items-center">
          <h3 className="text-xl md:text-2xl font-medium text-center mb-6">
            Change your plan
          </h3>
          <TiersList onSelectTier={handleSelectTier} />
        </section>
      )}
    </div>
  );
}
