'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { redirect } from 'next/navigation';
import { useCustomerPoints } from '@/context/CustomerPointsContext';
import { RewardsView } from '../component/customer/RewardsView';

export default function RewardsPage() {
  const { userRole, userName } = useSelector((state: RootState) => state.auth);
  const { points, redeemPoints } = useCustomerPoints();

  // Redirect owner or other roles away from customer-only rewards page
  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return (
    <RewardsView />
  );
}
