'use client';

import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { CreateCouponProductDto } from '@/service/coupon-products/types';
import { formatCurrency } from '@/lib/utils';

interface CouponCardPreviewProps {
  watch: UseFormWatch<CreateCouponProductDto>;
}

export const CouponCardPreview: React.FC<CouponCardPreviewProps> = ({ watch }) => {
  const { name, description, textColor, backgroundImage, fixedAmounts } = watch();

  const cardStyle = {
    backgroundColor: backgroundImage ? 'transparent' : '#f0f0f0',
    backgroundImage: `url(${backgroundImage})`,
    color: textColor || '#000',
  };

  return (
    <div className="rounded-lg shadow-md p-6" style={cardStyle}>
      <div className="text-center">
        <h3 className="text-xl font-bold">{name || 'Your Coupon Name'}</h3>
        <p className="text-sm">{description || 'A short description of the coupon.'}</p>
        <div className="text-4xl font-bold my-4">
          {fixedAmounts && fixedAmounts.length > 0 ? formatCurrency(fixedAmounts[0]) : '£25.00'}
        </div>
      </div>
    </div>
  );
};
