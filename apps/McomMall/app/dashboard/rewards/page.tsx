'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { redirect } from 'next/navigation';
import type { RootState } from '@/service/store/store';
import { RewardsView } from '../component/customer/RewardsView';
import PartnerRewardsWallet from '../component/customer/PartnerRewardsWallet';

export default function RewardsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return (
    <div>
      <div className="p-4 pb-0">
        <PartnerRewardsWallet />
      </div>
      <RewardsView />
    </div>
  );
}
