'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/service/store/store';
import { PromotionsView } from '../component/customer/PromotionsView';
import { PromotionsManager } from './components/promotions-manager';

export default function PromotionsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  if (userRole === 'customer' || userRole === 'CUSTOMER') {
    return <PromotionsView />;
  }

  return <PromotionsManager />;
}

