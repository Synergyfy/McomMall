'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGetMyVouchers } from '@/service/hooks/useVoucherService';
import { HistoryVoucher } from '@/app/dashboard/component/HistoryMarketingCards';
import { useShareLink } from '@/lib/hooks/useShareLink';
import { Loader2, Ticket, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyVouchersPage() {
  const { myVouchers, isLoading, isError } = useGetMyVouchers();
  const { copiedLink, handleShare } = useShareLink();

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              My Vouchers
            </h1>
            <p className="text-sm text-slate-500">
              Home &gt; Dashboard &gt; History &gt; Vouchers
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold">
              <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={48} />
              Loading your vouchers...
            </div>
          )}
          {isError && (
            <div className="col-span-full py-20">
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Error loading your vouchers. Please try again later.</AlertDescription>
              </Alert>
            </div>
          )}
          {myVouchers?.map(voucher => (
            <HistoryVoucher
              key={voucher.id}
              voucher={voucher}
              onShare={(id) => handleShare('voucher', id)}
              isShared={copiedLink === voucher.id}
            />
          ))}
          {!isLoading && myVouchers?.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Ticket className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-bold">No vouchers found.</p>
              <p className="text-xs mt-1">You haven't purchased any vouchers yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}