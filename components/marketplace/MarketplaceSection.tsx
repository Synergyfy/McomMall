'use client';

import { useQueries } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getProductById } from '@/service/store/products/hook';
import ProductCard from '@/components/marketplace/ProductCard';
import { PromotionalItem } from '@/lib/listing-data';
import { Button } from '@/components/ui/button';
import { EmbeddedProduct } from '@/service/marketplace/types';

interface MarketplaceSectionProps {
  title: string;
  productIds?: string[];
  products?: EmbeddedProduct[];
}

export default function MarketplaceSection({ title, productIds = [], products: initialProducts = [] }: MarketplaceSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use initialProducts if provided, otherwise fetch based on productIds
  const hasDirectProducts = initialProducts && initialProducts.length > 0;

  // Fetch all products in parallel ONLY if no direct products are provided
  const productQueries = useQueries({
    queries: (!hasDirectProducts && productIds.length > 0) ? productIds.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => getProductById(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })) : [],
  });

  const isLoading = !hasDirectProducts && productQueries.some((q) => q.isLoading);

  const finalProducts = useMemo(() => {
    // If we have direct products from the API response (new structure)
    if (hasDirectProducts) {
        return initialProducts.map(p => {
             // Map EmbeddedProduct to UI PromotionalItem
             // Use first fileUrl as image if available, fallback to imageUrl
             const imageUrl = (p.fileUrls && p.fileUrls.length > 0) ? p.fileUrls[0] : (p.imageUrl || 'https://placehold.co/400x400?text=No+Image');

             return {
                id: p.id,
                title: p.title,
                image: imageUrl,
                category: p.category || 'General',
                price: p.price,
                discountedPrice: p.salePrice || undefined,
                items_left: p.stock || 0,
                pricingModel: p.pricingModel,
                unitName: p.unitName,
            } as PromotionalItem;
        });
    }

    // Fallback: Use fetched products (old structure with IDs)
    return productQueries
        .map((q) => q.data)
        .filter((p) => !!p) // Filter out undefined/failed fetches
        .map((p) => {
            const image = p!.imageUrl || (p!.media && p!.media.length > 0 ? p!.media[0] : null) || 'https://placehold.co/400x400?text=No+Image';

            // Handle Service types if fetched via getProductById (assuming simplified common interface)
            // or explicit Service fetch in future.

            return {
                id: p!.id,
                title: p!.title,
                image: image,
                category: p!.category,
                price: p!.price,
                discountedPrice: p!.salePrice || undefined,
                items_left: p!.stock || 10,
                pricingModel: (p as any).pricingModel,
                unitName: (p as any).unitName,
            } as PromotionalItem;
        });
  }, [hasDirectProducts, initialProducts, productQueries]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 border-gray-200"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 border-gray-200"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : finalProducts.length > 0 ? (
        <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {finalProducts.map((product) => (
            <div key={product.id} className="min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px]">
              <ProductCard product={product} viewMode="grid" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">No products found for this section.</div>
      )}
    </div>
  );
}
