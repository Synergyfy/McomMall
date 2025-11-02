'use client';

import React, { useState } from 'react';
import { useGetCouponProducts, useDeleteCouponProduct } from '@/service/coupon-products/hooks';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
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

const CouponProductsPage = () => {
  const { data: couponProducts, isLoading } = useGetCouponProducts();
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
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Coupon Products</h1>
        <Button onClick={() => router.push('/dashboard/coupons/products/new')}>
          Add New Coupon Product
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {couponProducts?.map((product) => (
          <CouponProductCard
            key={product.id}
            product={product}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coupon product.
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
};

export default CouponProductsPage;
