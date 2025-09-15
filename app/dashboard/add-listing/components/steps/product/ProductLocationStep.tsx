import React, { useState } from 'react';
import { ListingFormData } from '../../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

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

const ProductLocationStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  schema,
}) => {
  const [postcode, setPostcode] = useState('');
  const productData = formData.productData || {};
  const deliveryArea = productData.deliveryArea || {
    type: 'radius',
    value: '',
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleProductDataChange = (
    key: string,
    value: boolean | { type: 'radius' | 'postcodes'; value: string | string[] }
  ) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        [key]: value,
      },
    }));
  };

  const handleDeliveryAreaTypeChange = (type: 'radius' | 'postcodes') => {
    const newValue = type === 'postcodes' ? [] : '';
    handleProductDataChange('deliveryArea', { type, value: newValue });
  };

  const handleDeliveryAreaValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleProductDataChange('deliveryArea', {
      ...deliveryArea,
      value: e.target.value,
    });
  };

  const handlePostcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && postcode.trim()) {
      e.preventDefault();
      const newPostcodes = [
        ...((deliveryArea.value as string[]) || []),
        postcode.trim().toUpperCase(),
      ];
      handleProductDataChange('deliveryArea', {
        ...deliveryArea,
        value: newPostcodes,
      });
      setPostcode('');
    }
  };

  const removePostcode = (index: number) => {
    const newPostcodes = [...(deliveryArea.value as string[])];
    newPostcodes.splice(index, 1);
    handleProductDataChange('deliveryArea', {
      ...deliveryArea,
      value: newPostcodes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="showAddressPublicly"
            checked={productData.showAddressPublicly !== false}
            onCheckedChange={checked =>
              handleProductDataChange('showAddressPublicly', checked)
            }
          />
          <Label htmlFor="showAddressPublicly">Show address publicly</Label>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center space-x-2">
          <Label>
            Set Delivery Area
            {isFieldOptional(schema!, 'productData.deliveryArea') && (
              <span className="text-muted-foreground font-normal text-sm">
                {' '}
                (optional)
              </span>
            )}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Define where you can deliver your products.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <RadioGroup
          value={deliveryArea.type}
          onValueChange={handleDeliveryAreaTypeChange}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="radius" id="radius" />
            <Label htmlFor="radius">By radius (in miles)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="postcodes" id="postcodes" />
            <Label htmlFor="postcodes">By list of post codes</Label>
          </div>
        </RadioGroup>

        <div className="mt-4">
          {deliveryArea.type === 'radius' ? (
            <Input
              placeholder="e.g., 10"
              type="number"
              value={deliveryArea.value}
              onChange={handleDeliveryAreaValueChange}
            />
          ) : (
            <div>
              <Input
                placeholder="Enter a postcode and press Enter"
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
                onKeyDown={handlePostcodeKeyDown}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {(deliveryArea.value as string[]).map((p, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removePostcode(index)}
                      className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors['productData.deliveryArea'] && (
          <p className="text-sm text-red-500 mt-1">
            {errors['productData.deliveryArea']}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductLocationStep;
