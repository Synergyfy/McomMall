import { useState } from 'react';
import { useGetTiers } from '@/service/tiers/hook';
import TierCard from './TierCard';
import { Button } from '@/components/ui/button';
import { Tier } from '@/service/tiers/types';

export default function TiersList() {
  const { data: tiers, isLoading, isError } = useGetTiers();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (isLoading) {
    return <div className="text-center py-10">Loading plans...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load plans. Please try again later.
      </div>
    );
  }

  const handleSelectTier = (tier: Tier) => {
    // Placeholder for selection logic
    console.log('Selected tier:', tier, billingCycle);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex space-x-4 mb-8">
        <Button
          variant={billingCycle === 'monthly' ? 'default' : 'outline'}
          onClick={() => setBillingCycle('monthly')}
          className={billingCycle === 'monthly' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === 'annual' ? 'default' : 'outline'}
          onClick={() => setBillingCycle('annual')}
          className={billingCycle === 'annual' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          Annual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        {tiers?.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            billingCycle={billingCycle}
            onSelect={handleSelectTier}
          />
        ))}
      </div>
    </div>
  );
}
