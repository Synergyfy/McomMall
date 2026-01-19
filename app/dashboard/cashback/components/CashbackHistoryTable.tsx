import { useGetCashbackHistory } from '@/service/cashback/hook';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Coins, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const TableHeader: React.FC<{ title: string }> = ({ title }) => {
  return <h3 className="text-[#333333] text-xl font-semibold">{title}</h3>;
};

export const CashbackHistoryTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetCashbackHistory({ page, limit: 10 });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;
  }

  const transactions = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="border rounded-xl w-full bg-white shadow-sm overflow-hidden">
      <div className="border-b h-[4rem] flex items-center justify-between px-6 bg-gray-50/50">
        <TableHeader title="Transaction History" />
      </div>
      {transactions.length === 0 ? (
        <div className="px-6 py-10 flex flex-col items-center justify-center text-gray-500 gap-3">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Coins size={32} className="text-gray-400" />
          </div>
          <p className="font-medium">You do not have any cashback history yet</p>
        </div>
      ) : (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                    <tr className="bg-gray-100/50 text-gray-600 text-sm">
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Event</th>
                    <th className="px-6 py-3 text-left font-medium">Platform</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-left font-medium">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">
                        {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium capitalize">
                            {transaction.eventType.toLowerCase().replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                            {transaction.sourcePlatform.toLowerCase().replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {transaction.type}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                            {transaction.type === 'CREDIT' ? '+' : ''}{formatCurrency(transaction.amount)}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
             {meta && meta.totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t bg-gray-50/50">
                    <div className="text-sm text-gray-500">
                        Showing page {meta.page} of {meta.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === meta.totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
};
