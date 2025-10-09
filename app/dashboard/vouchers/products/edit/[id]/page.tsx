'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import {
  CreateVoucherProductDto,
  VoucherProduct,
} from '@/service/vouchers/types';
import {
  useGetVoucherProducts,
  useEditVoucherProduct,
} from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';
import { VoucherProductForm } from '../../../(components)/VoucherProductForm';
import { VoucherPreview } from '../../../(components)/VoucherPreview';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditVoucherProductPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { voucherProducts, isLoading: isLoadingProducts } =
    useGetVoucherProducts();
  const editVoucherProduct = useEditVoucherProduct();

  const [product, setProduct] = useState<VoucherProduct | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );

  const form = useForm<CreateVoucherProductDto>();
  const watchedData = form.watch();

  useEffect(() => {
    if (voucherProducts && id) {
      const productToEdit = voucherProducts.find(p => p.id === id);
      if (productToEdit) {
        setProduct(productToEdit);
        form.reset(productToEdit);
        if (productToEdit.backgroundImage) {
          setBackgroundImageUrl(productToEdit.backgroundImage);
        }
      }
    }
  }, [voucherProducts, id, form]);

  const handleUploadSuccess = (url: string) => {
    setBackgroundImageUrl(url);
    form.setValue('backgroundImage', url);
  };

  const onSubmit = async (data: CreateVoucherProductDto) => {
    if (!product) return;
    try {
      await editVoucherProduct(product.id, data);
      toast.success('Voucher product updated successfully!');
      router.push('/dashboard/vouchers/products');
    } catch (error) {
      toast.error('Failed to update voucher product.');
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="mt-2 h-8 w-1/2" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p>The voucher product you are looking for does not exist.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Edit Voucher Product
              </h1>
              <p className="text-sm text-slate-500">
                Home &gt; Dashboard &gt; Vouchers &gt; Edit
              </p>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold text-slate-700">
                    Voucher Background Image
                  </h3>
                  <ImageUploader
                    onUploadSuccess={handleUploadSuccess}
                    folder="voucher-backgrounds"
                  />
                </div>
                <VoucherProductForm form={form} />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="mb-4 text-2xl font-bold text-slate-800">
                  Live Preview
                </h2>
                <VoucherPreview
                  product={watchedData}
                  backgroundImageUrl={backgroundImageUrl}
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}