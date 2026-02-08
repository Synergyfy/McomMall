import React from 'react';
import { ListingFormData } from '../../../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
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
  const storefrontLinks = productData.storefrontLinks || [];
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
    index: number,
    field: 'name' | 'url',
    value: string
  ) => {
    setFormData(prev => {
      const newStorefrontLinks = [...(prev.productData?.storefrontLinks || [])];
      newStorefrontLinks[index] = {
        ...newStorefrontLinks[index],
        [field]: value,
      };
      return {
        ...prev,
        productData: {
          ...prev.productData,
          storefrontLinks: newStorefrontLinks,
        },
      };
    });
  };

  const addStorefrontLink = () => {
    setFormData(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        storefrontLinks: [
          ...(prev.productData?.storefrontLinks || []),
          { name: '', url: '' },
        ],
      },
    }));
  };

  const removeStorefrontLink = (index: number) => {
    setFormData(prev => {
      const newStorefrontLinks = [...(prev.productData?.storefrontLinks || [])];
      newStorefrontLinks.splice(index, 1);
      return {
        ...prev,
        productData: {
          ...prev.productData,
          storefrontLinks: newStorefrontLinks,
        },
      };
    });
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
          {storefrontLinks.map((link, index) => (
            <div key={index} className="flex items-end space-x-2">
              <div className="flex-grow space-y-2">
                <div>
                  <Label htmlFor={`storeName-${index}`}>Store Name</Label>
                  <Input
                    id={`storeName-${index}`}
                    placeholder="e.g., My Awesome Shop"
                    value={link.name}
                    onChange={e =>
                      handleStorefrontLinkChange(index, 'name', e.target.value)
                    }
                  />
                  {errors[`productData.storefrontLinks[${index}].name`] && (
                    <p className="text-sm text-red-500">
                      {errors[`productData.storefrontLinks[${index}].name`]}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`storeUrl-${index}`}>Store URL</Label>
                  <Input
                    id={`storeUrl-${index}`}
                    placeholder="https://example.com/store"
                    value={link.url}
                    onChange={e =>
                      handleStorefrontLinkChange(index, 'url', e.target.value)
                    }
                  />
                  {errors[`productData.storefrontLinks[${index}].url`] && (
                    <p className="text-sm text-red-500">
                      {errors[`productData.storefrontLinks[${index}].url`]}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStorefrontLink(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addStorefrontLink}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Storefront
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellingModesStep;
