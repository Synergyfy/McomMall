'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { VoucherProductForm } from '../../new/VoucherProductForm';
import { VoucherCardPreview } from '../../new/VoucherCardPreview';
import {
  CreateVoucherProductDto,
  VoucherProduct,
} from '@/service/vouchers/types';
import {
  useEditVoucherProduct,
  useGetVoucherProduct,
} from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditVoucherProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { voucherProduct, isLoading } = useGetVoucherProduct(id as string);
  const form = useForm<CreateVoucherProductDto>();
  const { handleSubmit, control, reset } = form;
  const editVoucherProduct = useEditVoucherProduct();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (voucherProduct) {
      reset(voucherProduct);
    }
  }, [voucherProduct, reset]);

  const onSubmit = async (data: CreateVoucherProductDto) => {
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (data.backgroundImage && data.backgroundImage.length > 0) {
        const file = data.backgroundImage[0];
        if (file instanceof File) {
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
        } else {
            imageUrl = voucherProduct?.backgroundImage
        }
      }

      const expiryDays = data.expiryDays;
      if (expiryDays !== undefined && (isNaN(expiryDays) || expiryDays < 1)) {
        toast.error('Expiry days must be a positive number.');
        setIsSubmitting(false);
        return;
      }

      await editVoucherProduct({id: id as string, updatedProduct: { ...data, backgroundImage: imageUrl, expiryDays }});
      toast.success('Voucher product updated successfully!');
      router.push('/dashboard/vouchers/products');
    } catch (error) {
      toast.error('An error occurred while updating the voucher product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Edit Voucher Product
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <VoucherProductForm form={form} isSubmitting={isSubmitting} />
        </div>
        <div>
          <VoucherCardPreview control={control} />
        </div>
      </form>
    </div>
  );
}