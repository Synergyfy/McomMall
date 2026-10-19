import { useWallet } from '@/service/wallet/hook';
import { Gem, ShoppingCart } from 'lucide-react';
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const TableHeader: React.FC<{ title: string }> = ({ title }) => {
  return <h3 className="text-[#333333] text-xl font-semibold">{title}</h3>;
};

export const RecentActivityTable = () => {
  return (
    <div className="border rounded w-2/5">
      <div className="border-b h-[3rem] flex items-center justify-between px-4">
        <TableHeader title="Recent Activities" />
      </div>
      <div className="px-4 py-5 hover:bg-gray-100 cursor-pointer">{`You don't have any activities logged yet.`}</div>
    </div>
  );
};

export const ListingPackageTable = () => {
  return (
    <div className="border rounded w-2/5">
      <div className="border-b h-[3rem] flex items-center justify-between px-4">
        <TableHeader title="Your Listing Packages" />
      </div>
      <div className="px-4 py-5 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
        <div className="h-12 w-12 p-2 bg-gray-100 rounded-full flex items-center justify-center">
          <Gem />
        </div>
        <div>
          <TableHeader title="Basic" />
          <p>You have 0 listings posted out of 1, listed for 30 days</p>
        </div>
      </div>
    </div>
  );
};

import { ArrowDownLeft, ArrowUpRight, Clock, ReceiptText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TransactionHistoryTable = () => {
  const { data: walletData, isLoading } = useWallet();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  const transactionHistory = walletData?.transactionHistory || [];
  const currencySymbol = walletData?.centralWallet?.currency || 'MCOM';

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(isNaN(num) ? 0 : num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
  };

  const getCategoryBadge = (type: string, category?: string) => {
    const raw = (category || type || '').toUpperCase();
    if (raw.includes('DEBIT') || raw.includes('PURCHASE') || raw.includes('SUBSCRIPTION') || raw.includes('SPEND')) {
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 text-xs font-semibold">
          <ArrowUpRight className="w-3 h-3" />
          {raw}
        </Badge>
      );
    }
    if (raw.includes('CREDIT') || raw.includes('REWARD') || raw.includes('REFUND') || raw.includes('CASHBACK') || raw.includes('FUNDING')) {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs font-semibold">
          <ArrowDownLeft className="w-3 h-3" />
          {raw}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1 text-xs font-semibold">
        {raw || 'TRANSACTION'}
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 p-5 sm:px-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-gray-600" />
            Wallet Activity & Ledger
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable transaction history originating from MCOM Mall
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
          {transactionHistory.length} recorded
        </span>
      </div>

      {transactionHistory.length === 0 ? (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
          <div className="h-14 w-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-gray-900">No transactions yet</h4>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            Purchases, cashbacks, refunds, and subscriptions made in MCOM Mall will automatically record here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/75 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Category / Type</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Reference</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactionHistory.map((transaction) => {
                const isDebit =
                  transaction.type?.toUpperCase().includes('DEBIT') ||
                  transaction.type?.toUpperCase().includes('SPEND') ||
                  transaction.type?.toUpperCase().includes('PURCHASE') ||
                  transaction.type?.toUpperCase().includes('SUBSCRIPTION');

                return (
                  <tr key={transaction.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap text-xs">
                      {transaction.createdAt
                        ? format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm')
                        : '—'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getCategoryBadge(transaction.type, transaction.category)}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 max-w-xs truncate">
                      {transaction.description || 'Transaction'}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-mono whitespace-nowrap">
                      {transaction.reference || transaction.id.slice(0, 10)}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold whitespace-nowrap ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDebit ? '-' : '+'}{formatAmount(transaction.amount)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600 font-medium whitespace-nowrap">
                      {transaction.balanceAfter !== undefined
                        ? formatAmount(transaction.balanceAfter)
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
