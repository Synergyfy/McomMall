// components/CategoryFilterSidebar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useGetCategories,
  useGetSubCategoriesByCategory,
} from '@/service/taxonomy/hook';

interface CategoryFilterSidebarProps {
  initialCategory?: string;
  initialSubCategories?: string[];
  onCategoryChange: (category: string) => void;
  onSubCategoryChange: (subCategories: string[]) => void;
}

export default function CategoryFilterSidebar({
  initialCategory = '',
  initialSubCategories = [],
  onCategoryChange,
  onSubCategoryChange,
}: CategoryFilterSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategories, setSelectedSubCategories] =
    useState<string[]>(initialSubCategories);

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategories();

  // Find the ID of the selected category (based on name)
  const selectedCategoryId = useMemo(() => {
    if (!categories || !selectedCategory) return undefined;
    return categories.find(c => c.name === selectedCategory)?.id;
  }, [categories, selectedCategory]);

  // Fetch subcategories based on the found ID
  const { data: subCategories, isLoading: isSubCategoriesLoading } =
    useGetSubCategoriesByCategory(selectedCategoryId || '');

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedSubCategories(initialSubCategories);
  }, [initialCategory, initialSubCategories]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategories([]);
    onCategoryChange(category); // Update parent state immediately
    onSubCategoryChange([]);
  };

  const handleSubCategoryChange = (subCategory: string) => {
    const newSubCategories = selectedSubCategories.includes(subCategory)
      ? selectedSubCategories.filter(sc => sc !== subCategory)
      : [...selectedSubCategories, subCategory];
    setSelectedSubCategories(newSubCategories);
    onSubCategoryChange(newSubCategories); // Update parent state immediately
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Category</Label>
        <Select
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          disabled={isCategoriesLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isCategoriesLoading ? 'Loading...' : 'Select a category'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categories?.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <div>
          <Label>Sub-categories</Label>
          {isSubCategoriesLoading ? (
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          ) : (
            <div className="space-y-2 mt-2">
              {subCategories && subCategories.length > 0 ? (
                subCategories.map(sub => (
                  <div key={sub.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={sub.id}
                      checked={selectedSubCategories.includes(sub.name)}
                      onCheckedChange={() => handleSubCategoryChange(sub.name)}
                    />
                    <Label htmlFor={sub.id} className="font-normal">
                      {sub.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No subcategories available.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
