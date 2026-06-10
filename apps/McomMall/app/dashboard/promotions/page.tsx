'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { redirect } from 'next/navigation';
import type { RootState } from '@/service/store/store';
import { PromotionsView } from '../component/customer/PromotionsView';

export default function PromotionsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return <PromotionsView />;
}
