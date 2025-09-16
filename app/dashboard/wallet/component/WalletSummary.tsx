import { PoundSterling, PiggyBank, ShoppingCart } from 'lucide-react';

const BalanceSummaryCard = () => {
  return (
    <div className="bg-[#E9F8E6] text-[#3fad27] rounded p-4 flex items-center space-x-4 h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">0.00</p>
        <p className="text-lg">Withdrawable Balance £</p>
      </div>
      <div className="text-[5rem] font-normal">
        <PoundSterling size={80} />
      </div>
    </div>
  );
};

const EarningSummaryCard = () => {
  return (
    <div className="bg-[#F1F3F9] text-[#464a57] rounded p-4 flex items-center space-x-4  h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">0.00</p>
        <p className="text-lg">Total Earnings £</p>
      </div>
      <div className="text-[5rem] font-normal">
        <PiggyBank size={80} />
      </div>
    </div>
  );
};
const OrderSummaryCard = () => {
  return (
    <div className="bg-[#FFF6E3] text-[#e49c0b] rounded p-4 flex items-center space-x-4  h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">0</p>
        <p className="text-lg">Total Orders</p>
      </div>
      <div className="text-[5rem] font-normal">
        <ShoppingCart size={80} />
      </div>
    </div>
  );
};

export const WalletSummary = () => {
  return (
    <section>
      <h2 className="text-3xl font-medium">Wallet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <BalanceSummaryCard />
        <EarningSummaryCard />
        <OrderSummaryCard />
      </div>
    </section>
  );
};
