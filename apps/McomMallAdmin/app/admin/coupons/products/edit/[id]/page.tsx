"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CouponProductForm } from '../../new/CouponProductForm';
import { CouponCardPreview } from '../../new/CouponCardPreview';
import { CreateCouponProductDto, UpdateCouponProductDto } from '@/service/coupon-products/types';
import { useGetCouponProduct, useEditCouponProduct } from '@/service/coupon-products/hooks';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditCouponProductPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { data: response, isLoading } = useGetCouponProduct(id);
    const editCouponProduct = useEditCouponProduct(id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateCouponProductDto>();
    const couponProduct = response?.data;

    useEffect(() => {
        if (couponProduct) {
            form.reset({
                name: couponProduct.name,
                description: couponProduct.description,
                fixedAmounts: couponProduct.fixedAmounts || [],
                isEnabled: couponProduct.isEnabled,
                textColor: couponProduct.textColor || '#000000',
                logoUrl: couponProduct.logoUrl,
                // backgroundImage handled separately
            });
        }
    }, [couponProduct, form]);

    const handleSubmit = async (data: UpdateCouponProductDto) => {
        setIsSubmitting(true);
        try {
            let imageUrl: string | undefined = couponProduct?.backgroundImage;

            if (data.backgroundImage && data.backgroundImage.length > 0 && typeof data.backgroundImage !== 'string') {
                const file = (data.backgroundImage as unknown as FileList)[0];
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload/coupons', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Failed to upload image');
                const result = await response.json();
                imageUrl = result.secure_url;
            }

            let logoUrl: string | undefined = couponProduct?.logoUrl;
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

            await editCouponProduct.mutateAsync({ ...data, backgroundImage: imageUrl, logoUrl });
            toast.success('Coupon template updated successfully!');
            router.push('/admin/templates');
        } catch (error) {
            toast.error('An error occurred while updating the coupon template.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
                <h1 className="text-2xl font-bold mb-4">Edit Coupon Template</h1>
                <CouponProductForm onSubmit={handleSubmit} couponProduct={couponProduct} />
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4">Preview</h2>
                <CouponCardPreview watch={form.watch} />
            </div>
        </div>
    );
}
