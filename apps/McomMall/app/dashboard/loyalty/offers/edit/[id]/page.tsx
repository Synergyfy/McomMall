'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetOfferById, useUpdateOffer } from '@/service/offers/hook';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import OfferForm from '../../components/offer-form';
import { UpdateOfferDto, CreateOfferDto } from '@/service/offers/types';

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;

  const { data: offer, isLoading: isLoadingOffer } = useGetOfferById(offerId);
  const updateOffer = useUpdateOffer();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: CreateOfferDto | UpdateOfferDto) => {
    try {
      await updateOffer.mutateAsync({ id: offerId, ...(data as UpdateOfferDto) });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to update offer:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;
      toast.error(
        typeof message === 'string'
          ? message
          : 'Failed to update offer. Please try again.'
      );
    }
  };

  if (isLoadingOffer) {
    return <div>Loading...</div>;
  }

  const initialData = offer
    ? {
        name: offer.name,
        description: offer.description || '',
        points: offer.points.toString(),
        beginDate: offer.beginDate ? new Date(offer.beginDate) : undefined,
        endDate: offer.endDate ? new Date(offer.endDate) : undefined,
        rewardCouponType: offer.rewardCouponType,
        discountAmount: offer.discountAmount?.toString() || '',
        discountPercentage: offer.discountPercentage?.toString() || '',
        freeProductId: offer.freeProductId || '',
        bonusPoints: offer.bonusPoints?.toString() || '',
        limitUsageToXProducts: offer.limitUsageToXProducts?.toString() || '',
        expireAfterXDays: offer.expireAfterXDays?.toString() || '',
        allowFreeShipping: offer.allowFreeShipping || false,
        individualUseOnly: offer.individualUseOnly || false,
        excludeSaleItems: offer.excludeSaleItems || false,
        limitPerCustomer: offer.limitPerCustomer?.toString() || '',
        allowLimitToReset: offer.allowLimitToReset || false,
        includedProductIds: offer.includedProducts?.map(p => p.id) || [],
        excludedProductIds: offer.excludedProducts?.map(p => p.id) || [],
        offerScope: offer.offerScope,
        businessIds: offer.businesses?.map(b => b.id) || [],
      }
    : {};

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">
              Edit Offer
            </h1>
            <div className="text-base text-gray-500 flex items-center space-x-1">
              <span>Home</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Offers</span>
            </div>
          </div>
        </header>

        <OfferForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isPending={updateOffer.isPending}
          submitButtonText="Update Offer"
        />
      </div>
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent>
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle className="h-6 w-6 text-green-600" />
            </motion.div>
            <DialogTitle className="text-center">Offer Updated!</DialogTitle>
            <DialogDescription className="text-center">
              The offer has been updated successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => router.push('/dashboard/loyalty/offers')}>
              Go to Offers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
