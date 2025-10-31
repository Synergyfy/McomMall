'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { VoucherProductForm } from './VoucherProductForm';
import { VoucherCardPreview } from './VoucherCardPreview';
import { CreateVoucherProductDto } from '@/service/vouchers/types';
import { useAddVoucherProduct } from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NewVoucherProductPage() {
  const { control, handleSubmit, watch } = useForm<CreateVoucherProductDto>();
  const addVoucherProduct = useAddVoucherProduct();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: CreateVoucherProductDto) => {
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (data.backgroundImage && data.backgroundImage.length > 0) {
        const file = data.backgroundImage[0];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/vouchers', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const result = await response.json();
        imageUrl = result.secure_url;
      }

      await addVoucherProduct({ ...data, backgroundImage: imageUrl });
      toast.success('Voucher product created successfully!');
      router.push('/dashboard/vouchers/products');
    } catch (error) {
      toast.error('An error occurred while creating the voucher product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Create New Voucher Product
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <VoucherProductForm control={control} isSubmitting={isSubmitting} />
        </div>
        <div>
          <VoucherCardPreview control={control} />
        </div>
      </form>
    </div>
  );
}