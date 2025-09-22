import { useWallet } from '@/service/wallet/hook';
import { PiggyBank, PoundSterling, ShoppingCart } from 'lucide-react';

const BalanceSummaryCard = ({ amount }: { amount: number }) => {
  return (
    <div className="bg-[#E9F8E6] text-[#3fad27] rounded p-4 flex items-center space-x-4 h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">{amount.toFixed(2)}</p>
        <p className="text-lg">Withdrawable Balance £</p>
      </div>
      <div className="text-[5rem] font-normal">
        <PoundSterling size={80} />
      </div>
    </div>
  );
};

const EarningSummaryCard = ({ amount }: { amount: number }) => {
  return (
    <div className="bg-[#F1F3F9] text-[#464a57] rounded p-4 flex items-center space-x-4  h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">{amount.toFixed(2)}</p>
        <p className="text-lg">Total Earnings £</p>
      </div>
      <div className="text-[5rem] font-normal">
        <PiggyBank size={80} />
      </div>
    </div>
  );
};
const OrderSummaryCard = ({ count }: { count: number }) => {
  return (
    <div className="bg-[#FFF6E3] text-[#e49c0b] rounded p-4 flex items-center space-x-4  h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">{count}</p>
        <p className="text-lg">Total Orders</p>
      </div>
      <div className="text-[5rem] font-normal">
        <ShoppingCart size={80} />
      </div>
    </div>
  );
};

export const WalletSummary = () => {
  const { data: walletData, isLoading } = useWallet();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      <h2 className="text-3xl font-medium">Wallet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <BalanceSummaryCard
          amount={walletData?.wallet.withdrawableBalance || 0}
        />
        <EarningSummaryCard amount={walletData?.wallet.balance || 0} />
        <OrderSummaryCard count={walletData?.wallet.totalOrders || 0} />
      </div>
    </section>
  );
};
