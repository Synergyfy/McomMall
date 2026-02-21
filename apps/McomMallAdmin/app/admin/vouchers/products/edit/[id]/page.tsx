"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { VoucherProductForm } from '../../new/VoucherProductForm';
import { VoucherCardPreview } from '../../new/VoucherCardPreview';
import { UpdateVoucherProductDto } from '@/service/vouchers/types';
import { useGetVoucherProduct, useEditVoucherProduct } from '@/service/hooks/useVoucherService';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditVoucherProductPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { voucherProduct, isLoading } = useGetVoucherProduct(id);
    const editVoucherProduct = useEditVoucherProduct();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateVoucherProductDto>();

    useEffect(() => {
        if (voucherProduct) {
            form.reset({
                name: voucherProduct.name,
                fixedAmounts: voucherProduct.fixedAmounts || [],
                usage: voucherProduct.usage,
                allowPartialRedemption: voucherProduct.allowPartialRedemption,
                isEnabled: voucherProduct.isEnabled,
                allowCustomAmount: voucherProduct.allowCustomAmount,
                allowReloading: voucherProduct.allowReloading,
                textColor: voucherProduct.textColor || '#000000',
                expiryDays: voucherProduct.expiryDays,
                logoUrl: voucherProduct.logoUrl,
                // backgroundImage is handled separately or as a string if already uploaded
            });
        }
    }, [voucherProduct, form]);

    const onSubmit = async (data: UpdateVoucherProductDto) => {
        setIsSubmitting(true);
        try {
            let imageUrl: string | undefined = voucherProduct?.backgroundImage;

            if (data.backgroundImage && data.backgroundImage.length > 0 && typeof data.backgroundImage !== 'string') {
                const file = (data.backgroundImage as unknown as FileList)[0];
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload/vouchers', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Failed to upload image');
                const result = await response.json();
                imageUrl = result.secure_url;
            }

            let logoUrl: string | undefined = voucherProduct?.logoUrl;
            if (data.logoUrl && (data.logoUrl as any).length > 0 && typeof data.logoUrl !== 'string') {
                const file = (data.logoUrl as unknown as FileList)[0];
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('/api/upload/logo', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) throw new Error('Failed to upload logo');
                const result = await response.json();
                logoUrl = result.secure_url;
            }

            await editVoucherProduct({
                id,
                updatedProduct: { ...data, backgroundImage: imageUrl, logoUrl }
            });
            toast.success('Voucher template updated successfully!');
            router.push('/admin/templates');
        } catch (error) {
            toast.error('An error occurred while updating the voucher template.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-8">
                Edit Voucher Template
            </h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <VoucherProductForm form={form} isSubmitting={isSubmitting} />
                </div>
                <div>
                    <VoucherCardPreview control={form.control} />
                </div>
            </form>
        </div>
    );
}
