'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ApplicableOffer } from '@/service/offers/types';
import { Loader } from 'lucide-react';

interface ApplicableOffersProps {
  offers: ApplicableOffer[];
  onApply: (offerId: string) => void;
  isLoading: boolean;
}

export default function ApplicableOffers({
  offers,
  onApply,
  isLoading,
}: ApplicableOffersProps) {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const handleApply = () => {
    if (selectedOffer) {
      onApply(selectedOffer);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader className="animate-spin text-orange-600" />
      </div>
    );
  }

  if (offers.length === 0) {
    return <p className="text-gray-500">No offers available for you.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 sm:mt-8"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Available Offers
      </h3>
      <RadioGroup onValueChange={setSelectedOffer} value={selectedOffer || ''} className="space-y-3">
        {offers.map((offer) => (
          <Label
            key={offer.offerId}
            htmlFor={offer.offerId}
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer has-[:checked]:bg-orange-50 has-[:checked]:border-orange-500"
          >
            <RadioGroupItem value={offer.offerId} id={offer.offerId} />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{offer.offerName}</p>
              <p className="text-sm text-gray-500">
                Cost: {offer.pointsCost} points
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
      <Button
        onClick={handleApply}
        disabled={!selectedOffer || isLoading}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 h-12 text-lg"
      >
        {isLoading ? 'Applying...' : 'Apply Offer'}
      </Button>
    </motion.div>
  );
}
