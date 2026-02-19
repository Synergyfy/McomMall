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
  useGetVoucherProducts,
} from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function EditVoucherProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { voucherProduct: individualProduct, isLoading: isSingularLoading } = useGetVoucherProduct(id as string);
  const { voucherProducts, isLoading: isPluralLoading } = useGetVoucherProducts();

  const voucherProduct = individualProduct || voucherProducts?.find(p => p.id === id);
  const isLoading = isSingularLoading && isPluralLoading;

  const form = useForm<CreateVoucherProductDto>();
  const { handleSubmit, control, reset } = form;
  const editVoucherProduct = useEditVoucherProduct();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (voucherProduct) {
      reset({ ...voucherProduct, id: id as string });
    }
  }, [voucherProduct, reset, id]);

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

      await editVoucherProduct({ id: id as string, updatedProduct: { ...data, backgroundImage: imageUrl, expiryDays } });
      toast.success('Voucher product updated successfully!');
      router.push('/dashboard/vouchers/products');
    } catch (error) {
      toast.error('An error occurred while updating the voucher product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        <span className="ml-3 text-slate-600">Loading product details...</span>
      </div>
    );
  }

  if (!voucherProduct) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Product Not Found</h2>
        <p className="mt-2 text-slate-600">We couldn't find the voucher product you're looking for.</p>
        <Button onClick={() => router.push('/dashboard/vouchers/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
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