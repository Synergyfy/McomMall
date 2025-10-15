
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Star, Gift } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VoucherTabContent from '@/app/(public)/listings/[id]/components/VoucherTabContent';
import { InHouseBusiness } from '@/service/listings/types';
import Link from 'next/link';
import LoyaltyContent from '@/components/LoyaltyContent';

interface PromotionsSectionProps {
  listing: InHouseBusiness;
}

export default function PromotionsSection({ listing }: PromotionsSectionProps) {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => setIsVoucherModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Vouchers</CardTitle>
              <Ticket className="h-6 w-6 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Click to view and purchase vouchers.
              </p>
            </CardContent>
          </Card>
          <Card
            className="rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => setIsLoyaltyModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Loyalty & Rewards</CardTitle>
              <Star className="h-6 w-6 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Information on our loyalty program and rewards.
              </p>
            </CardContent>
          </Card>
          <Link href={`/listings/${listing.id}/gift-card`} passHref>
            <Card className="rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Gift Cards</CardTitle>
                <Gift className="h-6 w-6 text-orange-600" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Purchase and use our gift cards.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vouchers</DialogTitle>
          </DialogHeader>
          <VoucherTabContent businessId={listing.id} />
        </DialogContent>
      </Dialog>

      <Dialog open={isLoyaltyModalOpen} onOpenChange={setIsLoyaltyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Loyalty & Rewards</DialogTitle>
          </DialogHeader>
          <LoyaltyContent businessId={listing.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
