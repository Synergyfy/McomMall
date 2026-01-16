'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PricingTier } from '../types';
import PricingCard from './PricingCard';
import { paygTiers, coBrandedTiers as staticCoBrandedTiers } from '../data/pricingData';
import { Tier } from '@/service/tiers/types';
import { Button } from '@/components/ui/button';

interface MobilePricingPageProps {
  activeView: 'payg' | 'cobranded';
  listingId: string | null;
  tiers?: Tier[];
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  setBillingCycle?: (cycle: 'monthly' | 'quarterly' | 'annual') => void;
}

const MobilePricingPage: React.FC<MobilePricingPageProps> = ({
  activeView,
  listingId,
  tiers: dynamicTiers,
  billingCycle = 'annual',
  setBillingCycle,
}) => {
  // If we have dynamic tiers and active view is cobranded, map them.
  // Otherwise use static data.
  let displayTiers: PricingTier[] = [];

  if (activeView === 'cobranded' && dynamicTiers && dynamicTiers.length > 0) {
    displayTiers = dynamicTiers.map((tier) => {
        let price = 0;
        let cycleLabel = '';
        switch (billingCycle) {
          case 'monthly': price = tier.monthly_price; cycleLabel = '/mo'; break;
          case 'quarterly': price = tier.quaterly_price; cycleLabel = '/qtr'; break;
          case 'annual': price = tier.annual_price; cycleLabel = '/yr'; break;
        }

        const formattedPrice = new Intl.NumberFormat('en-GB', {
           style: 'currency', currency: 'GBP'
        }).format(Number(price));

        return {
          name: tier.name,
          price: `${formattedPrice} ${cycleLabel}`,
          primaryFeatures: tier.features,
          colorCode: tier.color_code,
        };
    });
  } else {
    displayTiers = activeView === 'payg' ? paygTiers : staticCoBrandedTiers;
  }

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
            key={tier.name}
            className="flex-shrink-0 w-4/5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <PricingCard
              tier={tier}
              isPayg={activeView === 'payg'}
              listingId={listingId}
              onPayNow={() => {}}
              onStartTrial={() => {}}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobilePricingPage;
