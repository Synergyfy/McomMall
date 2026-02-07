'use client';

import { useGetProductById } from '@/service/store/products/hook';
import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import ServicePlusModal from './components/ServicePlusModal';
import ProductMediaGallery from './components/ProductMediaGallery';
import ProductInfo from './components/ProductInfo';
import ProductDetailsAccordion from './components/ProductDetailsAccordion';
import { Skeleton } from '@/components/ui/skeleton';

function ProductDetailsContent({ productId }: { productId: string }) {
  const router = useRouter();
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const { data: product, isLoading, isError } = useGetProductById(productId);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-2xl font-semibold text-red-600 mb-4">
          Error: Product Not Found
        </div>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t find the product you&apos;re looking for.
        </p>
        <Button onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ServicePlusModal
        isOpen={isServiceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        productId={productId}
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-base">Back to Products</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ProductMediaGallery
            images={[...(product.fileUrls || []), ...(product.media || [])].length > 0
                ? [...(product.fileUrls || []), ...(product.media || [])]
                : [product.imageUrl || 'https://via.placeholder.com/500']}
            productTitle={product.title}
          />
          <div className="flex flex-col gap-8">
            <ProductInfo
              product={product}
              onAddPartner={() => setServiceModalOpen(true)}
            />
            <ProductDetailsAccordion product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

const ProductDetailsSkeleton = () => (
  <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <header className="mb-8">
        <Skeleton className="h-10 w-40" />
    </header>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      <div className="flex flex-col gap-4">
        <Skeleton className="w-full h-[480px] rounded-2xl" />
        <div className="grid grid-cols-5 gap-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/4" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const productId = Array.isArray(id) ? id[0] : id;

  if (!productId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-semibold text-red-500">
          Product ID not found.
        </div>
      </div>
    );
  }

  return <ProductDetailsContent productId={productId} />;
}