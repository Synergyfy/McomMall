'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCouponProduct, useEditCouponProduct } from '@/service/coupon-products/hooks';
import { CouponProductForm } from '@/app/dashboard/coupons/components/CouponProductForm';
import { Loader } from 'lucide-react';
import { UpdateCouponProductDto, CreateCouponProductDto } from '@/service/coupon-products/types';
import { toast } from 'sonner';

const EditCouponProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: response, isLoading, isError } = useGetCouponProduct(id as string);
  const couponProduct = response?.data;
  const editCouponProduct = useEditCouponProduct(id as string);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const handleSubmit = async (data: CreateCouponProductDto | UpdateCouponProductDto) => {
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = couponProduct.backgroundImage;
      if (data.backgroundImage && data.backgroundImage.length > 0 && typeof data.backgroundImage !== 'string') {
        const file = data.backgroundImage[0];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/coupons', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const result = await response.json();
        imageUrl = result.secure_url;
      }

      await editCouponProduct.mutateAsync({ ...data, backgroundImage: imageUrl } as UpdateCouponProductDto);
      toast.success('Coupon product updated successfully!');
      router.push('/dashboard/coupons/products');
    } catch (error) {
      toast.error('An error occurred while updating the coupon product.');
    } finally {
      setIsSubmitting(false);
    }
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
