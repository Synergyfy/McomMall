'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PricingTier } from '../types';
import PricingCard from './PricingCard';
import { paygTiers, coBrandedTiers } from '../data/pricingData';

interface MobilePricingPageProps {
  activeView: 'payg' | 'cobranded';
  listingId: string | null;
}

const MobilePricingPage: React.FC<MobilePricingPageProps> = ({
  activeView,
  listingId,
}) => {
  const tiers = activeView === 'payg' ? paygTiers : coBrandedTiers;

  return (
    <div className="block md:hidden w-full">
      <div className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            className="flex-shrink-0 w-4/5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <PricingCard
              tier={
                tier as PricingTier & { accent: 'teal' | 'purple' | 'yellow' }
              }
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
