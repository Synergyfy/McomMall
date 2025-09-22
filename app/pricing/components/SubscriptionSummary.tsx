'use client';

import { motion } from 'framer-motion';

interface SubscriptionSummaryProps {
  planName: string;
  planPrice: string;
  isTrial: boolean;
  discount: number;
  totalPrice: number;
}

export default function SubscriptionSummary({
  planName,
  planPrice,
  isTrial,
  discount,
  totalPrice,
}: SubscriptionSummaryProps) {
  const getPriceAsNumber = (price: string) => {
    const numericPart = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericPart);
  };

  const basePrice = isTrial ? 1.0 : getPriceAsNumber(planPrice) + 1.0;

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
            £{basePrice.toFixed(2)}
          </p>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-lg text-green-600">
            <p>Discount</p>
            <p className="font-semibold">-£{discount.toFixed(2)}</p>
          </div>
        )}
        <div className="flex items-center justify-between text-2xl font-bold text-gray-800 pt-2 border-t-2 border-gray-100 mt-2">
          <p>Total</p>
          <p>£{totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
}
