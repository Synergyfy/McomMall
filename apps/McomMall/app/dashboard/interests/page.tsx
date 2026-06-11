'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { redirect, useRouter } from 'next/navigation';
import { InterestSelection } from '../component/customer/InterestSelection';

export default function InterestsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Redirect owner or other roles away from customer-only interests page
  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return (
    <InterestSelection
      onBackToHome={() => router.push('/dashboard')}
    />
  );
}
