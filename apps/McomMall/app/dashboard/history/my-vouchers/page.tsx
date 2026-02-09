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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error loading your vouchers. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">My Vouchers</h1>
          <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
            Home &gt; Dashboard &gt; History
          </p>
        </header>

        <div>
          {myVouchers && myVouchers.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <Ticket className="mx-auto text-gray-200 mb-6" size={64} />
              <h3 className="text-2xl font-black text-gray-900">No Vouchers Yet</h3>
              <p className="text-gray-500 font-bold mt-2">You haven't purchased any vouchers.</p>
            </div>
          )}
          {myVouchers && myVouchers.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              {myVouchers.map(voucher => (
                <HistoryVoucher
                  key={voucher.id}
                  voucher={voucher}
                  onShare={(id) => handleShare('voucher', id)}
                  isShared={copiedLink === voucher.id}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}