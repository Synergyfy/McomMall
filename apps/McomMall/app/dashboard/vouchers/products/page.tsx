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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Voucher Products</h1>
            <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
              Home &gt; Dashboard &gt; Vouchers &gt; Management
            </p>
          </div>
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
              <p className="text-xs mt-1">Check the global templates catalog to select one.</p>
            </div>
          )}
        </div>


      </main>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This voucher template will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-2xl border-gray-100 font-black uppercase text-[10px] tracking-widest h-12">Cancel Operation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-2xl bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] tracking-widest h-12"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}