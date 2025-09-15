import React from 'react';
import { ListingFormData } from '../../../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProductSellerData } from '../../../types';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
  validationRules?: Record<string, { optional?: boolean }>;
}

const isFieldOptional = (
  rules: StepProps['validationRules'],
  fieldName: string
) => {
  if (!rules || !rules[fieldName]) {
    return true;
  }
  return rules[fieldName]?.optional === true;
};

const SellingModesStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  validationRules,
}) => {
  const productData = formData.productData || {};
  const sellingModes = productData.sellingModes || {
    inStorePickup: false,
    localDelivery: false,
    ukWideShipping: false,
  };
  const storefrontLinks = productData.storefrontLinks || {};
  const hasAgeRestrictedItems = productData.hasAgeRestrictedItems || false;

  const handleSellingModeChange = (
    id: keyof ProductSellerData['sellingModes'],
    checked: boolean
  ) => {
    setFormData(prev => {
      const currentModes = prev.productData?.sellingModes || {
        inStorePickup: false,
        localDelivery: false,
        ukWideShipping: false,
      };
      return {
        ...prev,
        productData: {
          ...prev.productData,
          sellingModes: {
            ...currentModes,
            [id]: checked,
          },
        },
      };
    });
  };

  const handleProductDataChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        [id]: value,
      },
    }));
  };

  const handleStorefrontLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        storefrontLinks: {
          ...(prev.productData?.storefrontLinks || {}),
          [id]: value,
        },
      },
    }));
  };

  const handleToggleAgeRestricted = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        hasAgeRestrictedItems: checked,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selling Modes</CardTitle>
          <CardDescription>
            Select at least one way you get products to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStorePickup"
              checked={sellingModes.inStorePickup}
              onCheckedChange={checked =>
                handleSellingModeChange('inStorePickup', !!checked)
              }
            />
            <Label htmlFor="inStorePickup">In-store Pickup</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="localDelivery"
              checked={sellingModes.localDelivery}
              onCheckedChange={checked =>
                handleSellingModeChange('localDelivery', !!checked)
              }
            />
            <Label htmlFor="localDelivery">Local Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ukWideShipping"
              checked={sellingModes.ukWideShipping}
              onCheckedChange={checked =>
                handleSellingModeChange('ukWideShipping', !!checked)
              }
            />
            <Label htmlFor="ukWideShipping">UK-wide Shipping</Label>
          </div>
          {errors['productData.sellingModes'] && (
            <p className="text-sm text-red-500">
              {errors['productData.sellingModes']}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hasAgeRestrictedItems"
              checked={!!hasAgeRestrictedItems}
              onCheckedChange={handleToggleAgeRestricted}
            />
            <Label htmlFor="hasAgeRestrictedItems">
              Contains age-restricted items
            </Label>
          </div>
          <div>
            <Label htmlFor="fulfilmentNotes">
              Fulfilment Notes
              {isFieldOptional(
                validationRules,
                'productData.fulfilmentNotes'
              ) && (
                <span className="text-muted-foreground font-normal text-sm">
                  {' '}
                  (optional)
                </span>
              )}
            </Label>
            <Textarea
              id="fulfilmentNotes"
              value={productData.fulfilmentNotes || ''}
              onChange={handleProductDataChange}
              placeholder="e.g., We deliver on Tuesdays and Fridays between 9am-5pm."
            />
          </div>
          <div>
            <Label htmlFor="returnsPolicy">
              Returns Policy
              {isFieldOptional(
                validationRules,
                'productData.returnsPolicy'
              ) && (
                <span className="text-muted-foreground font-normal text-sm">
                  {' '}
                  (optional)
                </span>
              )}
            </Label>
            <Textarea
              id="returnsPolicy"
              value={productData.returnsPolicy || ''}
              onChange={handleProductDataChange}
              placeholder="e.g., 30-day returns accepted for unopened products."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Storefronts</CardTitle>
          <CardDescription>
            Link to your stores on other platforms.
            {isFieldOptional(
              validationRules,
              'productData.storefrontLinks'
            ) && (
              <span className="text-muted-foreground font-normal text-sm">
                {' '}
                (optional)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amazon">Amazon Store</Label>
            <Input
              id="amazon"
              placeholder="https://amazon.co.uk/your-store"
              value={storefrontLinks.amazon || ''}
              onChange={handleStorefrontLinkChange}
            />
            {errors['productData.storefrontLinks.amazon'] && (
              <p className="text-sm text-red-500">
                {errors['productData.storefrontLinks.amazon']}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="ebay">eBay Store</Label>
            <Input
              id="ebay"
              placeholder="https://ebay.co.uk/usr/your-store"
              value={storefrontLinks.ebay || ''}
              onChange={handleStorefrontLinkChange}
            />
            {errors['productData.storefrontLinks.ebay'] && (
              <p className="text-sm text-red-500">
                {errors['productData.storefrontLinks.ebay']}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="etsy">Etsy Shop</Label>
            <Input
              id="etsy"
              placeholder="https://etsy.com/shop/your-shop"
              value={storefrontLinks.etsy || ''}
              onChange={handleStorefrontLinkChange}
            />
            {errors['productData.storefrontLinks.etsy'] && (
              <p className="text-sm text-red-500">
                {errors['productData.storefrontLinks.etsy']}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellingModesStep;
