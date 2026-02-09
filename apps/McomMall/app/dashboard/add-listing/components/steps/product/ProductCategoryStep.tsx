import React, { useMemo } from 'react';
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
import {
  useGetSectors,
  useGetCategoriesBySector,
  useGetSubCategoriesByCategory,
} from '@/service/taxonomy/hook';

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
  const productData = formData.productData || {};

  // --- Level 1: Sectors ---
  const { data: sectors = [] } = useGetSectors();

  // Find selected sector object to get ID for next level
  const selectedSector = useMemo(
    () => sectors.find(s => s.id === productData.primaryCategory),
    [sectors, productData.primaryCategory]
  );

  // --- Level 2: Categories ---
  const { data: categories = [], isFetching: isCategoriesLoading } =
    useGetCategoriesBySector(selectedSector?.id || '');

  // Find selected category object to get ID for next level
  const selectedCategory = useMemo(
    () => categories.find(c => c.id === productData.subCategory),
    [categories, productData.subCategory]
  );

  // --- Level 3: SubCategories ---
  const { data: subCategoriesList = [], isFetching: isSubCategoriesLoading } =
    useGetSubCategoriesByCategory(selectedCategory?.id || '');

  const handlePrimaryCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        primaryCategory: value,
        subCategory: '', // Reset Level 2
        subCategories: [], // Reset Level 3
      },
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        subCategory: value,
        subCategories: [], // Reset Level 3
      },
    }));
  };

  const handleSubCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        subCategories: [value], // Store as single item in array
      },
    }));
  };

  // Get current Level 3 value (first item in array)
  const currentSubCategory = productData.subCategories?.[0] || '';

  return (
    <div className="space-y-6">
      {/* Level 1: Sector */}
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
            {sectors.map(sector => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors['productData.primaryCategory'] && (
          <p className="text-sm text-red-500">
            {errors['productData.primaryCategory']}
          </p>
        )}
      </div>

      {/* Level 2: Category */}
      <div>
        <Label htmlFor="subCategory">Category</Label>
        <Select
          value={productData.subCategory}
          onValueChange={handleCategoryChange}
          disabled={!productData.primaryCategory || isCategoriesLoading}
        >
          <SelectTrigger id="subCategory">
            <SelectValue
              placeholder={
                isCategoriesLoading ? 'Loading...' : 'Select a category'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level 3: SubCategory */}
      <div>
        <Label htmlFor="subCategory3">Sub-Category</Label>
        <Select
          value={currentSubCategory}
          onValueChange={handleSubCategoryChange}
          disabled={!productData.subCategory || isSubCategoriesLoading}
        >
          <SelectTrigger id="subCategory3">
            <SelectValue
              placeholder={
                isSubCategoriesLoading ? 'Loading...' : 'Select a sub-category'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {subCategoriesList.map(sub => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!productData.primaryCategory && (
        <p className="text-xs text-muted-foreground mt-1">
          Please select a sector to see available categories.
        </p>
      )}
    </div>
  );
};

export default ProductCategoryStep;
