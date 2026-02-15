'use client';

import React, { useState } from 'react';
import { useGetMyCoupons } from '@/service/my-coupons/hook';
import { HistoryCoupon } from '@/app/dashboard/component/HistoryMarketingCards';
import { ReloadCouponModal } from './components/ReloadCouponModal';
import { Coupon } from '@/service/my-coupons/types';
import { Loader2, Zap, Terminal } from 'lucide-react';
import { useShareLink } from '@/lib/hooks/useShareLink';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MyCouponsPage = () => {
  const { data: coupons, isLoading, isError } = useGetMyCoupons();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isReloadModalOpen, setReloadModalOpen] = useState(false);
  const { copiedLink, handleShare } = useShareLink();

  const handleReload = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setReloadModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error loading your coupons. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">My Coupons</h1>
          <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
            Home &gt; Dashboard &gt; History
          </p>
        </header>

        <div>
          {coupons && coupons.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <Zap className="mx-auto text-gray-200 mb-6" size={64} />
              <h3 className="text-2xl font-black text-gray-900">No Coupons Yet</h3>
              <p className="text-gray-500 font-bold mt-2">You haven't purchased any coupons.</p>
            </div>
          )}
          {coupons && coupons.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {coupons.map((coupon) => (
                <HistoryCoupon
                  key={coupon.id}
                  coupon={coupon}
                  onReload={handleReload}
                  onShare={(id) => handleShare('coupon', id)}
                  isShared={copiedLink === coupon.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ReloadCouponModal
        coupon={selectedCoupon}
        isOpen={isReloadModalOpen}
        onClose={() => setReloadModalOpen(false)}
      />
    </div>
  );
};

export default MyCouponsPage;
