'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCouponProduct, useEditCouponProduct } from '@/service/coupon-products/hooks';
import { CouponProductForm } from '@/app/dashboard/coupons/components/CouponProductForm';
import { Loader } from 'lucide-react';
import { UpdateCouponProductDto, CreateCouponProductDto } from '@/service/coupon-products/types';
import { toast } from 'sonner';

const EditCouponProductPage = () => {
  const { id } = useParams();
  const { data: response, isLoading, isError } = useGetCouponProduct(id as string);
  const couponProduct = response?.data;
  const editCouponProduct = useEditCouponProduct(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isError || !couponProduct) {
    return (
      <div className="text-red-500 text-center">
        Failed to load coupon product. Please try again.
      </div>
    );
  }

  const handleSubmit = (data: CreateCouponProductDto | UpdateCouponProductDto) => {
    editCouponProduct.mutate(data as UpdateCouponProductDto, {
      onSuccess: () => {
        toast.success('Coupon product updated successfully!');
      },
      onError: () => {
        toast.error('Failed to update coupon product.');
      },
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Coupon</h1>
      <CouponProductForm
        couponProduct={couponProduct}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditCouponProductPage;
