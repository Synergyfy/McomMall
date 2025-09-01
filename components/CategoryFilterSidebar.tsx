// components/CategoryFilterSidebar.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { businessCategories } from '@/lib/business-categories';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);
  const [selectedSubCategories, setSelectedSubCategories] =
    useState<string[]>(initialSubCategories);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedSubCategories(initialSubCategories);
  }, [initialCategory, initialSubCategories]);

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'all' ? '' : category;
    setSelectedCategory(newCategory);
    setSelectedSubCategories([]);
    onCategoryChange(newCategory);
    onSubCategoryChange([]);
  };

  const handleSubCategoryChange = (subCategory: string) => {
    const newSubCategories = selectedSubCategories.includes(subCategory)
      ? selectedSubCategories.filter(sc => sc !== subCategory)
      : [...selectedSubCategories, subCategory];
    setSelectedSubCategories(newSubCategories);
    onSubCategoryChange(newSubCategories);
  };

  const subCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = businessCategories.find(c => c.name === selectedCategory);
    return category ? category.subCategories : [];
  }, [selectedCategory]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">All Categories</Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category" className="mt-2 focus:ring-red-500">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {businessCategories.map(cat => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <div>
          <Label>Sub Categories</Label>
          <div className="space-y-2 mt-2">
            {subCategories.map(sub => (
              <div key={sub.name} className="flex items-center space-x-2">
                <Checkbox
                  id={sub.name}
                  checked={selectedSubCategories.includes(sub.name)}
                  onCheckedChange={() => handleSubCategoryChange(sub.name)}
                />
                <Label htmlFor={sub.name} className="font-normal">
                  {sub.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
