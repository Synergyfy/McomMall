import React from 'react';
import { ListingFormData } from '../../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface SKUSectionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

const SKUSection: React.FC<SKUSectionProps> = ({ formData, setFormData }) => {
  const productData = formData.productData || {};

  const calculateTotalQuantity = () => {
    return productData.variants?.reduce((total, variant) => {
      return total + variant.options.reduce((subTotal, option) => subTotal + option.quantity, 0);
    }, 0) || 0;
  };

  const totalQuantity = calculateTotalQuantity();

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, sku: e.target.value },
    }));
  };

  const handleStockQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, stockQuantity: parseInt(e.target.value) },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
        <div className="flex items-center space-x-2">
          <Input id="sku" placeholder="Enter SKU" onChange={handleSkuChange} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>A unique code to identify your product. It can be any combination of letters and numbers.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div>
        <Label>Total Quantity</Label>
        <Input type="number" value={totalQuantity} readOnly />
        <p className="text-sm text-muted-foreground">
          This is the total quantity of all your variants. You can edit the total stock quantity below.
        </p>
      </div>
      <div>
        <Label>Stock Quantity</Label>
        <Input type="number" placeholder="Enter total stock" onChange={handleStockQuantityChange} />
      </div>
    </div>
  );
};

export default SKUSection;
