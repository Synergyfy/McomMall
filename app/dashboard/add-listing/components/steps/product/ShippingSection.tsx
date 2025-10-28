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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  const handleDeliveryOptionsChange = (value: ('local' | 'uk-wide')[]) => {
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, deliveryOptions: value },
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
          <RadioGroup onValueChange={handleDeliveryOptionsChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local">Local Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="uk-wide" id="uk-wide" />
              <Label htmlFor="uk-wide">UK-Wide Shipping</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default ShippingSection;
