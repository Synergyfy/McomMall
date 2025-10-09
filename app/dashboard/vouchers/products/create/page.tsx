'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { VoucherProductForm } from '../../(components)/VoucherProductForm';
import ImageUploader from '@/components/ImageUploader';
import { VoucherPreview } from '../../(components)/VoucherPreview';
import {
  CreateVoucherProductDto,
  VoucherProduct,
} from '@/service/vouchers/types';
import { useAddVoucherProduct } from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CreateVoucherProductPage() {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );
  const addVoucherProduct = useAddVoucherProduct();
  const router = useRouter();

  const form = useForm<CreateVoucherProductDto>({
    defaultValues: {
      name: '',
      fixedAmounts: [],
      usage: 'both',
      allowPartialRedemption: true,
      isEnabled: true,
      allowCustomAmount: false,
      backgroundImage: '',
    },
  });

  const watchedData = form.watch();

  const handleUploadSuccess = (url: string) => {
    setBackgroundImageUrl(url);
    form.setValue('backgroundImage', url);
  };

  const onSubmit = async (data: CreateVoucherProductDto) => {
    try {
      await addVoucherProduct(data);
      toast.success('Voucher product created successfully!');
      router.push('/dashboard/vouchers/products');
    } catch (error) {
      toast.error('Failed to create voucher product.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Create Voucher Product
              </h1>
              <p className="text-sm text-slate-500">
                Home &gt; Dashboard &gt; Vouchers &gt; Create
              </p>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Creating...'
                : 'Create Product'}
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