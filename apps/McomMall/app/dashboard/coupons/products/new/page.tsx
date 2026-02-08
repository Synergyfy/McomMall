'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { CouponProductForm } from '@/app/dashboard/coupons/components/CouponProductForm';
import { CouponCardPreview } from '@/app/dashboard/coupons/components/CouponCardPreview';
import { CreateCouponProductDto, UpdateCouponProductDto } from '@/service/coupon-products/types';
import { useCreateCouponProduct } from '@/service/coupon-products/hooks';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const NewCouponProductPage = () => {
  const form = useForm<CreateCouponProductDto>();
  const createCouponProduct = useCreateCouponProduct();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: CreateCouponProductDto | UpdateCouponProductDto) => {
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (data.backgroundImage && data.backgroundImage.length > 0) {
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

      await createCouponProduct.mutateAsync({ ...data, backgroundImage: imageUrl } as CreateCouponProductDto);
      toast.success('Coupon product created successfully!');
      router.push('/dashboard/coupons/products');
    } catch (error) {
      toast.error('An error occurred while creating the coupon product.');
    } finally {
      setIsSubmitting(false);
    }
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
