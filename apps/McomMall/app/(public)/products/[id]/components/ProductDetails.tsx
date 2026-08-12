
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProductById } from '@/service/store/products/hook';
import { useGetProductPlusItems as useGetServicesByProductId } from '@/service/partnerships/hooks';
import { ProductVariant, ProductAttribute, ProductVariation } from '@/service/store/products/types';
import { Button } from '@/components/ui/button';
import { Star, Minus, Plus, Heart, CheckCircle, Truck, Shield } from 'lucide-react';
import ServiceList from '@/components/ServiceList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import LoyaltyContent from '@/components/LoyaltyContent';
import { useRouter } from 'next/navigation';
import { ServiceBookingDetailsDto } from '@/hooks/useCheckout';
import { useDispatch } from 'react-redux';
import { addBooking } from '@/service/store/bookingSlice';
import { richTextHTML, stripHtmlText } from '@/lib/utils';

const isImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
}

type ProductDetailsProps = {
  productId: string;
};

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: product, isLoading, isError } = useGetProductById(productId);
  console.log('DEBUG: Product Data:', product);
  const { data: services, isLoading: servicesLoading } = useGetServicesByProductId(productId);
  const { addItemToCart } = useCart();
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [mainImage, setMainImage] = useState<string | null>(null);

  // --- DERIVED STATE FOR VARIATIONS ---

  // 1. Determine which system to use: Matrix (Variations) or Simple (Variants)
  const isMatrixSystem = product?.attributes && product?.variations && product.variations.length > 0;
  console.log('DEBUG: isMatrixSystem', isMatrixSystem, product?.attributes, product?.variations);

  // 2. Find the exact matching variation based on current selection
  const currentVariation = useMemo(() => {
    if (!isMatrixSystem || !product?.variations) return null;

    return product.variations.find(v => {
      // Check if every key in the combination matches the selection
      return Object.entries(v.combination).every(([key, value]) => selectedVariants[key] === value);
    });
  }, [isMatrixSystem, product, selectedVariants]);

  // 3. Determine Price: specific variation price OR base product price
  const displayPrice = currentVariation
    ? currentVariation.price
    : (product?.price || 0);

  // 4. Determine Stock Status
  const isOutOfStock = currentVariation
    ? !currentVariation.available || currentVariation.stock <= 0
    : false; // If no variation selected yet, assume available or handle otherwise

  // 5. Initialize Defaults on Load
  useEffect(() => {
    if (product) {
       // Set Main Image
       const firstImage = product.imageUrl || (product.fileUrls?.find(isImageUrl)) || 'https://via.placeholder.com/500x500.png?text=No+Image';
       if (!mainImage) setMainImage(firstImage);

       // Initialize Selections for Matrix System (Select first available options)
       if (isMatrixSystem && Object.keys(selectedVariants).length === 0) {
         const defaults: Record<string, string> = {};
         product.attributes?.forEach(attr => {
           if (attr.options.length > 0) defaults[attr.name] = attr.options[0].name;
         });
         setSelectedVariants(defaults);
       }
       // Initialize Selections for Simple System
       else if (!isMatrixSystem && product.variants && Object.keys(selectedVariants).length === 0) {
         const defaults: Record<string, string> = {};
         product.variants.forEach(v => {
            if (v.options.length > 0) defaults[v.name] = v.options[0].name;
         });
         setSelectedVariants(defaults);
       }
    }
  }, [product, isMatrixSystem]);


  const allImageUrls = [
    ...(product?.imageUrl ? [product.imageUrl] : []),
    ...(product?.fileUrls?.filter(isImageUrl) || []),
  ];

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

  const handleServiceBooked = (bookingDetails: ServiceBookingDetailsDto) => {
    dispatch(addBooking({ productId, bookingDetails }));
    toast.success('Service booking has been scheduled and added to your checkout details.');
  };

  const handleAddToCart = () => {
    if (product) {
      if (isOutOfStock) {
        toast.error('Selected variation is out of stock.');
        return;
      }

      addItemToCart({
        productId: product.id,
        quantity,
        selectedVariants: selectedVariants,
        // If specific variation ID exists (Matrix system), we could pass it here if Cart supports it
        // For now, passing the selected attribute map is sufficient for most simplified carts
      });
      toast.success('Added to cart');
    }
  };

  const handleOrderNow = () => {
    if (product) {
       if (isOutOfStock) {
        toast.error('Selected variation is out of stock.');
        return;
      }
      router.push(`/checkout?productId=${product.id}&quantity=${quantity}`);
    }
  };

  // Helper to check if a specific option is valid given the *other* current selections
  // (e.g., If "Red" is selected, is "XL" available in the matrix?)
  const isOptionAvailableInMatrix = (attributeName: string, optionValue: string) => {
     if (!isMatrixSystem || !product?.variations) return true;

     // Create a hypothetical selection where we replace the current attribute with this new option
     const hypotheticalSelection = { ...selectedVariants, [attributeName]: optionValue };

     // Check if ANY variation exists that matches this hypothetical selection (partially or fully)
     // NOTE: This logic can be complex. A simple version checks if there is AT LEAST ONE valid variation
     // that contains this attribute value, respecting *already selected* attributes that are "higher up" or just all of them.
     // For a true "Linked" experience, we usually treat attributes hierarchically or check intersection.

     // Simple Approach: Just check if this option exists in any variation that matches the OTHER currently selected keys.
     return product.variations.some(v => {
        // Does this variation have the option we are checking?
        if (v.combination[attributeName] !== optionValue) return false;

        // Does it also match the OTHER currently selected attributes?
        // (We can skip checking the attribute we are currently rendering)
        return Object.entries(selectedVariants).every(([key, value]) => {
           if (key === attributeName) return true; // Skip the one we are changing
           return v.combination[key] === value;
        });
     });
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Image Gallery */}
          <div className="space-y-4 lg:col-span-2">
            <div className="aspect-square relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              <Image
                src={mainImage || 'https://via.placeholder.com/500x500.png?text=No+Image'}
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
          <div className="space-y-8 lg:col-span-3">
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
                £{displayPrice.toFixed(2)}
              </p>
              {isOutOfStock && <span className="text-red-500 font-bold text-lg">Out of Stock</span>}
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {product.shortDescription || (stripHtmlText(product.description).slice(0, 200)) + '...'}
            </p>

            {/* RENDER VARIANTS (MATRIX OR SIMPLE) */}
            <div className="space-y-4">

              {/* MATRIX SYSTEM UI */}
              {isMatrixSystem && product.attributes?.map((attr) => (
                 <div key={attr.name}>
                    <label className="text-lg font-semibold text-gray-800">
                      {attr.name}
                    </label>
                    <Select
                      value={selectedVariants[attr.name] || ''}
                      onValueChange={(value) =>
                        setSelectedVariants({
                          ...selectedVariants,
                          [attr.name]: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2 text-lg py-6">
                        <SelectValue placeholder={`Select ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {attr.options.map((option: { name: string, priceModifier: number }) => {
                          const available = isOptionAvailableInMatrix(attr.name, option.name);
                          return (
                            <SelectItem
                              key={option.name}
                              value={option.name}
                              className="text-lg"
                              disabled={!available}
                            >
                              {option.name} {!available && '(Unavailable)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                 </div>
              ))}

              {/* SIMPLE SYSTEM UI (Fallback) */}
              {!isMatrixSystem && product.variants && product.variants.map((variant: ProductVariant) => (
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
                        {variant.options.map((option) => (
                          <SelectItem key={option.name} value={option.name} className="text-lg">
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-gray-300 rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="w-16 text-center text-xl font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 text-lg py-7 bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
               <Button
                size="lg"
                className="flex-1 text-lg py-7 bg-green-600 hover:bg-green-700 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleOrderNow}
                disabled={isOutOfStock}
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

        {/* Associated Services Section */}
        {services && services.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
              Partnered Services
            </h2>
            {servicesLoading ? (
              <div className="text-center py-12">Loading services...</div>
            ) : (
              <ServiceList
                services={services || []}
                onServiceBooked={handleServiceBooked}
              />
            )}
          </div>
        )}

        {/* Other Details Section */}
        <div className="mt-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4 text-lg p-2 h-auto">
              <TabsTrigger value="description" className="py-3">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="py-3">Reviews</TabsTrigger>
              <TabsTrigger value="shipping" className="py-3">Shipping & Returns</TabsTrigger>
              <TabsTrigger value="promotions" className="py-3">Promotions</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6 p-8 border rounded-lg text-lg">
              <div
                className="text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-orange-600 [&_a]:underline"
                dangerouslySetInnerHTML={richTextHTML(product.description)}
              />
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}