'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetProductById } from '@/service/store/products/hook';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/hooks/useCart';
import { Loader, ShoppingCart, CreditCard, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import ProductGallery from './components/ProductGallery';
import SellerCard from './components/SellerCard';
import ProductFacts from './components/ProductFacts';
import SafetyCard from './components/SafetyCard';

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { addItemToCart } = useCart();

  const { data: product, isLoading, isError } = useGetProductById(id || '');

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Initialize selected variants with defaults
  useEffect(() => {
    if (product?.variants) {
      const defaults: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaults[v.name] = v.options[0].name;
        }
      });
      setSelectedVariants(defaults);
    }
  }, [product]);

  const handleVariantChange = (variantName: string, optionName: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionName,
    }));
  };

  const { basePrice, totalPrice, priceBreakdown } = useMemo(() => {
    if (!product) return { basePrice: 0, totalPrice: 0, priceBreakdown: [] };

    const base = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    let total = base;
    const breakdown: { label: string; amount: number }[] = [];

    // Add base price to breakdown
    breakdown.push({ label: 'Base Price', amount: base });

    if (product.variants) {
      product.variants.forEach((variant) => {
        const selectedOptionName = selectedVariants[variant.name];
        const selectedOption = variant.options.find((opt) => opt.name === selectedOptionName);
        if (selectedOption) {
          const mod = Number(selectedOption.priceModifier) || 0;
          total += mod;
          if (mod !== 0) {
            breakdown.push({ label: `${variant.name}: ${selectedOptionName}`, amount: mod });
          }
        }
      });
    }
    return { basePrice: base, totalPrice: total, priceBreakdown: breakdown };
  }, [product, selectedVariants]);

  const handleAddToCart = () => {
    if (!product || !id) return;
    addItemToCart({
      productId: id,
      quantity: 1,
      selectedVariants,
    });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!product || !id) return;
    const variantsJson = encodeURIComponent(JSON.stringify(selectedVariants));
    router.push(`/checkout?productId=${id}&variants=${variantsJson}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 pt-16">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 pt-16">
        <p className="text-xl text-red-500">Product not found</p>
      </div>
    );
  }

  const images = product.fileUrls && product.fileUrls.length > 0
    ? product.fileUrls
    : [product.imageUrl || 'https://via.placeholder.com/500'];

  return (
    // Reduced padding-top to remove extra space
    <div className="min-h-screen bg-gray-50 pb-12 pt-2">

      {/* Navigation / Breadcrumb */}
      <div className="bg-white border-b shadow-sm mb-2">
        <div className="container mx-auto px-4 h-14 flex items-center">
            <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Listings
            </Link>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header (Mobile Only) */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-gray-500 mt-1">{product.category}</p>
            </div>

            {/* Gallery */}
            <ProductGallery images={images} title={product.title} />

            {/* Description */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags && product.tags.map(tag => (
                   <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                     {tag}
                   </Badge>
                ))}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Product Facts */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                 <ProductFacts product={product} />
            </div>

          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="relative">
             {/* Sticky Wrapper - adjusted top offset */}
            <div className="sticky top-20 space-y-6">

                {/* Main Action Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">{product.title}</h1>
                    <p className="text-gray-500 mt-1 hidden lg:block">{product.category}</p>

                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-orange-600">
                            £{totalPrice.toFixed(2)}
                        </span>
                        {product.salePrice && product.salePrice < product.price && (
                            <span className="text-lg text-gray-400 line-through">
                                £{product.price.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {product.price > 0 ? '/ item' : ''}
                    </p>
                  </div>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-6 border-t border-gray-100 pt-6 mb-6">
                      {product.variants.map((variant) => (
                        <div key={variant.name} className="space-y-3">
                          <Label className="text-sm font-semibold uppercase text-gray-700 tracking-wide">
                            {variant.name}
                          </Label>

                          {variant.type === 'radio' ? (
                            <RadioGroup
                                value={selectedVariants[variant.name]}
                                onValueChange={(val) => handleVariantChange(variant.name, val)}
                                className="flex flex-wrap gap-2"
                            >
                                {variant.options.map((option) => (
                                    <div key={option.name} className="flex items-center">
                                        <RadioGroupItem value={option.name} id={`${variant.name}-${option.name}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`${variant.name}-${option.name}`}
                                            className="px-3 py-2 bg-white border rounded-md cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 peer-data-[state=checked]:text-orange-700 transition-all"
                                        >
                                            {option.name}
                                            {Number(option.priceModifier) !== 0 && (
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({Number(option.priceModifier) > 0 ? '+' : ''}£{Number(option.priceModifier)})
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                          ) : (
                            <Select
                                value={selectedVariants[variant.name]}
                                onValueChange={(val) => handleVariantChange(variant.name, val)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={`Select ${variant.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {variant.options.map((option) => (
                                        <SelectItem key={option.name} value={option.name}>
                                            {option.name}
                                            {Number(option.priceModifier) !== 0 && (
                                                <span className="text-gray-500 ml-1">
                                                     ({Number(option.priceModifier) > 0 ? '+' : ''}£{Number(option.priceModifier)})
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price Breakdown Summary */}
                  {priceBreakdown.length > 1 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm space-y-2 border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-2">Pricing Breakdown</p>
                        {priceBreakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-gray-600">
                                <span>{item.label}</span>
                                <span>{item.amount > 0 ? '+' : ''}£{item.amount.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span>£{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button
                        size="lg"
                        className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full py-6 text-lg border-2 border-orange-100 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                        onClick={handleBuyNow}
                    >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Buy Now
                    </Button>
                  </div>

                </div>

                {/* Seller Card */}
                <SellerCard business={product.business} />

                {/* Safety Card */}
                <SafetyCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
