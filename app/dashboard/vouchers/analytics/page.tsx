'use client';

import { VoucherSummary } from './components/VoucherSummary';
import { VoucherTransactionHistory } from './components/VoucherTransactionHistory';
import { FeatureToggle } from '../../component/FeatureToggle';

const VoucherAnalyticsPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Voucher Analytics</h1>
        <FeatureToggle featureName="voucher" />
      </div>
      <VoucherSummary />
      <VoucherTransactionHistory />
    </div>
  );
};

export default VoucherAnalyticsPage;