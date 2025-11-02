'use client';

import React from 'react';
import { Coupon } from '@/service/my-coupons/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface CouponCardProps {
  coupon: Coupon;
  onReload: (coupon: Coupon) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onReload }) => {
  const { couponProduct } = coupon;
  const cardStyle = {
    backgroundColor: couponProduct.backgroundImage ? 'transparent' : '#f0f0f0',
    backgroundImage: `url(${couponProduct.backgroundImage})`,
    color: couponProduct.textColor || '#000',
  };

  return (
    <div className="rounded-lg shadow-md p-6" style={cardStyle}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{couponProduct.name}</h3>
          <p className="text-sm">{coupon.code}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(coupon.balance)}</p>
          <p className="text-sm">
            Initial Value: {formatCurrency(coupon.initialValue)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-xs">
            Expires:{' '}
            {coupon.expiresAt
              ? new Date(coupon.expiresAt).toLocaleDateString()
              : 'Never'}
          </p>
          <p className={`text-xs font-semibold ${coupon.status === 'unredeemed' ? 'text-green-500' : 'text-yellow-500'}`}>
            {coupon.status}
          </p>
        </div>
        {couponProduct.allowReloading && (
          <Button onClick={() => onReload(coupon)}>Reload</Button>
        )}
      </div>
    </div>
  );
};
