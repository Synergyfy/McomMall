'use client';

import React, { useState } from 'react';
import { useGetCouponProducts, useDeleteCouponProduct } from '@/service/coupon-products/hooks';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Terminal, Zap } from 'lucide-react';
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
import { toast } from 'sonner';
import { CouponProductCard } from '@/app/dashboard/coupons/components/CouponProductCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CouponProductsPage = () => {
  const { data: couponProducts, isLoading, isError } = useGetCouponProducts();
  const deleteCouponProduct = useDeleteCouponProduct();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleDeleteClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProductId) {
      deleteCouponProduct.mutate(selectedProductId, {
        onSuccess: () => {
          toast.success('Coupon product deleted successfully!');
          setIsDeleteDialogOpen(false);
        },
        onError: () => {
          toast.error('Failed to delete coupon product.');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load coupon products. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Coupon Products</h1>
            <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
              Home &gt; Dashboard &gt; Coupons &gt; Management
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/coupons/products/new')}
            className="rounded-full px-8 py-6 bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.98]"
          >
            <Plus className="mr-2" size={18} /> Create New Coupon
          </Button>
        </header>

        {couponProducts && couponProducts.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {couponProducts.map((product) => (
              <CouponProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <Zap className="mx-auto text-gray-200 mb-6" size={64} />
            <h3 className="text-2xl font-black text-gray-900">No Coupon Templates</h3>
            <p className="text-gray-500 font-bold mt-2">Create your first coupon template to start selling.</p>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/coupons/products/new')}
              className="mt-6 rounded-full border-gray-200 font-black uppercase text-[10px] tracking-widest"
            >
              Initialize Catalog
            </Button>
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black tracking-tight">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                This template and all its configurations will be permanently removed. This action cannot be undone.
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
      </main>
    </div>
  );
};

export default CouponProductsPage;
