'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionalItem } from '@/lib/listing-data';

interface ProductCardProps {
  product: PromotionalItem;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  // Mock rating since it's not in the type yet, derived deterministically from ID
  // Using a simple hash of the ID ensures SSR and CSR match
  const idNum = typeof product.id === 'number'
    ? product.id
    : product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const pseudoRandom = (idNum * 9301 + 49297) % 233280 / 233280;
  const rating = 3.5 + (pseudoRandom * 1.5); // Rating between 3.5 and 5.0
  const reviewCount = Math.floor(pseudoRandom * 200) + 10;

  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image Section */}
        <div className="relative w-full sm:w-64 h-64 sm:h-auto flex-shrink-0 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white border-0 rounded-md px-2 py-1 z-10">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-6">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500 font-medium">{product.category}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <Link href={`/products/${product.id}`} className="group-hover:text-primary transition-colors">
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
              £{(product.discountedPrice || product.price).toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-lg text-gray-400 line-through">
                £{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center gap-3">
             <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="border-gray-200 hover:border-primary hover:text-primary">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      {/* Image Container */}
      <div className="relative h-64 w-full bg-gray-50 overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm">
              -{discountPercentage}%
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

        {/* Quick Add Overlay (Optional style) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex justify-center">
             <Button size="sm" className="w-full bg-primary text-white hover:bg-primary/90">
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
             </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">{product.category}</div>
        <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 hover:text-primary transition-colors h-10" title={product.title}>
            {product.title}
            </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              )}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1.5">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                £{(product.discountedPrice || product.price).toFixed(2)}
                </span>
                {product.discountedPrice && (
                <span className="text-xs text-gray-400 line-through">
                    £{product.price.toFixed(2)}
                </span>
                )}
            </div>
            {/* Mobile-friendly Add button for when hover isn't possible? Or just rely on the overlay */}
        </div>
      </div>
    </div>
  );
}
