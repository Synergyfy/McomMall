'use client';

import { useGetProductById } from '@/service/store/products/hook';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import ServicePlusModal from './components/ServicePlusModal';

function ProductDetailsContent({ productId }: { productId: string }) {
  const router = useRouter();
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);

  const { data: product, isLoading, isError } = useGetProductById(productId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !product) {
    return <div>Error loading product or product not found.</div>;
  }

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 text-base">
        <ServicePlusModal
            isOpen={isServiceModalOpen}
            onClose={() => setServiceModalOpen(false)}
            productId={productId}
        />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-4xl font-bold text-gray-800">
              {product.title}
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">{product.description}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Product Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className='font-semibold'>Price:</span>
                            <span>£{product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className='font-semibold'>Product Type:</span>
                            <Badge>{product.productType}</Badge>
                        </div>
                         <div className="flex justify-between">
                            <span className='font-semibold'>SKU:</span>
                            <span>{product.sku}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Product Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {product.fileUrls?.map((url, index) => (
                                <Image key={index} src={url} alt={`${product.title} image ${index + 1}`} width={200} height={200} className="rounded-lg object-cover" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Service Plus</CardTitle>
                        <CardDescription>
                            Add a recommended service to this product.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => setServiceModalOpen(true)}>Add service plus</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="secondary">{product.category}</Badge>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const productId = Array.isArray(id) ? id[0] : id;

  if (!productId) {
    return <div>Product not found.</div>;
  }

  return <ProductDetailsContent productId={productId} />;
}