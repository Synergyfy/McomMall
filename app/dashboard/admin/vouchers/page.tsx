import { VoucherSummary } from './components/VoucherSummary';
import { VoucherTransactionHistory } from './components/VoucherTransactionHistory';

const VoucherAnalyticsPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Voucher Analytics</h1>
      <VoucherSummary />
      <VoucherTransactionHistory />
    </div>
  );
};

export default VoucherAnalyticsPage;