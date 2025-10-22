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

export const TransactionHistoryTable = () => {
  const { data: walletData, isLoading } = useWallet();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const transactionHistory = walletData?.transactionHistory || [];

  return (
    <div className="border rounded w-full">
      <div className="border-b h-[3rem] flex items-center justify-between px-4">
        <TableHeader title="Transaction History" />
      </div>
      {transactionHistory.length === 0 ? (
        <div className="px-4 py-5 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
          <div className="h-12 w-12 p-2 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart />
          </div>
          <div>
            <p>You do not have any transactions yet</p>
          </div>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Balance After</th>
            </tr>
          </thead>
          <tbody>
            {transactionHistory.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="p-2">
                  {format(new Date(transaction.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="p-2">{transaction.description}</td>
                <td className="p-2">{transaction.type}</td>
                <td className="p-2">{formatCurrency(transaction.amount)}</td>
                <td className="p-2">
                  {formatCurrency(transaction.balanceAfter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
