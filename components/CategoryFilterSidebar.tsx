// components/CategoryFilterSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
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
                <Accordion type="multiple" className="w-full">
                  {cat.subCategories.map(sub => (
                    <AccordionItem key={sub.name} value={sub.name}>
                      <AccordionTrigger>{sub.name}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 mt-2 pl-4">
                          {sub.items.map(item => (
                            <div
                              key={item}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={item}
                                checked={selectedSubCategories.includes(item)}
                                onCheckedChange={() =>
                                  handleSubCategoryChange(item)
                                }
                              />
                              <Label htmlFor={item} className="font-normal">
                                {item}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
