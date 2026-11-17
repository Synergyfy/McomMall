'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
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
      }
    : {};

  return (
    <div className="-mx-2 -mt-2 min-h-full bg-[#faf7f5] px-4 py-6 sm:-mx-5 sm:-mt-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/dashboard/loyalty/offers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Offers
        </Link>

        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
            Edit Offer
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
            Update the details, reward rules and restrictions for this offer.
          </p>
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
