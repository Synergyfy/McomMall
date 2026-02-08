'use client';

import React, { useState } from 'react';
import { useGetMyCoupons } from '@/service/my-coupons/hook';
import { CouponCard } from './components/CouponCard';
import { ReloadCouponModal } from './components/ReloadCouponModal';
import { Coupon } from '@/service/my-coupons/types';
import { Loader } from 'lucide-react';

const MyCouponsPage = () => {
  const { data: coupons, isLoading } = useGetMyCoupons();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isReloadModalOpen, setReloadModalOpen] = useState(false);

  const handleReload = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setReloadModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Coupons</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {coupons?.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} onReload={handleReload} />
        ))}
      </div>
      <ReloadCouponModal
        coupon={selectedCoupon}
        isOpen={isReloadModalOpen}
        onClose={() => setReloadModalOpen(false)}
      />
    </div>
  );
};

export default MyCouponsPage;
