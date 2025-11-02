'use client';

import React, { useState } from 'react';
import { useGetCouponProductsByBusiness } from '@/service/coupon-products/hooks';
import { CouponProduct } from '@/service/coupon-products/types';
import { Button } from '@/components/ui/button';
import { PurchaseCouponModal } from './PurchaseCouponModal';
import { Loader } from 'lucide-react';

const CouponTabContent = ({ businessId }: { businessId: string }) => {
  const { data: response, isLoading, isError } = useGetCouponProductsByBusiness(businessId);
  const couponProducts = response?.data;
  const [selectedCoupon, setSelectedCoupon] = useState<CouponProduct | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isError || !couponProducts) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Coupons</h3>
        <p>Could not load coupons at this time. Please try again later.</p>
      </div>
    );
  }

  if (couponProducts.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Coupons</h3>
        <p>No coupons are available for this business at the moment.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Our Coupons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {couponProducts.map((coupon: CouponProduct) => (
          <div key={coupon.id} className="border rounded-lg p-4 flex flex-col justify-between shadow-md">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{coupon.name}</h4>
              {coupon.description && <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>}
            </div>
            <Button
              className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => setSelectedCoupon(coupon)}
            >
              Purchase
            </Button>
          </div>
        ))}
      </div>

      {selectedCoupon && (
        <PurchaseCouponModal
          isOpen={!!selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          couponProduct={selectedCoupon}
        />
      )}
    </div>
  );
};

export default CouponTabContent;
