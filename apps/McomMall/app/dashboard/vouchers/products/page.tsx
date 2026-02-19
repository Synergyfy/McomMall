'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardVoucher } from '@/app/dashboard/component/DashboardMarketingCards';

// --- Reusable UI Components ---
import { Ticket, PlusCircle } from 'lucide-react';
import {
  useGetVoucherProducts,
  useDeleteVoucherProduct,
} from '@/service/hooks/useVoucherService';
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
import { toast } from 'sonner';

// --- Main Page Component ---

export default function VoucherProductsPage() {
  const router = useRouter();
  const { voucherProducts, isLoading, isError, mutate } =
    useGetVoucherProducts();
  const deleteVoucherProduct = useDeleteVoucherProduct();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const handleDeleteClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProductId) {
      try {
        await deleteVoucherProduct(selectedProductId);
        toast.success('Voucher product deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedProductId(null);
        mutate();
      } catch (error) {
        toast.error('Failed to delete voucher product.');
      }
    }
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
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Voucher Products
            </h1>
            <p className="text-sm text-slate-500">
              Home &gt; Dashboard &gt; Vouchers
            </p>
          </div>
          <Link href="/dashboard/vouchers/products/new">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add New Product</span>
            </motion.div>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold">
              Loading voucher products...
            </div>
          )}
          {isError && (
            <div className="col-span-full py-20 text-center text-red-500 font-bold">
              Error loading voucher products.
            </div>
          )}
          {voucherProducts?.map(product => (
            <DashboardVoucher
              key={product.id}
              product={product}
              onEdit={(id) => router.push(`/dashboard/vouchers/products/edit/${id}`)}
              onDelete={handleDeleteClick}
            />
          ))}
          {!isLoading && voucherProducts?.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Ticket className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-bold">No voucher products found.</p>
              <p className="text-xs mt-1">Create your first voucher to get started.</p>
            </div>
          )}
        </div>


      </main>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              voucher product.
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