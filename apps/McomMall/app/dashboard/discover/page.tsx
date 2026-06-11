'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { redirect } from 'next/navigation';
import { DiscoverLocal } from '../component/customer/DiscoverLocal';

export default function DiscoverPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  // Redirect owner or other roles away from customer-only discovery page
  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return <DiscoverLocal />;
}
