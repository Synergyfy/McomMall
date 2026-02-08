import { useGetCashbackBalance } from '@/service/cashback/hook';
import { Coins } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const CashbackSummary = () => {
  const { data, isLoading } = useGetCashbackBalance();

  if (isLoading) {
    return (
      <div className="bg-gray-100 h-40 w-full md:max-w-sm rounded-2xl animate-pulse" />
    );
  }

  const balance = data?.balance ? parseFloat(data.balance) : 0;

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg w-full md:max-w-sm h-40">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cashback Balance</h3>
          <Coins size={28} />
        </div>
        <p className="text-4xl font-bold mt-4">{formatCurrency(balance)}</p>
      </div>
      <p className="text-sm opacity-80 mt-2">Available to redeem</p>
    </div>
  );
};
