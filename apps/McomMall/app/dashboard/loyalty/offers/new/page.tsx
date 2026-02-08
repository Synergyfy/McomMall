'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAddOffer } from '@/service/offers/hook';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import OfferForm from '../components/offer-form';
import { CreateOfferDto, UpdateOfferDto } from '@/service/offers/types';

export default function CreateOfferPage() {
  const router = useRouter();
  const createOffer = useAddOffer();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: CreateOfferDto | UpdateOfferDto) => {
    try {
      await createOffer.mutateAsync(data as CreateOfferDto);
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">
              Create Offer
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
          onSubmit={handleSubmit}
          isPending={createOffer.isPending}
          submitButtonText="Create Offer"
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
            <DialogTitle className="text-center">Offer Created!</DialogTitle>
            <DialogDescription className="text-center">
              Your new offer has been created successfully.
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
