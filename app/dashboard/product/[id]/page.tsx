'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetProductById } from '@/service/store/products/hook';
import { PlusCircle, Eye, Package } from 'lucide-react';
import { useParams } from 'next/navigation';
import AddServicePlusModal from '@/components/AddServicePlusModal';

const ProductDetailSkeleton = () => (
    <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    </div>
);

export default function ProductDetailPage() {
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { data: product, isLoading, isError } = useGetProductById(id as string);

    if (isLoading) return <ProductDetailSkeleton />;
    if (isError || !product) return <div>Error loading product or product not found.</div>;

    const firstImageUrl = product.fileUrls?.[0] || product.imageUrl;

    return (
        <>
            <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <Card className="overflow-hidden shadow-sm">
                        <CardHeader className="bg-white p-6 border-b">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                <div>
                                    <CardTitle className="text-3xl font-bold text-gray-800">{product.title}</CardTitle>
                                    <CardDescription className="text-md text-gray-500 mt-1">
                                        Product details and management
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        <Eye className="mr-2 h-4 w-4" /> View Public Page
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Service Plus
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    {/* Product Image Gallery */}
                                    <div className="mb-6">
                                        {firstImageUrl ? (
                                            <img src={firstImageUrl} alt={product.title} className="w-full h-auto max-h-[450px] object-cover rounded-lg border" />
                                        ) : (
                                            <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                                                <Package className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Product Description */}
                                    <div className="prose max-w-none text-gray-600">
                                        <h3 className="font-semibold text-lg text-gray-800 mb-2">Description</h3>
                                        <p>{product.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {/* Pricing & Stock */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Pricing & Stock</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Price</span>
                                                <span className="font-semibold text-gray-800">£{product.price.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Sale Price</span>
                                                <span className="font-semibold text-green-600">£{product.salePrice?.toFixed(2) || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Stock</span>
                                            <span className={`font-semibold ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {(product.stock || 0) > 0 ? `${product.stock} units` : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">SKU</span>
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{product.sku || 'N/A'}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Product Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Category</span>
                                                <span className="font-semibold text-gray-800">{product.category}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Brand</span>
                                                <span className="font-semibold text-gray-800">{product.brand || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Status</span>
                                                <span className="font-semibold text-gray-800">{product.productStatus}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <AddServicePlusModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}