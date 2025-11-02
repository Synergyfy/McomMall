import { useWallet } from '@/service/wallet/hook';
import {
  PiggyBank,
  PoundSterling,
  ShoppingCart,
  Wallet,
  Landmark,
  Clock,
  Gift,
  Ticket,
  Briefcase,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ReactNode } from 'react';

export const WalletSummary = () => {
  const { data: walletData, isLoading } = useWallet();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!walletData) {
    return <p>No wallet data found.</p>;
  }

  const {
    balance,
    earningsBalance,
    spendableBalance,
    pendingBalance,
    earningsFromOrders,
    earningsFromGiftCard,
    earningsFromVoucher,
    earningsFromBookings,
    earningsFromCoupons,
  } = walletData.wallet;

  const totalBalance =
    parseFloat(earningsBalance) +
    parseFloat(spendableBalance) +
    parseFloat(pendingBalance);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Total Balance</h3>
              <Landmark size={28} />
            </div>
            <p className="text-5xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
          </div>
          <p className="text-sm opacity-80">Sum of all your balances</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
          <BalanceCard
            title="Spendable Balance"
            amount={parseFloat(spendableBalance)}
            icon={<Wallet size={24} />}
            color="green"
          />
          <BalanceCard
            title="Earnings Balance"
            amount={parseFloat(earningsBalance)}
            icon={<PiggyBank size={24} />}
            color="blue"
          />
          <BalanceCard
            title="Pending Balance"
            amount={parseFloat(pendingBalance)}
            icon={<Clock size={24} />}
            color="yellow"
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4">Earnings Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EarningSource
            title="From Orders"
            amount={parseFloat(earningsFromOrders)}
            icon={<ShoppingCart size={20} />}
          />
          <EarningSource
            title="From Gift Cards"
            amount={parseFloat(earningsFromGiftCard)}
            icon={<Gift size={20} />}
          />
          <EarningSource
            title="From Vouchers"
            amount={parseFloat(earningsFromVoucher)}
            icon={<Ticket size={20} />}
          />
          <EarningSource
            title="From Bookings"
            amount={parseFloat(earningsFromBookings)}
            icon={<Briefcase size={20} />}
          />
          <EarningSource
            title="From Coupons"
            amount={parseFloat(earningsFromCoupons)}
            icon={<Ticket size={20} />}
          />
        </div>
      </div>
    </div>
  );
};

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: ReactNode;
  color: 'green' | 'blue' | 'yellow';
}

const BalanceCard = ({ title, amount, icon, color }: BalanceCardProps) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-gray-500 mt-4">{title}</p>
      <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
    </div>
  );
};

interface EarningSourceProps {
  title: string;
  amount: number;
  icon: ReactNode;
}

const EarningSource = ({ title, amount, icon }: EarningSourceProps) => (
  <div className="border border-gray-200 p-4 rounded-lg">
    <div className="flex items-center text-gray-500">
      {icon}
      <p className="ml-2 font-semibold">{title}</p>
    </div>
    <p className="text-2xl font-bold mt-2">{formatCurrency(amount)}</p>
  </div>
);
