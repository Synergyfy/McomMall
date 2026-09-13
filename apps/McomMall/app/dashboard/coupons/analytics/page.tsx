'use client';

import React from 'react';
import { SummaryDisplay } from './components/SummaryDisplay';
import { CouponChart } from './components/CouponChart';
import { SalesAndRedemptions } from './components/SalesAndRedemptions';
import { FeatureToggle } from '../../component/FeatureToggle';
import { TrendingUp } from 'lucide-react';

const CouponAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600/10 text-orange-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Coupon Analytics
              </h1>
            </div>
            <p className="pl-[3.25rem] text-sm text-muted-foreground">
              Monitor your coupon performance and transaction history.
            </p>
          </div>
          <div className="sm:pl-[3.25rem]">
            <FeatureToggle featureName="coupons" />
          </div>
        </div>

        <SummaryDisplay />

        <CouponChart />

        <SalesAndRedemptions />
      </div>
    </div>
  );
};

export default CouponAnalyticsPage;
