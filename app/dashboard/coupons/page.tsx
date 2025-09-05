'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, PlusCircle, Copy } from 'lucide-react';
import { useGetCoupons, useDeleteCoupon } from '@/service/coupons/hook';
import { toast } from 'sonner';
import { Coupon } from '@/service/coupons/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

// --- Reusable UI Components ---

const ActionButton: React.FC<{
  children: React.ReactNode;
  variant: 'edit' | 'delete';
  onClick: () => void;
}> = ({ children, variant, onClick }) => {
  const baseClasses =
    'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-transform duration-200 ease-in-out hover:scale-105';
  const variants = {
    edit: 'bg-green-500 hover:bg-green-600',
    delete: 'bg-red-500 hover:bg-red-600',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  );
};

type CouponRowProps = {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
};

const CouponRow: React.FC<CouponRowProps> = ({ coupon, onEdit, onDelete }) => {
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const formatLimit = (limit?: number) => (limit === undefined ? '∞' : limit);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  return (
    <motion.tr
      variants={rowVariants}
      className="border-b border-slate-200 bg-white"
    >
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="inline-block rounded-md border-2 border-dashed border-green-400 bg-green-50 px-3 py-1.5 font-mono text-sm font-medium text-green-800">
            {coupon.couponCode}
          </div>
          <button
            onClick={() => handleCopy(coupon.couponCode)}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Copy coupon code"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {coupon.discountType}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {coupon.couponAmount}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {coupon.usageCount || 0} / {formatLimit(coupon.usageLimitPerCoupon)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
        {new Date(coupon.expiryDate).toLocaleDateString() || '—'}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <ActionButton variant="edit" onClick={() => onEdit(coupon)}>
            <Edit className="h-3 w-3" />
            <span>Edit</span>
          </ActionButton>
          <ActionButton variant="delete" onClick={() => onDelete(coupon.id)}>
            <Trash2 className="h-3 w-3" />
            <span>Delete</span>
          </ActionButton>
        </div>
      </td>
    </motion.tr>
  );
};

// --- Main Page Component ---

export default function CouponsPage() {
  const router = useRouter();
  const { coupons, isLoading, isError } = useGetCoupons();
  const deleteCoupon = useDeleteCoupon();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  const handleDeleteClick = (couponId: string) => {
    setSelectedCouponId(couponId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCouponId) {
      await deleteCoupon(selectedCouponId);
      setIsDeleteDialogOpen(false);
      setSelectedCouponId(null);
    }
  };

  const handleEditClick = (coupon: Coupon) => {
    router.push(`/dashboard/coupons/edit/${coupon.id}`);
  };

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
          <h1 className="text-4xl font-bold text-slate-800">Coupons</h1>
          <p className="text-sm text-slate-500">Home &gt; Dashboard</p>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Code',
                    'Coupon Type',
                    'Coupon Amount',
                    'Usage/Limit',
                    'Expiry date',
                    'Actions',
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
                    <td colSpan={6} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-red-500">
                      Error loading coupons.
                    </td>
                  </tr>
                )}
                {coupons?.map(coupon => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 flex justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/coupons/new')}
            className="flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add New Coupon</span>
          </motion.button>
        </footer>
      </main>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
