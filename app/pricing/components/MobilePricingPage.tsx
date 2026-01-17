'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TierCard from '@/components/TierCard';
import { Tier } from '@/service/tiers/types';
import { Button } from '@/components/ui/button';

type PlanItem = Tier | {
  name: string;
  price: string;
  primaryFeatures?: string[]
};

interface MobilePricingPageProps {
  activeView: 'payg' | 'cobranded';
  listingId: string | null;
  tiers?: Tier[];
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  setBillingCycle?: (cycle: 'monthly' | 'quarterly' | 'annual') => void;
  onPayNow: (tier: PlanItem) => void;
  onStartTrial: (tier: PlanItem) => void;
}

const MobilePricingPage: React.FC<MobilePricingPageProps> = ({
  activeView,
  listingId,
  tiers,
  billingCycle = 'annual',
  setBillingCycle,
  onPayNow,
  onStartTrial,
}) => {

  const displayTiers = tiers || [];

  return (
    <div className="block md:hidden w-full">
      {activeView === 'cobranded' && setBillingCycle && (
        <div className="flex justify-center space-x-2 mb-4">
             <Button
               variant={billingCycle === 'monthly' ? 'default' : 'outline'}
               onClick={() => setBillingCycle('monthly')}
               size="sm"
               className={billingCycle === 'monthly' ? 'bg-orange-600 hover:bg-orange-700' : ''}
             >
               Monthly
             </Button>
             <Button
               variant={billingCycle === 'quarterly' ? 'default' : 'outline'}
               onClick={() => setBillingCycle('quarterly')}
               size="sm"
               className={billingCycle === 'quarterly' ? 'bg-orange-600 hover:bg-orange-700' : ''}
             >
               Qtr
             </Button>
             <Button
               variant={billingCycle === 'annual' ? 'default' : 'outline'}
               onClick={() => setBillingCycle('annual')}
               size="sm"
               className={billingCycle === 'annual' ? 'bg-orange-600 hover:bg-orange-700' : ''}
             >
               Annual
             </Button>
        </div>
      )}

      <div className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide">
        {displayTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            className="flex-shrink-0 w-4/5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <TierCard
              tier={tier}
              billingCycle={billingCycle}
              onSelect={onPayNow}
              onStartTrial={onStartTrial}
            />
          </motion.div>
        ))}
        {displayTiers.length === 0 && (
           <div className="text-center w-full p-4 text-gray-500">
              No plans available at the moment.
           </div>
        )}
      </div>
    </div>
  );
};

export default MobilePricingPage;
