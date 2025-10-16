
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Promotions</h2>
      <Tabs defaultValue="voucher" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voucher">Vouchers</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty & Rewards</TabsTrigger>
          <TabsTrigger value="gift-card">Gift Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="voucher">
          <VoucherTabContent businessId={listing.id} />
        </TabsContent>
        <TabsContent value="loyalty">
          <LoyaltyContent businessId={listing.id} />
        </TabsContent>
        <TabsContent value="gift-card">
          <GiftCardTabContent businessId={listing.id} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
