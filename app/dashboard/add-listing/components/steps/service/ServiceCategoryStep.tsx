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
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
  } from '@/components/ui/command';
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

const ServiceCategoryStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  schema,
}) => {
  const serviceData = formData.serviceData || {};

  const handlePrimaryCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        primaryCategory: value,
        tradeCategory: '', // Reset subcategory
      },
    }));
  };

  const handleSubCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        tradeCategory: value,
      },
    }));
  };

  const availableSubCategories = useMemo(() => {
    if (!serviceData.primaryCategory) return [];
    const category = businessCategories.find(c => c.name === serviceData.primaryCategory);
    return category ? category.subCategories : [];
  }, [serviceData.primaryCategory]);

  return (
    <div className="space-y-6">
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
            {businessCategories.map(cat => (
              <SelectItem key={cat.name} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors['serviceData.primaryCategory'] && (
          <p className="text-sm text-red-500">{errors['serviceData.primaryCategory']}</p>
        )}
      </div>

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
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!serviceData.primaryCategory}
                >
                    {serviceData.tradeCategory || "Select a trade or industry"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        {availableSubCategories.map(sub => (
                            <CommandItem
                                key={sub.name}
                                onSelect={() => handleSubCategoryChange(sub.name)}
                                className="cursor-pointer"
                            >
                                {sub.name}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
        {errors['serviceData.tradeCategory'] && (
            <p className="text-sm text-red-500">{errors['serviceData.tradeCategory']}</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCategoryStep;
