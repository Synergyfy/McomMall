'use client';

import { FC } from 'react';
import { ShieldCheck, CircleDot, Award } from 'lucide-react';

interface StatusBadgeProps {
  isVerified?: boolean;
  isClaimed?: boolean;
  statusText?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  isVerified = false,
  isClaimed = false,
  statusText,
  size = 'sm',
}) => {
  const isSm = size === 'sm';

  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-50 text-emerald-700 ${
        isSm ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'
      }`}>
        <ShieldCheck className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
        {statusText || 'Verified'}
      </span>
    );
  }

  if (isClaimed) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-50 text-amber-700 ${
        isSm ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'
      }`}>
        <Award className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
        {statusText || 'Claimed'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-gray-50 text-gray-500 ${
      isSm ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'
    }`}>
      <CircleDot className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
      {statusText || 'Unclaimed'}
    </span>
  );
};
