'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, PlusCircle, Copy, Download, Sparkles } from 'lucide-react';
import { useGetCoupons, useDeleteCoupon } from '@/service/coupons/hook';
import { DashboardCoupon } from '@/app/dashboard/component/DashboardMarketingCards';
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

// --- Main Page Component ---

export default function CouponsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { coupons, meta, isLoading, isError } = useGetCoupons(page, 15);
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
      toast.success('Coupon deleted successfully');
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

  const handleExport = () => {
    if (!coupons) return;

    const escapeCsvValue = (value: string | number | boolean | null | undefined): string => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = [
      'ID', 'Code', 'Title', 'Description', 'Source', 'Discount Type', 'Value',
      'Usage Limit', 'Per User Limit', 'Status', 'Expires At', 'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...coupons.map(c => [
        escapeCsvValue(c.id),
        escapeCsvValue(c.code),
        escapeCsvValue(c.title),
        escapeCsvValue(c.description),
        escapeCsvValue(c.sourceType),
        escapeCsvValue(c.discountType),
        escapeCsvValue(c.discountValue),
        escapeCsvValue(c.usageLimit),
        escapeCsvValue(c.perUserLimit),
        escapeCsvValue(c.status),
        escapeCsvValue(c.expiresAt ? new Date(c.expiresAt).toISOString() : 'Never'),
        escapeCsvValue(c.created_at),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'coupons_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-4xl font-bold text-slate-800">Coupons</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">Home &gt; Dashboard</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              disabled={!coupons || coupons.length === 0}
              className="flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold">
              Loading coupons...
            </div>
          )}
          {isError && (
            <div className="col-span-full py-20 text-center text-red-500 font-bold">
              Error loading coupons.
            </div>
          )}
          {coupons?.map(coupon => (
            <DashboardCoupon
              key={coupon.id}
              coupon={coupon}
              onEdit={() => handleEditClick(coupon)}
              onDelete={() => handleDeleteClick(coupon.id)}
            />
          ))}
          {!isLoading && coupons?.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <Sparkles className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-bold text-xl">No active coupons</p>
              <p className="text-sm mt-1">Create your first coupon to boost your sales.</p>
            </div>
          )}
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
