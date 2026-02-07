'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MarketplaceCategory } from '@/service/marketplace/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryScrollMenuProps {
    categories: MarketplaceCategory[];
    selectedId: string | undefined;
    onSelect: (id: string | undefined) => void;
    isLoading?: boolean;
}

export default function CategoryScrollMenu({
    categories,
    selectedId,
    onSelect,
    isLoading = false,
}: CategoryScrollMenuProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-hidden py-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                ))}
            </div>
        );
    }

    if (!categories || categories.length === 0) return null;

    return (
        <div className="relative group">
            {/* Scroll Buttons - Visible on hover/desktop */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md bg-white/80 backdrop-blur-sm border border-gray-100"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md bg-white/80 backdrop-blur-sm border border-gray-100"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-4 pt-2 px-1 w-full max-w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <Button
                    variant="ghost"
                    onClick={() => onSelect(undefined)}
                    className={cn(
                        "rounded-full whitespace-nowrap px-6 border transition-all flex-shrink-0 h-10",
                        !selectedId
                            ? "bg-black text-white hover:bg-black/90 border-transparent shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    )}
                >
                    All
                </Button>
                {categories.map((category) => {
                    const isActive = selectedId === category.targetCategoryId || selectedId === category.id;

                    return (
                        <Button
                            key={category.id}
                            variant="ghost"
                            onClick={() => onSelect(category.targetCategoryId || category.id)}
                            className={cn(
                                "rounded-full whitespace-nowrap px-6 border transition-all flex-shrink-0 h-10",
                                isActive
                                    ? "bg-black text-white hover:bg-black/90 border-transparent shadow-sm"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                            )}
                        >
                            {category.name}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
