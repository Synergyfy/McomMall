'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGetMyVouchers } from '@/service/hooks/useVoucherService';
import { VoucherCard } from './VoucherCard';

export default function MyVouchersPage() {
  const { myVouchers, isLoading, isError } = useGetMyVouchers();

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
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">My Vouchers</h1>
          <p className="text-sm text-slate-500">
            Home &gt; Dashboard &gt; History
          </p>
        </header>

        <div>
          {isLoading && <p className="text-center">Loading...</p>}
          {isError && (
            <p className="text-center text-red-500">
              Error loading your vouchers.
            </p>
          )}
          {myVouchers && myVouchers.length === 0 && (
            <p className="text-center text-gray-500">
              You don&apos;t have any vouchers yet.
            </p>
          )}
          {myVouchers && myVouchers.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {myVouchers.map(voucher => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}