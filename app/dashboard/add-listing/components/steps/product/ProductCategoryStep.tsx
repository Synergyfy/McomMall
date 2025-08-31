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
        subCategories: [], // Reset items, as they are no longer used
      },
    }));
  };

  const availableSubCategories = useMemo(() => {
    if (!productData.primaryCategory) return [];
    const category = businessCategories.find(c => c.name === productData.primaryCategory);
    return category ? category.subCategories : [];
  }, [productData.primaryCategory]);

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

        {!productData.primaryCategory && (
          <p className="text-xs text-muted-foreground mt-1">
            Please select a sector to see available sub-sections.
          </p>
        )}
    </div>
  );
};

export default ProductCategoryStep;
