'use client';

import { FC } from 'react';
import { useGetMyMembership } from '@/service/membership/hooks';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const MembershipBadge: FC = () => {
  const { data: membership, isLoading } = useGetMyMembership();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <div className="w-12 h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const tierName = membership?.tier?.name || 'Free';
  const isActive = membership?.isActive || membership?.status === 'active' || membership?.status === 'paid';

  // Define styles based on tier name (modern & professional)
  const getTierStyles = (name: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes('gold') || normalizedName.includes('premium')) {
      return 'bg-amber-50 border-amber-200 text-amber-700 text-amber-500';
    }
    if (normalizedName.includes('platinum') || normalizedName.includes('diamond')) {
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 text-indigo-500';
    }
    if (normalizedName.includes('silver') || normalizedName.includes('pro')) {
      return 'bg-slate-50 border-slate-200 text-slate-700 text-slate-500';
    }
    return 'bg-blue-50 border-blue-200 text-blue-700 text-blue-500';
  };

  const tierStyles = getTierStyles(tierName);
  const colorParts = tierStyles.split(' ');
  const bgColor = colorParts[0];
  const borderColor = colorParts[1];
  const textColor = colorParts[2];
  const iconColor = colorParts[3];

  return (
    <Link href="/dashboard/my-subscription">
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${bgColor} border ${borderColor} hover:opacity-80 transition-all cursor-pointer group shadow-sm`}>
        <Shield className={`w-4 h-4 ${iconColor} group-hover:scale-110 transition-transform`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold opacity-70 leading-none uppercase tracking-wider">
            Membership
          </span>
          <span className={`text-sm font-bold ${textColor} whitespace-nowrap`}>
            {tierName} {isActive ? '' : '(Inactive)'}
          </span>
        </div>
      </div>
    </Link>
  );
};
