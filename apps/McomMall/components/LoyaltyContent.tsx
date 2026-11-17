'use client';

import {
  Award,
  BadgeCheck,
  Calendar,
  Clock,
  Coins,
  Gift,
  Sparkles,
  TicketPercent,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  PublicTimeBonus,
  useActivateTimeBonus,
  useGetPublicBusinessOffers,
  useGetPublicTimeBonuses,
} from '@/service/offers/hook';
import { Offer } from '@/service/offers/types';
import {
  PublicLoyaltyProgram,
  useJoinLoyaltyProgram,
  usePublicLoyaltyProgram,
} from '@/service/loyalty/hook';
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

function ProgramBanner({
  program,
  isJoining,
  onJoin,
}: {
  program: PublicLoyaltyProgram;
  isJoining: boolean;
  onJoin: () => void;
}) {
  const scope = program.earnOnProducts && program.earnOnServices
    ? 'on products and services'
    : program.earnOnServices
      ? 'on service bookings'
      : 'on products';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#5a2c00]">{program.programName}</p>
          <p className="mt-0.5 text-xs text-[#8a4a12]">
            Earn {program.pointsPerCurrency} point
            {program.pointsPerCurrency === 1 ? '' : 's'} for every £1 spent{' '}
            {scope}.
          </p>
        </div>
      </div>
      {program.isOwner ? (
        <span className="self-start rounded-full bg-gray-200 px-4 py-2 text-xs font-bold text-gray-600 sm:self-auto">
          Your business
        </span>
      ) : program.isJoined ? (
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white sm:self-auto">
          <BadgeCheck className="h-4 w-4" /> Joined
        </span>
      ) : (
        <button
          type="button"
          onClick={onJoin}
          disabled={isJoining}
          className="self-start rounded-xl bg-[#a14000] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#8a3700] active:scale-95 disabled:opacity-60 sm:self-auto"
        >
          {isJoining ? 'Joining…' : 'Join loyalty campaign'}
        </button>
      )}
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
    <div className="space-y-4">
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
  const { data: program } = usePublicLoyaltyProgram(businessId);
  const joinProgram = useJoinLoyaltyProgram();

  const handleJoin = async () => {
    if (!businessId) return;
    try {
      await joinProgram.mutateAsync(businessId);
      toast.success('You joined the loyalty programme!');
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        toast.error('Please sign in to join the loyalty programme.');
        router.push('/signin');
        return;
      }
      toast.error('Could not join the loyalty programme. Please try again.');
    }
  };

  const banner =
    program?.isEnabled && businessId ? (
      <ProgramBanner
        program={program}
        isJoining={joinProgram.isPending}
        onJoin={handleJoin}
      />
    ) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {banner}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="aspect-[1.58/1] animate-pulse rounded-3xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !offers || offers.length === 0) {
    return (
      <div className="space-y-6">
        {banner}
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
        <TimeBonusSection businessId={businessId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {banner}
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
      <TimeBonusSection businessId={businessId} />
    </div>
  );
};

export default LoyaltyContent;
