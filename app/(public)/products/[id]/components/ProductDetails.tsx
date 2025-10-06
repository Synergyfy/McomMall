'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProductById } from '@/service/store/products/hook';
import { useGetServicesByProductId } from '@/service/partnerships/hooks';
import { ProductVariant } from '@/service/store/products/types';
import { Button } from '@/components/ui/button';
import { Star, Minus, Plus, Heart, CheckCircle, Truck, Shield } from 'lucide-react';
import ServiceList from '@/components/ServiceList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import LoyaltyContent from '@/components/LoyaltyContent';
import { useRouter } from 'next/navigation';

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

type ProductDetailsProps = {
  productId: string;
};

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const { data: product, isLoading, isError } = useGetProductById(productId);
  const { data: services, isLoading: servicesLoading } = useGetServicesByProductId(productId);
  const { addItemToCart } = useCart();
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const allImageUrls = [
    ...(product?.imageUrl ? [product.imageUrl] : []),
    ...(product?.fileUrls?.filter(isImageUrl) || []),
  ];
  const [mainImage, setMainImage] = useState(allImageUrls[0] || 'https://via.placeholder.com/500x500.png?text=No+Image');

  const isWishlisted = wishlist?.items?.some(
    (item) => item.product.id === productId
  );

  if (product && mainImage === 'https://via.placeholder.com/500x500.png?text=No+Image') {
    const firstImage = allImageUrls[0];
    if (firstImage) {
      setMainImage(firstImage);
    }
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeItemFromWishlist(productId);
      toast.success('Removed from wishlist');
    } else {
      if (product) {
        addItemToWishlist({ productId: product.id });
        toast.success('Added to wishlist');
      }
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItemToCart({ productId: product.id, quantity, variants: selectedVariants });
      toast.success('Added to cart');
    }
  };

  const handleOrderNow = () => {
    if (product) {
      addItemToCart({ productId: product.id, quantity, variants: selectedVariants });
      router.push(`/cart`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-lg h-[500px]"></div>
          <div className="space-y-6">
            <div className="animate-pulse bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-1/4 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 w-1/2 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-20">Error loading product. Please try again later.</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              <Image
                src={mainImage}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {allImageUrls.map((url, index) => (
                <button
                  key={index}
                  className={`aspect-square relative rounded-lg overflow-hidden border-2 ${
                    mainImage === url ? 'border-orange-500' : 'border-transparent'
                  }`}
                  onClick={() => setMainImage(url)}
                >
                  <Image
                    src={url}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                {product.title}
              </h1>
              <div className="flex items-center">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < 4 ? 'fill-current' : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-md text-gray-600">(12 customer reviews)</span>
              </div>
            </div>

            <div>
              <p className="text-5xl font-bold text-gray-900">
                £{product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {product.shortDescription || product.description.substring(0, 200) + '...'}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variant: ProductVariant) => (
                  <div key={variant.name}>
                    <label className="text-lg font-semibold text-gray-800">
                      {variant.name}
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setSelectedVariants({
                          ...selectedVariants,
                          [variant.name]: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2 text-lg py-6">
                        <SelectValue placeholder={`Select ${variant.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variant.options.map((option: string) => (
                          <SelectItem key={option} value={option} className="text-lg">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-gray-300 rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="w-16 text-center text-xl font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 text-lg py-7 bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
               <Button
                size="lg"
                className="flex-1 text-lg py-7 bg-green-600 hover:bg-green-700 rounded-full shadow-lg"
                onClick={handleOrderNow}
              >
                Order Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={`h-7 w-7 transition-colors ${
                    isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'
                  }`}
                />
              </Button>
            </div>

            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                <span>In stock and ready to ship</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Truck className="h-5 w-5 mr-3 text-blue-500" />
                <span>Free, fast shipping on orders over £50</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Shield className="h-5 w-5 mr-3 text-gray-500" />
                <span>Secure payments and hassle-free returns</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-5 text-lg p-2 h-auto">
              <TabsTrigger value="description" className="py-3">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="py-3">Reviews</TabsTrigger>
              <TabsTrigger value="shipping" className="py-3">Shipping & Returns</TabsTrigger>
              <TabsTrigger value="promotions" className="py-3">Promotions</TabsTrigger>
              <TabsTrigger value="services" className="py-3">Associated Services</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6 p-8 border rounded-lg text-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6 p-8 border rounded-lg text-lg">
              <p className="text-gray-700">No reviews yet.</p>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6 p-8 border rounded-lg text-lg">
              <p className="text-gray-700">
                Standard shipping: 3-5 business days. Express shipping: 1-2
                business days. Returns are accepted within 30 days of
                purchase.
              </p>
            </TabsContent>
            <TabsContent value="promotions" className="mt-6">
              <LoyaltyContent productId={productId} />
            </TabsContent>
            <TabsContent value="services" className="mt-6">
              {servicesLoading ? (
                <div className="text-center py-12">Loading services...</div>
              ) : (
                // The isDashboardView prop defaults to false, so buttons are correctly rendered.
                <ServiceList services={services || []} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}