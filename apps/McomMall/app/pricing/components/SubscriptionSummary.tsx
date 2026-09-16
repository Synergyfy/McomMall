'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Layers } from 'lucide-react';
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
        return ' · 90 Days';
      case PaygOption.ONE_EIGHTY_DAYS:
        return ' · 180 Days';
      case PaygOption.TWO_SEVENTY_DAYS:
        return ' · 270 Days';
      default:
        return '';
    }
  };

  const planTypeString = isPayg
    ? `Pay As You Go${getPaygOptionString(paygOption)}`
    : 'Membership · one-off payment';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6900] to-[#a14000] text-white shadow-lg shadow-orange-600/25">
          <Layers className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-extrabold text-gray-900">
            {planName}
          </h3>
          <p className="text-sm text-gray-500">{planTypeString}</p>
        </div>
      </div>

      {isTrial && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <BadgeCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            Includes a £1.00 verification fee for the trial.
          </p>
        </div>
      )}

      <dl className="mt-6 space-y-3 border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="truncate text-gray-500">
            {isTrial ? 'Trial verification' : planName}
          </dt>
          <dd className="shrink-0 font-bold text-gray-800">
            {isTrial ? '£1.00' : planPrice}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
          <dt className="text-base font-extrabold text-gray-900">
            Total due today
          </dt>
          <dd className="text-2xl font-black text-[#ff6900]">
            £{totalPrice.toFixed(2)}
          </dd>
        </div>
      </dl>
      {!isPayg && (
        <p className="mt-2 text-right text-[11px] text-gray-400">
          One-off payment · no auto-renewal
        </p>
      )}
    </motion.div>
  );
}
