'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { CouponProductForm } from '@/app/dashboard/coupons/components/CouponProductForm';
import { CouponCardPreview } from '@/app/dashboard/coupons/components/CouponCardPreview';
import { CreateCouponProductDto, UpdateCouponProductDto } from '@/service/coupon-products/types';
import { useCreateCouponProduct } from '@/service/coupon-products/hooks';
import { toast } from 'sonner';

const NewCouponProductPage = () => {
  const form = useForm<CreateCouponProductDto>();
  const createCouponProduct = useCreateCouponProduct();

  const handleSubmit = (data: CreateCouponProductDto | UpdateCouponProductDto) => {
    createCouponProduct.mutate(data as CreateCouponProductDto, {
      onSuccess: () => {
        toast.success('Coupon product created successfully!');
        form.reset();
      },
      onError: () => {
        toast.error('Failed to create coupon product.');
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Create Coupon Product</h1>
        <CouponProductForm onSubmit={handleSubmit} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        <CouponCardPreview watch={form.watch} />
      </div>
    </div>
  );
};

export default NewCouponProductPage;
