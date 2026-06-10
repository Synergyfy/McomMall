'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { redirect } from 'next/navigation';
import type { RootState } from '@/service/store/store';
import { RewardsView } from '../component/customer/RewardsView';

export default function RewardsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return <RewardsView />;
}
