'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateVoucherProductDto } from '@/service/vouchers/types';
import { useAddVoucherProduct } from '@/service/hooks/useVoucherService';
import { CreateVoucherProductForm } from './components/CreateVoucherProductForm';
import { VoucherPreview } from './components/VoucherPreview';

const CreateVoucherProductPage = () => {
  const router = useRouter();
  const addVoucherProduct = useAddVoucherProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CreateVoucherProductDto>({
    defaultValues: {
      name: 'My Awesome Voucher',
      fixedAmounts: [10, 25, 50],
      textColor: '#FFFFFF',
      backgroundImage: '',
      isEnabled: true,
      allowPartialRedemption: true,
      usage: 'both',
    },
  });

  const formData = methods.watch();

  const handleSubmit = async (data: CreateVoucherProductDto) => {
    setIsSubmitting(true);
    try {
      await addVoucherProduct(data);
      toast.success('Voucher product created successfully!');
      router.push('/dashboard/vouchers/products');
    } catch (error) {
      toast.error('Failed to create voucher product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Create New Voucher Product
          </h1>
          <p className="text-sm text-slate-500">
            Design and configure your new voucher.
          </p>
        </header>

        <FormProvider {...methods}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <CreateVoucherProductForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Preview Section */}
            <div className="flex flex-col items-center">
              <h2 className="mb-4 text-2xl font-semibold text-slate-700">
                Live Preview
              </h2>
              <div className="w-full max-w-md">
                <VoucherPreview {...formData} />
              </div>
            </div>
          </div>
        </FormProvider>
      </main>
    </div>
  );
};

export default CreateVoucherProductPage;