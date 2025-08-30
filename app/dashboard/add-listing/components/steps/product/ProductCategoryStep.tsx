import React, { useState, useMemo } from 'react';
import { ListingFormData } from '../../../types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { businessCategories } from '@/lib/business-categories';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
  schema?: z.ZodSchema<unknown>;
}

const isFieldOptional = (schema: z.ZodSchema<unknown>, fieldName: string) => {
  if (!schema || !('shape' in schema)) {
    return true; // Default to optional if schema is not as expected
  }
  const fieldSchema = (schema as z.ZodObject<z.ZodRawShape>).shape[fieldName];
  if (!fieldSchema) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fieldSchema as any)._def.typeName === 'ZodOptional';
};

const ProductCategoryStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  schema,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState(formData.productData?.subCategory || '');

  const productData = formData.productData || {};
  const selectedItems = productData.subCategories || [];

  const handlePrimaryCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        primaryCategory: value,
        subCategory: '', // Reset subcategory
        subCategories: [], // Reset items
      },
    }));
    setSelectedSubCategory('');
  };

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value);
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        subCategory: value,
        subCategories: [], // Reset items
      },
    }));
  };

  const handleItemSelect = (item: string) => {
    if (selectedItems.length < 5 && !selectedItems.includes(item)) {
      const newItems = [...selectedItems, item];
      setFormData(prev => ({
        ...prev,
        productData: {
          ...prev.productData,
          subCategories: newItems,
        },
      }));
    }
  };

  const handleItemRemove = (item: string) => {
    const newItems = selectedItems.filter(s => s !== item);
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        subCategories: newItems,
      },
    }));
  };

  const availableSubCategories = useMemo(() => {
    if (!productData.primaryCategory) return [];
    const category = businessCategories.find(c => c.name === productData.primaryCategory);
    return category ? category.subCategories : [];
  }, [productData.primaryCategory]);

  const availableItems = useMemo(() => {
    if (!selectedSubCategory) return [];
    const subCategory = availableSubCategories.find(s => s.name === selectedSubCategory);
    return subCategory ? subCategory.items || [] : [];
  }, [selectedSubCategory, availableSubCategories]);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primaryCategory">
          Sector
          {isFieldOptional(schema!, 'productData.primaryCategory') && (
            <span className="text-muted-foreground font-normal text-sm">
              {' '}
              (optional)
            </span>
          )}
        </Label>
        <Select
          value={productData.primaryCategory}
          onValueChange={handlePrimaryCategoryChange}
        >
          <SelectTrigger id="primaryCategory">
            <SelectValue placeholder="Select a sector" />
          </SelectTrigger>
          <SelectContent>
            {businessCategories.map(cat => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors['productData.primaryCategory'] && (
          <p className="text-sm text-red-500">{errors['productData.primaryCategory']}</p>
        )}
      </div>

      <div>
        <Label htmlFor="subCategory">
          Sub-Section
        </Label>
        <Select
          value={selectedSubCategory}
          onValueChange={handleSubCategoryChange}
          disabled={!productData.primaryCategory}
        >
          <SelectTrigger id="subCategory">
            <SelectValue placeholder="Select a sub-section" />
          </SelectTrigger>
          <SelectContent>
            {availableSubCategories.map(sub => (
              <SelectItem key={sub.name} value={sub.name}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>
          Services / Specialisms
          <span className="text-muted-foreground font-normal text-sm">
            {' '}
            (optional, up to 5)
          </span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={!selectedSubCategory || availableItems.length === 0}
            >
              Select services or specialisms...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                {availableItems.map(item => (
                  <CommandItem
                    key={item}
                    onSelect={() => handleItemSelect(item)}
                    disabled={selectedItems.includes(item)}
                    className="cursor-pointer"
                  >
                    {item}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedItems.map(item => (
            <Badge key={item} variant="secondary">
              {item}
              <button
                onClick={() => handleItemRemove(item)}
                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
        {!productData.primaryCategory && (
          <p className="text-xs text-muted-foreground mt-1">
            Please select a sector to see available sub-sections.
          </p>
        )}
        {productData.primaryCategory && !selectedSubCategory && (
          <p className="text-xs text-muted-foreground mt-1">
            Please select a sub-section to see available specialisms.
          </p>
        )}
        {selectedSubCategory && availableItems.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
                No specialisms available for this sub-section.
            </p>
        )}
      </div>
    </div>
  );
};

export default ProductCategoryStep;
