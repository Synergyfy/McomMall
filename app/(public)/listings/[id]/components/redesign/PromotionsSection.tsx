
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

export default function PromotionsSection({ listing }: PromotionsSectionProps) {
  const { giftCard, voucher, promotion } = listing;

  const availableTabs = [
    { value: 'voucher', label: 'Vouchers', enabled: voucher },
    { value: 'loyalty', label: 'Loyalty & Rewards', enabled: promotion },
    { value: 'gift-card', label: 'Gift Cards', enabled: giftCard },
  ].filter(tab => tab.enabled);

  if (availableTabs.length === 0) {
    return null;
  }

  const defaultTab = availableTabs[0].value;

  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Promotions</h2>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full ${getGridColsClass(availableTabs.length)}`}>
          {availableTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
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
      </Tabs>
    </motion.div>
  );
}
