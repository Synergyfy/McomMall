'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetProductById } from '@/service/store/products/hook';
import { ProductAttribute, ProductVariation, ProductVariant } from '@/service/store/products/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Loader, ShoppingCart, CreditCard, ChevronLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import ProductGallery from './components/ProductGallery';
import SellerCard from './components/SellerCard';
import ProductFacts from './components/ProductFacts';
import SafetyCard from './components/SafetyCard';
import VisualVariantSelector from './components/VisualVariantSelector';
import SizeGuideModal from './components/SizeGuideModal';

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { addItemToCart } = useCart();

  const { data: product, isLoading, isError } = useGetProductById(id || '');

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // 1. Determine which system to use: Matrix (Variations) or Simple (Variants)
  const isMatrixSystem = product?.attributes && product?.variations && product.variations.length > 0;

  // 2. Find matching variations based on current selection (Partial and Exact)
  const matchingVariations = useMemo(() => {
    if (!isMatrixSystem || !product?.variations) return [];

    const selectedKeys = Object.keys(selectedVariants).filter(k => selectedVariants[k]);

    return product.variations.filter(v => {
      return selectedKeys.every(key => v.combination[key] === selectedVariants[key]);
    });
  }, [isMatrixSystem, product, selectedVariants]);

  const currentVariation = useMemo(() => {
    if (!isMatrixSystem || !product?.variations) return null;
    // Exact match: all attributes must match
    return product.variations.find(v => {
      return Object.entries(v.combination).every(([key, value]) => selectedVariants[key] === value);
    });
  }, [isMatrixSystem, product, selectedVariants]);

  // Find a variation to represent partial selection (e.g., for image)
  const representativeVariation = useMemo(() => {
    if (currentVariation) return currentVariation;
    // Find first matching variation that has an image
    return matchingVariations.find(v => v.image) || matchingVariations[0] || null;
  }, [currentVariation, matchingVariations]);

  // 3. Helper to check if a specific option is valid given the *other* current selections
  const isOptionAvailableInMatrix = (attributeName: string, optionValue: string) => {
     if (!isMatrixSystem || !product?.variations) return true;

     // Simple Approach: Just check if this option exists in any variation that matches the OTHER currently selected keys.
     return product.variations.some(v => {
        // Does this variation have the option we are checking?
        if (v.combination[attributeName] !== optionValue) return false;

        // Does it also match the OTHER currently selected attributes?
        return Object.entries(selectedVariants).every(([key, value]) => {
           if (key === attributeName) return true; // Skip the one we are changing
           return v.combination[key] === value;
        });
     });
  };

  // Default Initialization Removed for Mandatory Selection logic
  // However, we might want to retain previous selections if valid?
  // No, clean slate is better for "Mandatory" feel unless we want to default to first.
  // The requirement says "Mandatory Variant Selection Logic... Disable until all selected".

  const handleVariantChange = (variantName: string, optionName: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionName,
    }));
  };

  // Determine which attributes are actually REQUIRED for the current selection path
  const requiredAttributesForCurrentPath = useMemo(() => {
    if (!isMatrixSystem || !product?.attributes || !product?.variations) return [];

    // An attribute is required if there exists at least one variation matching current selection that has this attribute
    return (product.attributes || []).filter(attr => {
        return (product.variations || []).some(v => {
            const matchesSelection = Object.entries(selectedVariants).every(([sName, sVal]) => {
                if (sName === attr.name || !sVal) return true;
                if (v.combination[sName] === undefined) return false;
                return v.combination[sName] === sVal;
            });
            return matchesSelection && v.combination[attr.name] !== undefined;
        });
    });
  }, [isMatrixSystem, product, selectedVariants]);

  // Check if all required variants are selected
  const allVariantsSelected = useMemo(() => {
      if (!product) return false;
      if (isMatrixSystem) {
          return requiredAttributesForCurrentPath.every(attr => selectedVariants[attr.name]);
      } else {
          return product.variants?.every(v => selectedVariants[v.name]);
      }
  }, [product, isMatrixSystem, selectedVariants, requiredAttributesForCurrentPath]);

  const { basePrice, totalPrice, priceBreakdown, isOutOfStock, priceRange } = useMemo(() => {
    if (!product) return { basePrice: 0, totalPrice: 0, priceBreakdown: [], isOutOfStock: false, priceRange: null };

    // MATRIX SYSTEM PRICE/STOCK
    if (isMatrixSystem) {
        if (currentVariation) {
            const displayPrice = currentVariation.salePrice && currentVariation.salePrice < currentVariation.price
                ? currentVariation.salePrice
                : currentVariation.price;
            return {
                basePrice: currentVariation.price,
                totalPrice: displayPrice,
                priceBreakdown: [], // Matrix prices are all-inclusive
                isOutOfStock: !currentVariation.available || currentVariation.stock <= 0,
                priceRange: null
            };
        } else {
             // Calculate price range from matching variations
             const prices = matchingVariations.map(v => v.salePrice && v.salePrice < v.price ? v.salePrice : v.price);
             const minPrice = prices.length > 0 ? Math.min(...prices) : product.price;
             const maxPrice = prices.length > 0 ? Math.max(...prices) : product.price;

             return {
                basePrice: minPrice,
                totalPrice: minPrice,
                priceBreakdown: [],
                isOutOfStock: false,
                priceRange: minPrice !== maxPrice ? { min: minPrice, max: maxPrice } : null
             };
        }
    }

    // LEGACY SYSTEM PRICE/STOCK
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
    return { basePrice: base, totalPrice: total, priceBreakdown: breakdown, isOutOfStock: false };
  }, [product, selectedVariants, isMatrixSystem, currentVariation]);

  const handleAddToCart = () => {
    if (!product || !id) return;

    if (!allVariantsSelected) {
        toast.error("Please select all options (Color, Size, etc.)");
        return;
    }

    if (isOutOfStock) {
        toast.error("This combination is out of stock.");
        return;
    }

    addItemToCart({
      productId: id,
      quantity: 1,
      selectedVariants,
      // Pass snapshot details if needed by hook (hook logic might need update, but payload is usually partial)
      // We assume hook handles basic ID/Variants.
    });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!product || !id) return;

    if (!allVariantsSelected) {
        toast.error("Please select all options first.");
        return;
    }

    if (isOutOfStock) {
        toast.error("Out of stock.");
        return;
    }

    const variantsJson = encodeURIComponent(JSON.stringify(selectedVariants));
    router.push(`/checkout?productId=${id}&variants=${variantsJson}`);
  };

  // Construct Images Array: Variant Image First!
  const images = useMemo(() => {
      if (!product) return [];
      const baseImages = product.fileUrls && product.fileUrls.length > 0
        ? product.fileUrls
        : [product.imageUrl || 'https://via.placeholder.com/500'];

      const variantImage = representativeVariation?.image;
      if (variantImage) {
          return [variantImage, ...baseImages];
      }
      return baseImages;
  }, [product, representativeVariation]);

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

  return (
    // Reduced padding-top to remove extra space
    <div className="min-h-screen bg-gray-50 pb-12 pt-3">

      {/* Navigation / Breadcrumb */}
      <div className="bg-white border-b shadow-sm mb-6">
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
                            {priceRange ? (
                                `£${priceRange.min.toFixed(2)} - £${priceRange.max.toFixed(2)}`
                            ) : (
                                `£${totalPrice.toFixed(2)}`
                            )}
                        </span>
                        {isMatrixSystem && currentVariation && currentVariation.salePrice && currentVariation.salePrice < currentVariation.price && (
                             <span className="text-lg text-gray-400 line-through">
                                £{currentVariation.price.toFixed(2)}
                            </span>
                        )}
                        {product.salePrice && product.salePrice < product.price && !isMatrixSystem && (
                            <span className="text-lg text-gray-400 line-through">
                                £{product.price.toFixed(2)}
                            </span>
                        )}
                        {isOutOfStock && <span className="ml-2 text-red-500 font-bold text-lg">Out of Stock</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {product.price > 0 ? '/ item' : ''}
                    </p>

                    {/* Low Stock Indicator */}
                    {isMatrixSystem && currentVariation && currentVariation.stock < 5 && currentVariation.stock > 0 && (
                        <div className="mt-2 flex items-center text-orange-600 text-sm font-medium animate-pulse">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Only {currentVariation.stock} left!
                        </div>
                    )}
                  </div>

                  {/* Matrix Variants (Visual Selector) */}
                  {isMatrixSystem && product.attributes && product.attributes.length > 0 && (
                     <div className="space-y-6 border-t border-gray-100 pt-6 mb-6">
                        <VisualVariantSelector
                            attributes={product.attributes}
                            variations={product.variations || []}
                            selectedValues={selectedVariants}
                            onChange={handleVariantChange}
                            sizeGuide={product.sizeGuide}
                        />
                     </div>
                  )}

                  {/* Legacy Variants (Fallback to Visual Selector too if possible, mapping types) */}
                  {!isMatrixSystem && product.variants && product.variants.length > 0 && (
                     <div className="space-y-6 border-t border-gray-100 pt-6 mb-6">
                        {/* Adapt Legacy Variants to Visual Selector props on the fly */}
                        <VisualVariantSelector
                            attributes={product.variants.map(v => ({
                                name: v.name,
                                options: v.options.map(o => ({
                                    name: o.name,
                                    priceModifier: Number(o.priceModifier) || 0
                                }))
                            }))}
                            variations={[]}
                            selectedValues={selectedVariants}
                            onChange={handleVariantChange}
                        />
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

                  {/* Selection Status */}
                  {isMatrixSystem && !allVariantsSelected && Object.keys(selectedVariants).length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 font-medium animate-in fade-in slide-in-from-top-1">
                          Please select: {requiredAttributesForCurrentPath.filter(a => !selectedVariants[a.name]).map(a => a.name).join(', ')}
                      </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button
                        size="lg"
                        className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full py-6 text-lg border-2 border-orange-100 text-orange-700 hover:bg-orange-50 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
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
