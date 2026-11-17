'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  CheckCircle,
  Coins,
  CalendarDays,
  TicketPercent,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAddOffer } from '@/service/offers/hook';
import OfferForm, { OfferFormValues } from '../components/offer-form';
import { CreateOfferDto, UpdateOfferDto } from '@/service/offers/types';

const couponTypeLabels: Record<string, string> = {
  FIXED_CART_DISCOUNT: 'Voucher',
  PERCENTAGE_DISCOUNT: 'Discount',
  FREE_PRODUCTS: 'Free Item',
  BONUS_POINTS: 'Bonus Points',
};

function OfferPreview({ values }: { values: OfferFormValues | null }) {
  const title = values?.name.trim();
  const points = values?.points;
  const typeLabel = values?.rewardCouponType
    ? couponTypeLabels[values.rewardCouponType]
    : undefined;

  const rewardSummary =
    values?.rewardCouponType === 'PERCENTAGE_DISCOUNT' && values.discountPercentage
      ? `${values.discountPercentage}% off`
      : values?.rewardCouponType === 'FIXED_CART_DISCOUNT' && values.discountAmount
        ? `${values.discountAmount} off your cart`
        : values?.rewardCouponType === 'BONUS_POINTS' && values.bonusPoints
          ? `+${values.bonusPoints} bonus points`
          : values?.rewardCouponType === 'FREE_PRODUCTS' && values.freeProductId
            ? 'A free product'
            : undefined;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Live Preview</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          How the reward card will look to your customers.
        </p>
      </div>

      <motion.div
        whileHover={{ y: -2 }}
        className="overflow-hidden rounded-2xl border border-[#efe3dc] bg-white shadow-[0_2px_12px_rgba(31,27,24,0.05)]"
      >
        <div className="relative h-36 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600">
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 text-white">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-orange-700/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                {typeLabel || 'Reward'}
              </span>
              {values?.endDate && (
                <span className="text-[9px] font-bold text-orange-100">
                  Exp. {values.endDate.toLocaleDateString()}
                </span>
              )}
            </div>
            <h3 className="mt-1.5 truncate text-base font-bold">
              {title || 'Your offer title'}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-orange-100">
              <Coins className="h-3 w-3" />
              {points || '0'} points required
            </p>
          </div>
        </div>

        <div className="space-y-2.5 p-4">
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
            {values?.description.trim() ||
              'Add a description to help customers understand this reward.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {rewardSummary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-[#a14000] ring-1 ring-orange-100">
                <TicketPercent className="h-3 w-3" />
                {rewardSummary}
              </span>
            )}
            {values?.expireAfterXDays && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
                <CalendarDays className="h-3 w-3" />
                {values.expireAfterXDays} day expiry
              </span>
            )}
            {values?.includedProductIds.length ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
                <Gift className="h-3 w-3" />
                {values.includedProductIds.length} product(s)
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CreateOfferPage() {
  const router = useRouter();
  const createOffer = useAddOffer();
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewValues, setPreviewValues] = useState<OfferFormValues | null>(
    null
  );
  const [publishedTitle, setPublishedTitle] = useState('');

  const handleSubmit = async (data: CreateOfferDto | UpdateOfferDto) => {
    const payload = data as CreateOfferDto;
    try {
      await createOffer.mutateAsync(payload);
      setPublishedTitle(payload.name || 'Your offer');
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to publish offer:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;
      toast.error(
        typeof message === 'string'
          ? message
          : 'Failed to publish offer. Please try again.'
      );
    }
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    router.push('/dashboard/loyalty/offers');
  };

  return (
    <div className="-mx-2 -mt-2 min-h-full bg-[#faf7f5] px-4 py-6 sm:-mx-5 sm:-mt-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── BACK NAVIGATION ── */}
        <Link
          href="/dashboard/loyalty/offers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Offers
        </Link>

        {/* ── HEADER ── */}
        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
            Create Redemption Offer
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
            Design a new reward to delight your loyal customers and drive
            repeat visits.
          </p>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <OfferForm
            onSubmit={handleSubmit}
            isPending={createOffer.isPending}
            submitButtonText="Publish Offer"
            onChange={setPreviewValues}
          />

          <aside className="hidden xl:sticky xl:top-6 xl:block">
            <OfferPreview values={previewValues} />
          </aside>
        </div>
      </div>

      {/* ── SUCCESS MODAL DIALOG ── */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSuccessClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-sm space-y-4 rounded-2xl border border-[#f7ece7] bg-white p-6 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-[#a14000]">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                  Offer Published!
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {publishedTitle}
                  </span>{' '}
                  is now active and can be redeemed by customers using their
                  points.
                </p>
              </div>
              <button
                onClick={handleSuccessClose}
                className="w-full rounded-xl bg-[#a14000] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              >
                Go to Offers
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
