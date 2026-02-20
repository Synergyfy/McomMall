'use client';

import React from 'react';
import { SummaryDisplay } from './components/SummaryDisplay';
import { CouponChart } from './components/CouponChart';
import { SalesAndRedemptions } from './components/SalesAndRedemptions';
import { FeatureToggle } from '../../component/FeatureToggle';

const CouponAnalyticsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Coupon Analytics</h1>
              <p className="text-gray-500 text-sm">Monitor your coupon performance and transaction history.</p>
            </div>
            <FeatureToggle featureName="coupons" />
          </div>

          <SummaryDisplay />

          <div className="grid grid-cols-1 gap-8">
            <CouponChart />
            <SalesAndRedemptions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponAnalyticsPage;
