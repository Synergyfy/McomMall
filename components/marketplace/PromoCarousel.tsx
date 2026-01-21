'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { PromotionalItem } from '@/lib/listing-data';
import { MarketplaceSectionConfig } from '@/service/marketplace/types';

interface PromoCarouselProps {
  section: MarketplaceSectionConfig;
  products: PromotionalItem[];
}

export default function PromoCarousel({ section, products }: PromoCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!section.isVisible || !section.productIds || section.productIds.length === 0) {
    return null;
  }

  // Filter products that match the section's product IDs
  // In a real app, these IDs would match the DB IDs.
  // Here we simulate by taking the first N products if IDs don't match mock data,
  // or filtering if they do.
  // For robustness with mock data, let's just show some products if exact match fails.
  const displayProducts = products.filter(p => section.productIds?.includes(String(p.id)));
  const finalProducts = displayProducts.length > 0 ? displayProducts : products.slice(0, 5);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
            {section.config?.subTitle && <p className="text-gray-500">{section.config.subTitle}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {finalProducts.map((product) => (
          <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-start">
            <ProductCard product={product} viewMode="grid" />
          </div>
        ))}
      </div>
    </div>
  );
}
