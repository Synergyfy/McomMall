'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Star, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MarketplaceFiltersState = {
  categories: string[];
  priceRange: [number, number];
  brands: string[];
  minRating: number | null;
};

interface MarketplaceSidebarProps {
  categories: { name: string; count?: number }[];
  brands: { name: string; count?: number }[];
  maxPrice?: number;
  initialFilters?: Partial<MarketplaceFiltersState>;
  onFilterChange: (filters: MarketplaceFiltersState) => void;
  className?: string;
}

export default function MarketplaceSidebar({
  categories,
  brands,
  maxPrice = 5000,
  initialFilters,
  onFilterChange,
  className,
}: MarketplaceSidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || []);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters?.priceRange || [0, maxPrice]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters?.brands || []);
  const [minRating, setMinRating] = useState<number | null>(initialFilters?.minRating || null);
  const [brandSearch, setBrandSearch] = useState('');

  const handleCategoryChange = (category: string) => {
    let newCategories;
    if (selectedCategories.includes(category)) {
      newCategories = selectedCategories.filter((c) => c !== category);
    } else {
      newCategories = [...selectedCategories, category];
    }
    setSelectedCategories(newCategories);
    triggerChange({ categories: newCategories });
  };

  const handleBrandChange = (brand: string) => {
    let newBrands;
    if (selectedBrands.includes(brand)) {
      newBrands = selectedBrands.filter((b) => b !== brand);
    } else {
      newBrands = [...selectedBrands, brand];
    }
    setSelectedBrands(newBrands);
    triggerChange({ brands: newBrands });
  };

  const handlePriceChange = (value: number[]) => {
    const newRange = [value[0], value[1]] as [number, number];
    setPriceRange(newRange);
    // Debounce this in a real app, or trigger on release
    triggerChange({ priceRange: newRange });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = minRating === rating ? null : rating;
    setMinRating(newRating);
    triggerChange({ minRating: newRating });
  };

  const triggerChange = (updates: Partial<MarketplaceFiltersState>) => {
    onFilterChange({
      categories: selectedCategories,
      priceRange,
      brands: selectedBrands,
      minRating,
      ...updates,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSelectedBrands([]);
    setMinRating(null);
    onFilterChange({
      categories: [],
      priceRange: [0, maxPrice],
      brands: [],
      minRating: null,
    });
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className={cn("bg-white p-4 rounded-lg border border-gray-100 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filters
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-8"
          onClick={handleClearFilters}
        >
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['category', 'price', 'brand', 'rating']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.name}`}
                    checked={selectedCategories.includes(cat.name)}
                    onCheckedChange={() => handleCategoryChange(cat.name)}
                  />
                  <Label
                    htmlFor={`cat-${cat.name}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    {cat.name}
                  </Label>
                  {cat.count !== undefined && (
                    <span className="text-xs text-gray-400">({cat.count})</span>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline">
            Price (GBP)
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-1 pt-4 pb-4">
              <Slider
                defaultValue={[0, maxPrice]}
                value={[priceRange[0], priceRange[1]]}
                max={maxPrice}
                step={10}
                minStepsBetweenThumbs={1}
                onValueChange={handlePriceChange}
                className="mb-6"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Min</span>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange([Number(e.target.value), priceRange[1]])}
                    className="h-8 text-xs"
                    min={0}
                    max={priceRange[1]}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Max</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
                    className="h-8 text-xs"
                    min={priceRange[0]}
                    max={maxPrice}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search brands..."
                className="h-9 pl-8 text-xs bg-gray-50"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredBrands.length === 0 ? (
                 <p className="text-xs text-gray-400 py-2 text-center">No brands found</p>
              ) : (
                filteredBrands.map((brand) => (
                  <div key={brand.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.name}`}
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={() => handleBrandChange(brand.name)}
                    />
                    <Label
                      htmlFor={`brand-${brand.name}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                    >
                      {brand.name}
                    </Label>
                    {brand.count !== undefined && (
                      <span className="text-xs text-gray-400">({brand.count})</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline">
            Product Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((stars) => (
                <div
                  key={stars}
                  className={cn(
                    "flex items-center cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-colors",
                    minRating === stars && "bg-orange-50 ring-1 ring-orange-200"
                  )}
                  onClick={() => handleRatingChange(stars)}
                >
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4 mr-0.5",
                          i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">& up</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
