'use client';

import { motion } from 'framer-motion';
import { PaygOption } from '@/service/payments/types';

interface SubscriptionSummaryProps {
  planName: string;
  planPrice: string;
  isTrial: boolean;
  isPayg?: boolean;
  paygOption?: PaygOption;
  totalPrice: number;
}

export default function SubscriptionSummary({
  planName,
  planPrice,
  isTrial,
  isPayg,
  paygOption,
  totalPrice,
}: SubscriptionSummaryProps) {
  const getPaygOptionString = (option?: PaygOption) => {
    if (!option) return '';
    switch (option) {
      case PaygOption.NINETY_DAYS:
        return ' (90 Days)';
      case PaygOption.ONE_EIGHTY_DAYS:
        return ' (180 Days)';
      case PaygOption.TWO_SEVENTY_DAYS:
        return ' (270 Days)';
      default:
        return '';
    }
  };

  const planTypeString = isPayg ? 'Pay As You Go' : 'Co-Branded';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-800">Order Summary</h2>
      <div>
        <h3 className="text-xl font-bold text-gray-800">{planName}</h3>
        <p className="text-lg text-gray-600">
          {planTypeString}
          {isPayg && getPaygOptionString(paygOption)}
        </p>
        <p className="text-lg text-gray-600">{planPrice}</p>
        {isTrial && (
          <p className="text-sm text-gray-500">
            Includes a £1.00 verification fee for the trial.
          </p>
        )}
      </div>
      <div className="mt-8 border-t-2 border-gray-100 pt-6 space-y-3">
        <div className="flex items-center justify-between text-lg">
          <p className="text-gray-600">Subtotal</p>
          <p className="font-semibold text-gray-800">
            £{totalPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center justify-between text-2xl font-bold text-gray-800 pt-2 border-t-2 border-gray-100 mt-2">
          <p>Total</p>
          <p>£{totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
}
