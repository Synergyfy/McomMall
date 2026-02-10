"use client";

import { useGetCashbackHistory } from '@/service/cashback/hook';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Coins, Loader2, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CashbackHistoryTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetCashbackHistory({ page, limit: 10 });

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Fetching Transactions...</p>
      </div>
    );
  }

  const transactions = data?.data || [];
  const meta = data?.meta;

  return (
    <Card className="border-none shadow-sm overflow-hidden rounded-3xl bg-white">
      <CardHeader className="flex flex-row items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-100">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Transaction History</CardTitle>
          <p className="text-xs text-slate-500 font-medium">Detailed view of your cashback earnings and usage</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-xs gap-2">
          <Filter className="h-3 w-3" /> Filter
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="px-8 py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
              <Coins size={32} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="font-black text-slate-900">No History Yet</p>
              <p className="text-sm font-medium mt-1">Your cashback activities will appear here.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-4 text-left">Date & Time</th>
                    <th className="px-8 py-4 text-left">Activity</th>
                    <th className="px-8 py-4 text-left">Source</th>
                    <th className="px-8 py-4 text-left">Status</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((transaction) => {
                    const isCredit = transaction.type === 'CREDIT';
                    return (
                      <tr key={transaction.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-900">{format(new Date(transaction.createdAt), 'dd MMM, yyyy')}</p>
                          <p className="text-[10px] font-medium text-slate-400">{format(new Date(transaction.createdAt), 'HH:mm')}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                              {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <span className="text-sm font-black text-slate-900 capitalize">
                              {transaction.eventType.toLowerCase().replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold px-2 py-0.5 capitalize">
                            {transaction.sourcePlatform.toLowerCase().replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${isCredit ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isCredit ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className={`px-8 py-5 text-right`}>
                          <span className={`text-base font-black tracking-tight ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isCredit ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="px-8 py-6 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl font-bold text-xs bg-white border-slate-200"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl font-bold text-xs bg-white border-slate-200"
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
      </CardContent>
    </Card>
  );
};