'use client';

import React from 'react';
import { useMyRewards } from '@/service/rewards/hook';
import { BadgeCheck, Gift, Loader, Sparkles, Ticket, Wallet } from 'lucide-react';

type AnyItem = Record<string, any>;

function codeOf(item: AnyItem): string | null {
  return item?.code ?? null;
}

/**
 * Wallet-style surface listing rewards earned on MCOM Rewards alongside the
 * instruments held locally in MCOM Mall (gift cards, vouchers, coupons).
 */
export default function PartnerRewardsWallet() {
  const { data, isLoading } = useMyRewards();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-[#5a4136]">
        <Loader className="animate-spin w-4 h-4" />
        Loading your rewards…
      </div>
    );
  }

  const partnerRewards: AnyItem[] = data?.partnerRewards || [];
  const giftCards: AnyItem[] = (data?.giftCards as AnyItem[]) || [];
  const vouchers: AnyItem[] = (data?.vouchers as AnyItem[]) || [];
  const coupons: AnyItem[] = (data?.coupons as AnyItem[]) || [];

  const total =
    partnerRewards.length + giftCards.length + vouchers.length + coupons.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#a23f00]" />
          <h3 className="font-bold text-[#261812] text-sm">MCOM Rewards</h3>
        </div>
        <p className="text-xs text-[#8e7164] mt-2">
          {data?.meshEnabled === false
            ? 'MCOM Rewards is not connected right now.'
            : 'You have no rewards yet. Earn rewards on MCOM Rewards and they will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#a23f00]" />
        <h3 className="font-bold text-[#261812] text-sm">MCOM Rewards</h3>
        <span className="ml-auto text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">
          {total} item{total > 1 ? 's' : ''}
        </span>
      </div>

      {partnerRewards.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#8e7164] uppercase tracking-wider">
            From MCOM Rewards
          </p>
          {partnerRewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fff8f6] border border-[#e2bfb0]/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="w-4 h-4 text-[#97471d] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#261812] truncate">
                    {reward.rewardTitle || 'Reward'}
                  </p>
                  <p className="text-[10px] text-[#8e7164]">
                    {reward.status}
                    {reward.expiresAt
                      ? ` · expires ${new Date(reward.expiresAt).toLocaleDateString()}`
                      : ''}
                  </p>
                </div>
              </div>
              {codeOf(reward) ? (
                <span className="text-[10px] font-mono font-bold text-[#a23f00] bg-[#ffeae1] px-2 py-1 rounded-lg">
                  {codeOf(reward)}
                </span>
              ) : (
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-[#fff8f6] p-3 text-center border border-[#e2bfb0]/30">
          <Wallet className="w-4 h-4 mx-auto text-[#97471d]" />
          <p className="text-lg font-extrabold text-[#261812]">
            {giftCards.length}
          </p>
          <p className="text-[10px] text-[#8e7164]">Gift cards</p>
        </div>
        <div className="rounded-xl bg-[#fff8f6] p-3 text-center border border-[#e2bfb0]/30">
          <Ticket className="w-4 h-4 mx-auto text-[#97471d]" />
          <p className="text-lg font-extrabold text-[#261812]">
            {vouchers.length}
          </p>
          <p className="text-[10px] text-[#8e7164]">Vouchers</p>
        </div>
        <div className="rounded-xl bg-[#fff8f6] p-3 text-center border border-[#e2bfb0]/30">
          <Gift className="w-4 h-4 mx-auto text-[#97471d]" />
          <p className="text-lg font-extrabold text-[#261812]">
            {coupons.length}
          </p>
          <p className="text-[10px] text-[#8e7164]">Coupons</p>
        </div>
      </div>
    </div>
  );
}
