'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGetMyVouchers } from '@/service/hooks/useVoucherService';
import { Voucher } from '@/service/vouchers/types';
import { CURRENCY } from '@/lib/utils';

type MyVoucherRowProps = {
  voucher: Voucher;
};

const getStatusChipClass = (status: Voucher['status']) => {
  switch (status) {
    case 'unredeemed':
      return 'bg-blue-100 text-blue-800';
    case 'partially_redeemed':
      return 'bg-yellow-100 text-yellow-800';
    case 'redeemed':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    case 'disabled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const MyVoucherRow: React.FC<MyVoucherRowProps> = ({ voucher }) => {
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.tr
      variants={rowVariants}
      className="border-b border-slate-200 bg-white"
    >
      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-slate-800">
        {voucher.code}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {voucher.voucherProduct?.name ?? 'N/A'}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {CURRENCY}
        {voucher.initialValue.toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {CURRENCY}
        {voucher.balance.toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusChipClass(
            voucher.status
          )}`}
        >
          {voucher.status.replace('_', ' ')}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {new Date(voucher.createdAt).toLocaleDateString()}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {voucher.expiresAt
          ? new Date(voucher.expiresAt).toLocaleDateString()
          : 'N/A'}
      </td>
    </motion.tr>
  );
};

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

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Code',
                    'Product',
                    'Initial Value',
                    'Balance',
                    'Status',
                    'Purchase Date',
                    'Expires At',
                  ].map(header => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-200"
              >
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-red-500">
                      Error loading your vouchers.
                    </td>
                  </tr>
                )}
                {myVouchers?.map(voucher => (
                  <MyVoucherRow key={voucher.id} voucher={voucher} />
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}