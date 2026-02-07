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

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { addItemToCart } = useCart();

  const { data: product, isLoading, isError } = useGetProductById(id || '');

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});

  // Matrix System Logic
  const isMatrixSystem = useMemo(() => {
    return !!(product?.variations && product.variations.length > 0);
  }, [product]);

  // 1. Derive Full Attributes (options might be empty in some systems)
  const fullAttributes = useMemo(() => {
    if (!product) return [];
    if (!isMatrixSystem) {
      return (product.variants || []).map(v => ({
        name: v.name,
        options: v.options.map(o => ({
          name: o.name,
          priceModifier: Number(o.priceModifier) || 0
        }))
      }));
    }

    return (product.attributes || []).map(attr => {
      // If options are already provided, use them
      if (attr.options && attr.options.length > 0) return attr;

      // Otherwise, derive unique options from variations
      const uniqueValues = new Set<string>();
      product.variations?.forEach(v => {
        const val = v.combination[attr.name] || v.combination[attr.name.toLowerCase()];
        if (val) uniqueValues.add(val);
      });

      return {
        ...attr,
        options: Array.from(uniqueValues).map(val => ({ name: val, priceModifier: 0 }))
      };
    });
  }, [product, isMatrixSystem]);

  // Calculate all valid combinations based on current selections
  // This is used for "Add to Cart" and Pricing
  const selectedCombinations = useMemo(() => {
    if (!isMatrixSystem || !product?.variations) return [];

    // Filter variations that match ANY of the selected values for EACH attribute
    // (AND between attributes, OR within attribute)
    return product.variations.filter(v => {
      const normalizedCombo = Object.fromEntries(
        Object.entries(v.combination).map(([k, val]) => [k.toLowerCase(), val])
      );

      // Must match at least one selected option for every attribute that has a selection
      return Object.entries(selectedVariants).every(([key, values]) => {
        if (!values || values.length === 0) return true; // Ignore if no selection for this attribute
        const variantVal = normalizedCombo[key.toLowerCase()];
        return variantVal && values.some(val => val.toLowerCase() === variantVal.toLowerCase());
      });
    });
  }, [product, selectedVariants, isMatrixSystem]);

  const currentVariation = useMemo(() => {
    // Return the specific variation if exactly one combination is selected (for display purposes)
    // Or just return the first match from selectedCombinations
    if (selectedCombinations.length > 0) {
      return selectedCombinations[0];
    }
    return null;
  }, [selectedCombinations]);


  // 2. Helper to check if a specific option is valid given the *other* current selections
  const isOptionAvailableInMatrix = (attributeName: string, optionValue: string) => {
    if (!isMatrixSystem || !product?.variations) return true;

    // Check if any variation matches the current selection + this option
    return product.variations.some(v => {
      const normalizedCombo = Object.fromEntries(
        Object.entries(v.combination).map(([k, val]) => [k.toLowerCase(), val])
      );

      // Check current option
      const currentVal = normalizedCombo[attributeName.toLowerCase()];
      if (currentVal?.toLowerCase() !== optionValue.toLowerCase()) return false;

      // Check against other selected options (must match AT LEAST ONE from each selected attribute)
      return Object.entries(selectedVariants).every(([key, values]) => {
        if (key.toLowerCase() === attributeName.toLowerCase()) return true; // Skip current attribute being checked
        if (!values || values.length === 0) return true;

        const variantVal = normalizedCombo[key.toLowerCase()];
        return variantVal && values.some(val => val.toLowerCase() === variantVal.toLowerCase());
      });
    });
  };

  // 3. Helper to get the best price for an option given current selections
  const getOptionPrice = (attributeName: string, optionValue: string) => {
    if (!product) return null;

    if (isMatrixSystem) {
      // Find variations that match this option + existing selections (excluding the current attribute)
      const matches = product.variations?.filter(v => {
        const normalizedCombo = Object.fromEntries(
          Object.entries(v.combination).map(([k, val]) => [k.toLowerCase(), val])
        );

        if (normalizedCombo[attributeName.toLowerCase()]?.toLowerCase() !== optionValue.toLowerCase()) return false;

        return Object.entries(selectedVariants).every(([key, values]) => {
          if (key.toLowerCase() === attributeName.toLowerCase()) return true;
          if (!values || values.length === 0) return true;
          return values.some(val => val.toLowerCase() === normalizedCombo[key.toLowerCase()]?.toLowerCase());
        });
      });

      if (!matches || matches.length === 0) return null;

      const prices = matches.map(m => m.salePrice && m.salePrice < m.price ? m.salePrice : m.price);
      return Math.min(...prices);
    }

    // Legacy system logic (simplified for multi-select, assuming standard add-on pricing)
    const base = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    const variant = product.variants?.find(v => v.name === attributeName);
    const option = variant?.options.find(o => o.name === optionValue);
    if (!option) return base;

    return base + (Number(option.priceModifier) || 0);
  };

  const handleVariantChange = (variantName: string, optionName: string) => {
    setSelectedVariants((prev) => {
      const current = prev[variantName] || [];
      const exists = current.includes(optionName);

      let newValues;
      if (exists) {
        newValues = current.filter(v => v !== optionName);
      } else {
        newValues = [...current, optionName];
      }

      return {
        ...prev,
        [variantName]: newValues
      };
    });
  };

  // Check if all required variants are selected
  const allVariantsSelected = useMemo(() => {
    if (!product) return false;
    return fullAttributes.every(attr => selectedVariants[attr.name] && selectedVariants[attr.name].length > 0);
  }, [product, fullAttributes, selectedVariants]);

  const { basePrice, totalPrice, priceBreakdown, isOutOfStock, priceRange, displayVariation } = useMemo(() => {
    if (!product) return { basePrice: 0, totalPrice: 0, priceBreakdown: [], isOutOfStock: false, priceRange: null, displayVariation: null };

    // MATRIX SYSTEM PRICE/STOCK & DISPLAY LOGIC
    if (isMatrixSystem) {
      const hasSelections = Object.keys(selectedVariants).length > 0;
      const potentialMatches = hasSelections ? selectedCombinations : (product.variations || []);

      const displayStatsVariation = currentVariation || potentialMatches[0] || null;

      let computedPriceRange = null;
      let computedBasePrice = product.price;
      let computedTotalPrice = product.price;

      const prices = potentialMatches.map(v => v.salePrice && v.salePrice < v.price ? v.salePrice : v.price).filter(p => p !== undefined);

      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        computedBasePrice = min;

        if (allVariantsSelected) {
          // Sum all valid combinations if fully selected
          const sum = potentialMatches.reduce((acc, v) => acc + (v.salePrice && v.salePrice < v.price ? v.salePrice : v.price), 0);
          computedTotalPrice = sum;
          computedPriceRange = null;
        } else {
          // Range of unit prices
          computedTotalPrice = min;
          if (min !== max) {
            computedPriceRange = { min, max, startPrice: min };
          } else {
            computedPriceRange = null;
          }
        }
      }

      return {
        basePrice: computedBasePrice,
        totalPrice: computedTotalPrice,
        priceBreakdown: [],
        isOutOfStock: potentialMatches.every(v => !v.available || v.stock <= 0),
        priceRange: computedPriceRange,
        displayVariation: displayStatsVariation // Export for other components
      };
    }

    // LEGACY SYSTEM PRICE/STOCK (Fallback using first selected option)
    const base = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    let total = base;
    const breakdown: { label: string; amount: number }[] = [];
    breakdown.push({ label: 'Base Price', amount: base });

    fullAttributes.forEach((attr) => {
      const values = selectedVariants[attr.name];
      if (values && values.length > 0) {
        const selectedOptionName = values[0];
        const selectedOption = attr.options.find((opt) => opt.name === selectedOptionName);
        if (selectedOption) {
          const mod = Number(selectedOption.priceModifier) || 0;
          total += mod;
          if (mod !== 0) {
            breakdown.push({ label: `${attr.name}: ${selectedOptionName}`, amount: mod });
          }
        }
      }
    });

    return { basePrice: base, totalPrice: total, priceBreakdown: breakdown, isOutOfStock: false, displayVariation: null };
  }, [product, selectedVariants, isMatrixSystem, currentVariation, fullAttributes, allVariantsSelected, selectedCombinations]);

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

    let addedCount = 0;

    // Iterate through all valid combinations resulting from the selection crossproduct
    selectedCombinations.forEach(v => {
      addItemToCart({
        productId: id,
        quantity: 1,
        selectedVariants: v.combination,
      });
      addedCount++;
    });

    toast.success(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to cart`);
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
    const combinedMedia = [...(product.fileUrls || []), ...(product.media || [])];
    const baseImages = combinedMedia.length > 0
      ? combinedMedia
      : [product.imageUrl || 'https://via.placeholder.com/500'];

    // Find the best image to show based on current selection
    let variantImage = displayVariation?.image;

    if (variantImage) {
      // Avoid duplicating if the variant image is already in baseImages
      const uniqueBaseImages = baseImages.filter(img => img !== variantImage);
      return [variantImage, ...uniqueBaseImages];
    }
    return baseImages;
  }, [product, displayVariation, isMatrixSystem]);

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
              <ProductFacts product={product} variation={displayVariation || undefined} />
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
                      {priceRange && !allVariantsSelected ? (
                        <>£{priceRange.min.toFixed(2)} - £{priceRange.max.toFixed(2)}</>
                      ) : (
                        <>£{totalPrice.toFixed(2)}</>
                      )}
                    </span>
                    {currentVariation && currentVariation.salePrice && currentVariation.salePrice < currentVariation.price && (
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

                {/* Dynamic Variant Selector (Supports Matrix & Legacy) */}
                {fullAttributes.length > 0 && (
                  <div className="space-y-6 border-t border-gray-100 pt-6 mb-6">
                    <VisualVariantSelector
                      attributes={fullAttributes}
                      selectedVariants={selectedVariants}
                      onChange={handleVariantChange}
                      isOptionAvailable={isOptionAvailableInMatrix}
                      getOptionPrice={getOptionPrice}
                      variations={product.variations}
                      baseMedia={product.fileUrls || product.media}
                      sizeGuide={product.sizeGuide}
                      productGender={product.gender}
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
