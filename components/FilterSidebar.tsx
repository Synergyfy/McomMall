// app/components/FilterSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, Search, X } from 'lucide-react';
import CategoryFilterSidebar from './CategoryFilterSidebar';

export type FilterState = {
  searchTerm: string;
  category: string;
  subCategories: string[];
  location: string;
  radius: number;
  priceRange: [number, number];
};

interface FilterSidebarProps {
  initialState?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
  onClose: () => void;
}

export default function FilterSidebar({
  initialState,
  onFilterChange,
  onClose,
}: FilterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState(initialState?.searchTerm || '');
  const [category, setCategory] = useState(initialState?.category || '');
  const [subCategories, setSubCategories] = useState(
    initialState?.subCategories || []
  );
  const [location, setLocation] = useState(initialState?.location || '');
  const [radius, setRadius] = useState([initialState?.radius || 50]);
  const [priceRange, setPriceRange] = useState(
    initialState?.priceRange || [20, 500]
  );

  useEffect(() => {
    if (initialState) {
      setSearchTerm(initialState.searchTerm || '');
      setCategory(initialState.category || '');
      setSubCategories(initialState.subCategories || []);
      setLocation(initialState.location || '');
      setRadius([initialState.radius || 50]);
      setPriceRange(initialState.priceRange || [20, 500]);
    }
  }, [initialState]);

  const handleApplyFilters = () => {
    let query = searchTerm;
    if (location) {
      query = `${searchTerm} in ${location}`;
    }
    onFilterChange({
      searchTerm: query,
      category,
      subCategories,
      location,
      radius: radius[0],
      priceRange: [priceRange[0] ?? 0, priceRange[1] ?? 0] as [number, number],
    });
    onClose();
  };

  return (
    <aside className="relative h-full w-full flex flex-col bg-gray-50 border-r overflow-hidden">
      {/* This button is only visible on mobile and closes the sidebar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 md:hidden"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="p-3 h-full flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Filters</h2>
        <div className="flex-1 overflow-y-auto pr-2 space-y-7 custom-scrollbar">
          <div>
            <Label
              htmlFor="search"
              className="text-sm font-medium text-gray-600"
            >
              AI Search
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="search"
                placeholder="Search for anything..."
                className="pl-10 focus-visible:ring-red-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <CategoryFilterSidebar
            initialCategory={category}
            initialSubCategories={subCategories}
            onCategoryChange={setCategory}
            onSubCategoryChange={setSubCategories}
          />

          {/* Location */}
          <div>
            <Label
              htmlFor="location"
              className="text-sm font-medium text-gray-600"
            >
              Location
            </Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="location"
                placeholder="Type in a location..."
                className="pl-10 focus-visible:ring-red-500"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Radius Slider */}
          <div>
            <Label className="text-sm font-medium text-gray-600">
              Radius around destination
            </Label>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={100}
              step={1}
              className="mt-3"
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              {radius[0]}km
            </p>
          </div>
        </div>

        <div className="pt-6 mt-4 border-t">
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-red-500 text-base font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </aside>
  );
}
