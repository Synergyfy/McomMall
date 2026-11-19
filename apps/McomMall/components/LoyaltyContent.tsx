'use client';

import type { ReactNode } from 'react';
import {
  Award,
  Calendar,
  Clock,
  Coins,
  Gift,
  Sparkles,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  PublicTimeBonus,
  useActivateTimeBonus,
  useGetPublicBusinessOffers,
  useGetPublicTimeBonuses,
} from '@/service/offers/hook';
import { Offer } from '@/service/offers/types';
import { CURRENCY } from '@/lib/utils';
import LoyaltyProgramBanner from './LoyaltyProgramBanner';

type LoyaltyContentProps = {
  businessId?: string;
  productId?: string;
};

const rewardTypeLabel: Record<Offer['rewardCouponType'], string> = {
  PERCENTAGE_DISCOUNT: 'Offer',
  FIXED_CART_DISCOUNT: 'Offer',
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

function LoyaltyShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[2.25rem] border border-orange-200/80 bg-gradient-to-b from-orange-50/80 via-[#fffdf9] to-white p-5 shadow-[0_18px_60px_-38px_rgba(161,64,0,0.35)] sm:p-7 lg:p-8">
      {children}
    </div>
  );
}

function TimeBonusSection({ businessId }: { businessId?: string }) {
  const router = useRouter();
  const { data: bonuses, isLoading } = useGetPublicTimeBonuses(businessId);
  const activate = useActivateTimeBonus();

  if (isLoading || !bonuses || bonuses.length === 0) {
    return null;
  }

  const handleActivate = async (bonus: PublicTimeBonus) => {
    try {
      const result = await activate.mutateAsync(bonus.id);
      toast.success(
        result.pointsAwarded > 0
          ? `+${result.pointsAwarded} points added!`
          : 'Time bonus activated!'
      );
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        toast.error('Please sign in to activate this time bonus.');
        router.push('/signin');
        return;
      }
      toast.error('Could not activate this time bonus. Please try again.');
    }
  };

  return (
    <div className="mt-8 space-y-4 border-t border-orange-100 pt-6">
      <div>
        <h3 className="text-lg font-black text-gray-900">Time Bonuses</h3>
        <p className="mt-1 text-xs font-semibold text-gray-500">
          Activate a time bonus to claim bonus points from this business.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {bonuses.map((bonus) => {
          const claimed = !bonus.canClaim;
          return (
            <div
              key={bonus.id}
              className="flex flex-col justify-between rounded-2xl border border-[#efe3dc] bg-white p-5 shadow-[0_2px_12px_rgba(31,27,24,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#a14000] ring-1 ring-orange-100">
                    <Clock className="h-3 w-3" /> Time bonus
                  </span>
                  <h4 className="mt-2 text-base font-bold text-gray-900">
                    {bonus.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {bonus.description || 'Claim your bonus points.'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black leading-none text-[#a14000]">
                    +{bonus.bonusPoints}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    points
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-50 pt-3">
                <span className="text-[10px] font-semibold text-gray-400">
                  {bonus.limitPerCustomer
                    ? `${bonus.limitPerCustomer} claim(s) · ${
                        bonus.allowLimitToReset ? 'resets daily' : 'one-time'
                      }`
                    : 'Unlimited claims'}
                  {bonus.endDate
                    ? ` · ends ${formatDate(bonus.endDate) ?? ''}`
                    : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleActivate(bonus)}
                  disabled={bonus.isOwner || claimed || activate.isPending}
                  className="shrink-0 rounded-xl bg-[#a14000] px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#8a3700] active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {bonus.isOwner
                    ? 'Your business'
                    : claimed
                      ? 'Claimed'
                      : activate.isPending
                        ? 'Activating…'
                        : bonus.claims > 0
                          ? 'Claim again'
                          : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const LoyaltyContent = ({ businessId }: LoyaltyContentProps) => {
  const router = useRouter();
  const { data: offers, isLoading, isError } = useGetPublicBusinessOffers(
    businessId
  );

  if (isLoading) {
    return (
      <LoyaltyShell>
        <LoyaltyProgramBanner businessId={businessId} embedded />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="aspect-[1.58/1] animate-pulse rounded-3xl bg-orange-100/50"
            />
          ))}
        </div>
      </LoyaltyShell>
    );
  }

  if (isError || !offers || offers.length === 0) {
    return (
      <LoyaltyShell>
        <LoyaltyProgramBanner businessId={businessId} embedded />
        <div className="mt-6 rounded-[2rem] border border-dashed border-orange-200 bg-white/70 py-16 text-center">
          <Award className="mx-auto mb-4 text-orange-200" size={48} />
          <h4 className="text-xl font-black text-gray-900">
            No Rewards Available
          </h4>
          <p className="mt-2 text-sm font-bold text-gray-500">
            This business hasn&apos;t added any loyalty rewards yet. Check back
            soon.
          </p>
        </div>
        <TimeBonusSection businessId={businessId} />
      </LoyaltyShell>
    );
  }

  return (
    <LoyaltyShell>
      <LoyaltyProgramBanner businessId={businessId} embedded />

      <div className="mt-6 border-t border-orange-100 pt-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              Rewards you can claim
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-gray-500">
              Use your points on these loyalty offers from this business.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
            {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_2px_12px_rgba(31,27,24,0.04)]">
          {offers.map((offer, index) => {
            const headline = rewardHeadline(offer);
            const expiry = formatDate(offer.endDate);

            return (
              <div
                key={offer.id}
                className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                  index > 0 ? 'border-t border-orange-100' : ''
                }`}
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#a14000] ring-1 ring-orange-100">
                    {offer.rewardCouponType === 'FREE_PRODUCTS' ? (
                      <Gift size={20} />
                    ) : offer.rewardCouponType === 'BONUS_POINTS' ? (
                      <Sparkles size={20} />
                    ) : (
                      <Tag size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-[#f58220] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                        {rewardTypeLabel[offer.rewardCouponType] ?? 'Offer'}
                      </span>
                      {headline && (
                        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#a14000] ring-1 ring-orange-100">
                          {headline}
                        </span>
                      )}
                    </div>

                    <h4 className="mt-1.5 truncate text-base font-bold text-gray-900">
                      {offer.name}
                    </h4>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                      {offer.description || 'A loyalty reward just for you.'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-[#f58220]" />
                        {expiry ? `Ends ${expiry}` : 'Always available'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Coins size={12} className="text-[#f58220]" />
                        Redeem at checkout
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 self-stretch border-t border-orange-50 pt-3 sm:min-w-24 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black leading-none text-[#a14000]">
                      {offer.points.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                      Points
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TimeBonusSection businessId={businessId} />
    </LoyaltyShell>
  );
};

export default LoyaltyContent;
