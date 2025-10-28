import React from 'react';
import { ListingFormData } from '../../../types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ShippingSectionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

const ShippingSection: React.FC<ShippingSectionProps> = ({ formData, setFormData }) => {
  const productData = formData.productData || {};

  const handleShippingMethodChange = (value: 'free' | 'pickup' | 'delivery') => {
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, shippingMethod: value },
    }));
  };

  const handleDeliveryOptionsChange = (option: 'local' | 'uk-wide') => {
    const currentOptions = productData.deliveryOptions || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter(item => item !== option)
      : [...currentOptions, option];
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, deliveryOptions: newOptions },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Shipping Method</Label>
        <Select onValueChange={handleShippingMethodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a shipping method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free Delivery</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="delivery">Delivery Options</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {productData.shippingMethod === 'delivery' && (
        <div>
          <Label>Delivery Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="local"
              onCheckedChange={() => handleDeliveryOptionsChange('local')}
              checked={productData.deliveryOptions?.includes('local')}
            />
            <Label htmlFor="local">Local Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uk-wide"
              onCheckedChange={() => handleDeliveryOptionsChange('uk-wide')}
              checked={productData.deliveryOptions?.includes('uk-wide')}
            />
            <Label htmlFor="uk-wide">UK-Wide Shipping</Label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingSection;
