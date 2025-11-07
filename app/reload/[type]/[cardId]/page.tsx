'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import ReloadCard from '../../components/ReloadCard';

type CardType = 'giftcard' | 'voucher' | 'coupon';

const ReloadPage = () => {
  const { type, cardId } = useParams();

  const isValidType =
    typeof type === 'string' &&
    ['giftcard', 'voucher', 'coupon'].includes(type);
  const isValidCardId = typeof cardId === 'string';

  if (!isValidType || !isValidCardId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Invalid URL</h1>
      </div>
    );
  }

  return <ReloadCard type={type as CardType} cardId={cardId} />;
};

export default ReloadPage;
