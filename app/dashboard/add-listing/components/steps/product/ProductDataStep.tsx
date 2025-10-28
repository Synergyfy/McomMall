import React, { useState } from 'react';
import { ListingFormData } from '../../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import SKUSection from './SKUSection';
import ShippingSection from './ShippingSection';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
}

const ProductDataStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const productData = formData.productData || {};
  const [price, setPrice] = useState(productData.price || 0);
  const [discountedPrice, setDiscountedPrice] = useState(productData.discountedPrice || 0);
  const [priceError, setPriceError] = useState('');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value);
    setPrice(newPrice);
    if (newPrice <= discountedPrice) {
      setPriceError('Price must be greater than the discounted price.');
    } else {
      setPriceError('');
    }
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, price: newPrice },
    }));
  };

  const handleDiscountedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDiscountedPrice = parseInt(e.target.value);
    setDiscountedPrice(newDiscountedPrice);
    if (price <= newDiscountedPrice) {
      setPriceError('Price must be greater than the discounted price.');
    } else {
      setPriceError('');
    }
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, discountedPrice: newDiscountedPrice },
    }));
  };


  const handleAddVariant = () => {
    const newVariant = { name: '', description: '', options: [{ name: '', quantity: 0 }] };
    const variants = [...(productData.variants || []), newVariant];
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, variants },
    }));
  };

  const handleRemoveVariant = (index: number) => {
    const variants = [...(productData.variants || [])];
    variants.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, variants },
    }));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const variants = [...(productData.variants || [])];
    variants[index] = { ...variants[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, variants },
    }));
  };

  const handleOptionChange = (variantIndex: number, optionIndex: number, field: string, value: string | number) => {
    const variants = [...(productData.variants || [])];
    variants[variantIndex].options[optionIndex] = { ...variants[variantIndex].options[optionIndex], [field]: value };
    setFormData(prev => ({
      ...prev,
      productData: { ...prev.productData, variants },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Product Type</Label>
        <div className="flex items-center space-x-2">
          <Select onValueChange={(value) => setFormData(prev => ({...prev, productData: {...prev.productData, productType: value}}))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="downloadable">Downloadable</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p><strong>Physical:</strong> A tangible item that you ship to customers.</p>
                <p><strong>Downloadable:</strong> A digital file that customers download, like an e-book or software.</p>
                <p><strong>Virtual:</strong> A service or product that isn't tangible, like a consultation or a subscription.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div>
        <Label>Variants</Label>
        <p className="text-sm text-muted-foreground">
          Add variations of your product. These can be different colors, sizes, materials, or any other option you want to offer.
          You can choose from a list of common variant types or enter your own. For each variant, you can add a description and a quantity.
        </p>
        <div className="space-y-4 mt-4">
          {productData.variants?.map((variant, index) => (
            <div key={index} className="border p-4 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <Label>Variant {index + 1}</Label>
                <Button variant="destructive" size="sm" onClick={() => handleRemoveVariant(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Variant Name (e.g., Color, Size)"
                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
              />
              <Textarea
                placeholder="Description"
                value={variant.description}
                onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
              />
              {variant.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-4">
                  <Input
                    placeholder="Option Name (e.g., Red)"
                    value={option.name}
                    onChange={(e) => handleOptionChange(index, optionIndex, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="How many units of this Variant is available"
                    value={option.quantity}
                    onChange={(e) => handleOptionChange(index, optionIndex, 'quantity', parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <Button onClick={handleAddVariant} className="mt-4">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>
      <div>
        <Label htmlFor="discountedPrice">Discounted Price</Label>
        <p className="text-sm text-muted-foreground">The lowest price you are willing to sell this product.</p>
        <Input id="discountedPrice" type="number" placeholder="Enter discounted price" onChange={handleDiscountedPriceChange} />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" placeholder="Enter price" onChange={handlePriceChange} />
        {priceError && <p className="text-sm text-red-500">{priceError}</p>}
      </div>
      <SKUSection formData={formData} setFormData={setFormData} />
      <ShippingSection formData={formData} setFormData={setFormData} />
    </div>
  );
};

export default ProductDataStep;
