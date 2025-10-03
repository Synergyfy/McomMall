'use client';

import { useGetProductById } from '@/service/store/products/hook';
import { ChevronLeft, Star, PlusCircle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter } from 'next/navigation';
import ServicePlusModal from './components/ServicePlusModal';

function ProductDetailsContent({ productId }: { productId: string }) {
  const router = useRouter();
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useGetProductById(productId);

  React.useEffect(() => {
    if (product?.fileUrls && product.fileUrls.length > 0) {
      setSelectedImage(product.fileUrls[0]);
    }
  }, [product]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl font-semibold">Loading Product...</div>
        </div>
    );
  }

  if (isError || !product) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl font-semibold text-red-500">Error loading product or product not found.</div>
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-lg">Back to Products</span>
            </Button>
            <Badge variant={product.productStatus === 'Online' ? 'default' : 'secondary'} className={product.productStatus === 'Online' ? 'bg-green-500' : ''}>{product.productStatus}</Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Media Gallery */}
            <div className="flex flex-col gap-4">
                <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                        key={selectedImage}
                        src={selectedImage || '/placeholder.svg'}
                        alt={product.title}
                        width={600}
                        height={600}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {product.fileUrls?.map((url, index) => (
                        <div key={index} className={`rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === url ? 'border-red-500' : 'border-transparent'}`} onClick={() => setSelectedImage(url)}>
                            <Image src={url} alt={`${product.title} thumbnail ${index + 1}`} width={100} height={100} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-6">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">{product.title}</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-6 w-6 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />)}
                    </div>
                    <span className="text-gray-600">(12 Reviews)</span>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{product.shortDescription}</p>

                <div className="text-5xl font-bold text-red-600">
                    £{product.price.toFixed(2)}
                </div>

                <Card className="bg-gray-50 border-dashed">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-xl">Service Plus</CardTitle>
                        <Button size="sm" onClick={() => setServiceModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Partner
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Recommend a trusted service provider for this product to enhance customer experience.</p>
                    </CardContent>
                </Card>

                 <Tabs defaultValue="description" className="w-full">
                    <TabsList>
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="specs">Specifications</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="p-4 bg-gray-50 rounded-b-lg">
                        <p>{product.description}</p>
                    </TabsContent>
                    <TabsContent value="specs" className="p-4 bg-gray-50 rounded-b-lg">
                        <ul className="list-disc list-inside space-y-2">
                            <li><span className="font-semibold">SKU:</span> {product.sku}</li>
                            <li><span className="font-semibold">Category:</span> {product.category}</li>
                            <li><span className="font-semibold">Type:</span> {product.productType}</li>
                            <li><span className="font-semibold">Stock:</span> {product.stock}</li>
                        </ul>
                    </TabsContent>
                    <TabsContent value="reviews" className="p-4 bg-gray-50 rounded-b-lg">
                        <p>No reviews yet.</p>
                    </TabsContent>
                </Tabs>
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
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl font-semibold text-red-500">Product ID not found.</div>
        </div>
    );
  }

  return <ProductDetailsContent productId={productId} />;
}