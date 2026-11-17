'use client';

import {
  Award,
  Calendar,
  Coins,
  Gift,
  Sparkles,
  TicketPercent,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useGetPublicBusinessOffers } from '@/service/offers/hook';
import { Offer } from '@/service/offers/types';
import { CURRENCY } from '@/lib/utils';

type LoyaltyContentProps = {
  businessId?: string;
  productId?: string;
};

const rewardTypeLabel: Record<Offer['rewardCouponType'], string> = {
  PERCENTAGE_DISCOUNT: 'Discount',
  FIXED_CART_DISCOUNT: 'Voucher',
  FREE_PRODUCTS: 'Free Item',
  BONUS_POINTS: 'Bonus Points',
};

function rewardHeadline(offer: Offer): string | null {
  switch (offer.rewardCouponType) {
    case 'PERCENTAGE_DISCOUNT':
      return offer.discountPercentage
        ? `${offer.discountPercentage}% off`
        : null;
    case 'FIXED_CART_DISCOUNT':
      return offer.discountAmount
        ? `${CURRENCY}${offer.discountAmount} off`
        : null;
    case 'FREE_PRODUCTS':
      return 'A free product';
    case 'BONUS_POINTS':
      return offer.bonusPoints ? `+${offer.bonusPoints} bonus points` : null;
    default:
      return null;
  }
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return null;
  }
};

const LoyaltyContent = ({ businessId }: LoyaltyContentProps) => {
  const { data: offers, isLoading, isError } = useGetPublicBusinessOffers(
    businessId
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="aspect-[1.58/1] animate-pulse rounded-3xl bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (isError || !offers || offers.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <Award className="mx-auto mb-4 text-gray-300" size={48} />
        <h4 className="text-xl font-black text-gray-900">
          No Rewards Available
        </h4>
        <p className="mt-2 text-sm font-bold text-gray-500">
          This business hasn&apos;t added any loyalty rewards yet. Check back
          soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {offers.map((offer, index) => {
        const headline = rewardHeadline(offer);
        const expiry = formatDate(offer.endDate);

        return (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-[1.58/1]"
          >
            <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1A1A1A] p-8 shadow-2xl">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

              <div className="z-10 flex items-start justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20">
                      {rewardTypeLabel[offer.rewardCouponType] ?? 'Reward'}
                    </span>
                    {headline && (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
                        {headline}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-2xl font-black leading-tight text-white md:text-3xl">
                    {offer.name}
                  </h3>
                  <p className="line-clamp-2 max-w-[250px] text-xs font-bold text-white/40">
                    {offer.description || 'A loyalty reward just for you.'}
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-orange-400">
                  {offer.rewardCouponType === 'FREE_PRODUCTS' ? (
                    <Gift size={28} />
                  ) : offer.rewardCouponType === 'BONUS_POINTS' ? (
                    <Sparkles size={28} />
                  ) : (
                    <TicketPercent size={28} />
                  )}
                </div>
              </div>

              <div className="z-10 mt-auto flex items-end justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar size={14} className="text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {expiry ? `Ends ${expiry}` : 'Always available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Redeem at checkout
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black leading-none text-white">
                    {offer.points.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Points
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LoyaltyContent;
