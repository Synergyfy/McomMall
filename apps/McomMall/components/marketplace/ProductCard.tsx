'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionalItem } from '@/lib/listing-data';
import { useMarketplaceContext } from '@/context/MarketplaceContext';

interface ProductCardProps {
  product: PromotionalItem;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { setSelectedItem } = useMarketplaceContext();

  const isVoucherLike = ['vouchers', 'gift-cards', 'coupons'].includes(product.category.toLowerCase()) || 
                       (product.link && (product.link.includes('/vouchers/') || product.link.includes('/gift-cards/') || product.link.includes('/coupons/')));

  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.items_left === 0;
  const isLowStock = product.items_left > 0 && product.items_left < 5;

  const rating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;

  const productLink = product.link || `/products/${product.id}`;

  const handleProductClick = () => {
    setSelectedItem(product);
  };

  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative w-full sm:w-64 h-64 sm:h-auto flex-shrink-0 bg-gray-50 overflow-hidden">
          <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-md px-2 py-1">
                -{discountPercentage}%
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-gray-800 text-white border-0 rounded-md px-2 py-1">
                Out of Stock
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-orange-500 text-white border-0 rounded-md px-2 py-1">
                Only {product.items_left} left
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow p-6">
          {/* List view content... (kept same) */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500 font-medium">{product.category}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          <Link href={productLink} onClick={handleProductClick} className="group-hover:text-primary transition-colors">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
          </Link>
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                )}
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">({reviewCount} reviews)</span>
          </div>
          <div className="flex items-baseline space-x-3 mb-6">
            <span className="text-2xl font-bold text-gray-900">
              £{Number(product.discountedPrice || product.price || 0).toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-lg text-gray-400 line-through">
                £{Number(product.price || 0).toFixed(2)}
              </span>
            )}
          </div>
          <div className="mt-auto flex items-center gap-3">
            <Link href={productLink} onClick={handleProductClick} className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isVoucherLike ? 'Buy Now' : 'Add to Cart'}
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="border-gray-200 hover:border-primary hover:text-primary">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const minPrice = product.fixedAmounts && product.fixedAmounts.length > 0 
    ? Math.min(...product.fixedAmounts) 
    : (product.minCustomAmount || product.price);

  const hasMultiplePrices = (product.fixedAmounts && product.fixedAmounts.length > 1) || product.allowCustomAmount;

  // Grid View - Enforced Sizing
  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-[340px] md:h-[400px] relative w-full">
      {/* Image Container - Fixed Height */}
      <div className="relative h-[160px] md:h-[220px] w-full bg-gray-50 overflow-hidden flex-shrink-0">
        <img src={product.image} alt={product.title} className={`absolute inset-0 w-full h-full ${cn(
            "object-cover transition-transform duration-700 group-hover:scale-110",
            isOutOfStock && "grayscale opacity-70"
          )}`} />

        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 md:gap-2 z-10">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm text-[10px] md:text-xs px-1.5 py-0 md:px-2 md:py-0.5">
              -{discountPercentage}%
            </Badge>
          )}
          {product.bonusAmount && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm text-[10px] md:text-xs px-1.5 py-0 md:px-2 md:py-0.5">
              Bonus
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="bg-gray-900 text-white border-0 shadow-sm text-[10px] md:text-xs px-1.5 py-0">
              Out of Stock
            </Badge>
          )}
          {!isOutOfStock && isLowStock && (
            <Badge className="bg-orange-500 text-white border-0 shadow-sm animate-pulse text-[10px] md:text-xs px-1.5 py-0">
              Only {product.items_left} left
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <Button variant="secondary" size="icon" className="h-9 w-9 bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 shadow-md rounded-full transition-colors">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-9 w-9 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-500 shadow-md rounded-full transition-colors">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add Overlay */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex justify-center">
            <Link href={productLink} onClick={handleProductClick} className="w-full">
              <Button size="sm" className="w-full bg-primary text-white hover:bg-primary/90 text-xs h-8 md:h-10 md:text-sm">
                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> 
                {isVoucherLike ? 'Buy Now' : 'Add to Cart'}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Product Details - Flex Grow to fill height */}
      <div className="p-2 md:p-4 flex flex-col flex-grow">
        <div className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1 font-medium uppercase tracking-wide truncate">{product.category}</div>
        <Link href={productLink} onClick={handleProductClick} className="block mb-1 md:mb-2">
          <h3 className="text-sm md:text-base font-bold text-gray-800 line-clamp-2 hover:text-primary transition-colors h-[2.5rem]" title={product.title}>
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-1 md:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3 md:w-3.5 md:h-3.5",
                i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              )}
            />
          ))}
          <span className="text-[10px] md:text-xs text-gray-400 ml-1">({reviewCount})</span>
        </div>

        {/* Price - Pushed to bottom */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold text-gray-900">
              {hasMultiplePrices && <span className="text-[10px] md:text-xs font-normal text-gray-500 mr-1">From</span>}
              £{Number(product.discountedPrice || minPrice || 0).toFixed(2)}
              {product.pricingModel === 'perHour' && <span className="text-[10px] md:text-sm font-normal text-gray-500"> / hr</span>}
            </span>
            {product.discountedPrice && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through">
                £{Number(minPrice || 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
