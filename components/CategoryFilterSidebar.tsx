// components/CategoryFilterSidebar.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { businessCategories } from '@/lib/business-categories';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
    const newCategory = category === selectedCategory ? '' : category;
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

  return (
    <div className="space-y-4">
      <div>
        <Label>All Categories</Label>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={selectedCategory}
          onValueChange={handleCategoryChange}
        >
          {businessCategories.map(cat => (
            <AccordionItem key={cat.name} value={cat.name}>
              <AccordionTrigger>{cat.name}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                  {cat.subCategories.map(sub => (
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
