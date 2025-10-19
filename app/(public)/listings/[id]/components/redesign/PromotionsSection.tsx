
'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoucherTabContent from '@/app/(public)/listings/[id]/components/VoucherTabContent';
import { InHouseBusiness } from '@/service/listings/types';
import LoyaltyContent from '@/components/LoyaltyContent';
import GiftCardTabContent from '@/app/(public)/listings/[id]/components/GiftCardTabContent';

interface PromotionsSectionProps {
  listing: InHouseBusiness;
}

import { useState } from 'react';

export default function PromotionsSection({ listing }: PromotionsSectionProps) {
  const { giftCard, voucher, promotion } = listing;
  const [activeTab, setActiveTab] = useState('');

  const availableTabs = [
    { value: 'voucher', label: 'Vouchers', enabled: voucher },
    {
      value: 'loyalty',
      label: 'Loyalty & Rewards',
      enabled: promotion,
    },
    { value: 'gift-card', label: 'Gift Cards', enabled: giftCard },
  ].filter((tab) => tab.enabled);

  if (availableTabs.length === 0) {
    return null;
  }

  const defaultTab = availableTabs[0].value;
  if (!activeTab) {
    setActiveTab(defaultTab)
  }

  const getGridColsClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'sm:grid-cols-2';
    return 'sm:grid-cols-3';
  };

  const getTabLabel = (value: string) => {
    const tab = availableTabs.find(t => t.value === value);
    return tab ? tab.label : '';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Exclusive <span className="text-orange-600">Promotions</span>
        </h2>
        <Tabs
          defaultValue={defaultTab}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList
            className={`grid w-full ${getGridColsClass(
              availableTabs.length,
            )} h-auto p-2 bg-orange-100/50 rounded-lg gap-2`}
          >
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-lg font-semibold text-orange-800/80 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md rounded-md py-3 transition-all duration-300 border-2 border-transparent data-[state=active]:border-orange-600"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-8 p-6 border-2 border-orange-600/80 rounded-lg bg-white shadow-lg">
            <h3 className="text-3xl font-bold text-orange-600 mb-6 text-center">
              {getTabLabel(activeTab)}
            </h3>
            {voucher && (
              <TabsContent value="voucher">
                <VoucherTabContent businessId={listing.id} />
              </TabsContent>
            )}
            {promotion && (
              <TabsContent value="loyalty">
                <LoyaltyContent businessId={listing.id} />
              </TabsContent>
            )}
            {giftCard && (
              <TabsContent value="gift-card">
                <GiftCardTabContent businessId={listing.id} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
}
