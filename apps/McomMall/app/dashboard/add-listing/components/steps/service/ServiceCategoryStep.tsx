import React, { useMemo, useState } from 'react';
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
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import {
  useGetSectors,
  useGetCategoriesBySector,
  useGetSubCategoriesByCategory,
} from '@/service/taxonomy/hook';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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

const ServiceCategoryStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  schema,
}) => {
  const [open, setOpen] = useState(false);
  const serviceData = formData.serviceData || {};

  // --- Level 1: Sectors ---
  const { data: sectors = [] } = useGetSectors();

  const selectedSector = useMemo(
    () => sectors.find(s => s.id === serviceData.primaryCategory),
    [sectors, serviceData.primaryCategory]
  );

  // --- Level 2: Categories (Trade) ---
  const { data: categories = [], isFetching: isCategoriesLoading } =
    useGetCategoriesBySector(selectedSector?.id || '');

  const selectedCategory = useMemo(
    () => categories.find(c => c.id === serviceData.tradeCategory),
    [categories, serviceData.tradeCategory]
  );

  // --- Level 3: SubCategories ---
  const { data: subCategoriesList = [], isFetching: isSubCategoriesLoading } =
    useGetSubCategoriesByCategory(selectedCategory?.id || '');

  const handlePrimaryCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        primaryCategory: value,
        tradeCategory: '', // Reset Level 2
        subCategories: [], // Reset Level 3
      },
    }));
  };

  const handleTradeCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        tradeCategory: value,
        subCategories: [], // Reset Level 3
      },
    }));
  };

  const handleSubCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        subCategories: [value],
      },
    }));
  };

  const currentSubCategory = serviceData.subCategories?.[0] || '';

  return (
    <div className="space-y-6">
      {/* Level 1: Sector */}
      <div>
        <Label htmlFor="primaryCategory">
          Sector
          {isFieldOptional(schema!, 'serviceData.primaryCategory') && (
            <span className="text-muted-foreground font-normal text-sm">
              {' '}
              (optional)
            </span>
          )}
        </Label>
        <Select
          value={serviceData.primaryCategory}
          onValueChange={handlePrimaryCategoryChange}
        >
          <SelectTrigger id="primaryCategory">
            <SelectValue placeholder="Select a sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors['serviceData.primaryCategory'] && (
          <p className="text-sm text-red-500">{errors['serviceData.primaryCategory']}</p>
        )}
      </div>

      {/* Level 2: Trade/Industry (Category) */}
      <div>
        <Label htmlFor="tradeCategory">
          Trade/Industry Section
          {isFieldOptional(schema!, 'serviceData.tradeCategory') && (
            <span className="text-muted-foreground font-normal text-sm">
              {' '}
              (optional)
            </span>
          )}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={!serviceData.primaryCategory || isCategoriesLoading}
            >
              {serviceData.tradeCategory
                ? categories.find(c => c.id === serviceData.tradeCategory)?.name
                : isCategoriesLoading ? "Loading..." : "Select a trade or industry"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categories.map(sub => (
                    <CommandItem
                      key={sub.id}
                      value={sub.id}
                      onSelect={(currentValue) => {
                        handleTradeCategoryChange(sub.id); // Store ID
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          serviceData.tradeCategory === sub.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {sub.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors['serviceData.tradeCategory'] && (
          <p className="text-sm text-red-500">{errors['serviceData.tradeCategory']}</p>
        )}
      </div>

      {/* Level 3: Sub-Category */}
      <div>
        <Label htmlFor="subCategory3">Sub-Category</Label>
        <Select
          value={currentSubCategory}
          onValueChange={handleSubCategoryChange}
          disabled={!serviceData.tradeCategory || isSubCategoriesLoading}
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

    </div>
  );
};

export default ServiceCategoryStep;
