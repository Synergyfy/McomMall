'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useGetProductById } from '@/service/store/products/hook';
import { Button } from '@/components/ui/button';
import { Star, Minus, Plus, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import LoyaltyContent from '@/components/LoyaltyContent';
import { useRouter } from 'next/navigation';

type ProductDetailsProps = {
  productId: string;
};

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const { data: product, isLoading, isError } = useGetProductById(productId);
  const { addItemToCart } = useCart();
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = wishlist?.items?.some(
    (item) => item.product.id === productId
  );

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
      addItemToCart({ productId: product.id, quantity });
      toast.success('Added to cart');
    }
  };

  const handleOrderNow = () => {
    if (product) {
      router.push(`/checkout?productId=${product.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
          <div>
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
    return <div>Error loading product.</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  const imageUrl =
    product.imageUrl || 'https://via.placeholder.com/500x500.png?text=No+Image';

  return (
    <div className="bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="aspect-square relative w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.title}
              </h1>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">(12 Reviews)</span>
              </div>
            </div>

            <div>
              <p className="text-4xl font-bold text-gray-900">
                £{product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-gray-600 text-base leading-relaxed">
              {product.shortDescription || product.description.substring(0, 150) + '...'}
            </p>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-200 rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
               <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleOrderNow}
              >
                Order Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? 'text-red-500 fill-current' : ''
                  }`}
                />
              </Button>
            </div>

            {/* SKU, Category, Tags */}
            <div className="text-sm text-gray-500 space-y-2 pt-4 border-t">
              {product.sku && (
                <p>
                  <span className="font-semibold text-gray-700">SKU:</span>{' '}
                  {product.sku}
                </p>
              )}
              {product.category && (
                <p>
                  <span className="font-semibold text-gray-700">Category:</span>{' '}
                  <a href="#" className="text-orange-600 hover:underline">
                    {product.category}
                  </a>
                </p>
              )}
              {product.tags && product.tags.length > 0 && (
                <p>
                  <span className="font-semibold text-gray-700">Tags:</span>{' '}
                  {product.tags.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description, Reviews, etc. */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4 p-6 border rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 p-6 border rounded-md">
              <p className="text-gray-700">No reviews yet.</p>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4 p-6 border rounded-md">
              <p className="text-gray-700">
                Standard shipping: 3-5 business days. Express shipping: 1-2
                business days. Returns are accepted within 30 days of
                purchase.
              </p>
            </TabsContent>
            <TabsContent value="promotions" className="mt-4">
              <LoyaltyContent productId={productId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
