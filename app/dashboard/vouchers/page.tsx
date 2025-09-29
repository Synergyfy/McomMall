'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';

interface Variation {
  id: number;
  color: string;
  size: string;
  sku: string;
  enabled: boolean;
  downloadable: boolean;
  virtual: boolean;
  manageStock: boolean;
  regularPrice: string;
  salePrice: string;
  stockQuantity: string;
  allowBackorders: 'no' | 'yes' | 'notify';
  stockStatus: 'in' | 'out';
  pdfTemplate: string;
  voucherDelivery: string;
  voucherCodes: string;
  vendorAddress: string;
}

interface FormErrors {
  regularPrice?: string;
  stockQuantity?: string;
}

export default function ProductDataForm() {
  const [productType, setProductType] = useState('variable');
  const [variations, setVariations] = useState<Variation[]>([
    {
      id: 304,
      color: 'Green',
      size: 'Large',
      sku: '#WPV-VPDV-WL',
      enabled: true,
      downloadable: false,
      virtual: false,
      manageStock: true,
      regularPrice: '60',
      salePrice: '55',
      stockQuantity: '245',
      allowBackorders: 'no',
      stockStatus: 'in',
      pdfTemplate: '',
      voucherDelivery: '',
      voucherCodes: 'WPV-SP-af171,WPV-SP-jh667,WPV-SP-he478...',
      vendorAddress: '',
    },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeAccordionItem, setActiveAccordionItem] =
    useState<string>('item-304');

  const handleVariationChange = (
    id: number,
    field: keyof Variation,
    value: string | boolean | number
  ) => {
    setVariations(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!activeAccordionItem) return true;

    const currentVariationId = parseInt(activeAccordionItem.split('-')[1]);
    const currentVariation = variations.find(v => v.id === currentVariationId);

    if (currentVariation) {
      if (!currentVariation.regularPrice.trim()) {
        newErrors.regularPrice = 'Regular price is required.';
      }
      if (
        currentVariation.manageStock &&
        !currentVariation.stockQuantity.trim()
      ) {
        newErrors.stockQuantity =
          'Stock quantity is required when managing stock.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted successfully!', variations);
    } else {
      console.log('Form has validation errors.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4 mb-6">
              <Label
                htmlFor="product-type"
                className="font-medium text-gray-700"
              >
                Product data
              </Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger id="product-type" className="w-[200px]">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple product</SelectItem>
                  <SelectItem value="variable">Variable product</SelectItem>
                  <SelectItem value="grouped">Grouped product</SelectItem>
                  <SelectItem value="external">
                    External/Affiliate product
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={activeAccordionItem}
              onValueChange={setActiveAccordionItem}
            >
              {variations.map(variation => (
                <AccordionItem
                  value={`item-${variation.id}`}
                  key={variation.id}
                  className="border-b-0 mb-2 border rounded-lg"
                >
                  <AccordionTrigger className="hover:no-underline bg-gray-50 hover:bg-gray-100 px-4 rounded-t-lg">
                    <h3 className="font-semibold text-gray-800">
                      #{variation.id} {variation.color} - {variation.size}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-b-lg">
                    <div className="md:col-span-1 flex justify-center items-start">
                      <Image
                        src="https://placehold.co/100x100/e2e8f0/334155?text=T-Shirt"
                        alt="Product image"
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                        onError={e => {
                          e.currentTarget.src =
                            'https://placehold.co/100x100/e2e8f0/334155?text=Img';
                        }}
                      />
                    </div>
                    <div className="md:col-span-11 space-y-6">
                      <p className="text-sm text-gray-600 font-mono">
                        SKU: {variation.sku}
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`enabled-${variation.id}`}
                            checked={variation.enabled}
                            onCheckedChange={checked =>
                              handleVariationChange(
                                variation.id,
                                'enabled',
                                !!checked
                              )
                            }
                          />
                          <Label htmlFor={`enabled-${variation.id}`}>
                            Enabled
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`downloadable-${variation.id}`}
                            checked={variation.downloadable}
                            onCheckedChange={checked =>
                              handleVariationChange(
                                variation.id,
                                'downloadable',
                                !!checked
                              )
                            }
                          />
                          <Label htmlFor={`downloadable-${variation.id}`}>
                            Downloadable
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`virtual-${variation.id}`}
                            checked={variation.virtual}
                            onCheckedChange={checked =>
                              handleVariationChange(
                                variation.id,
                                'virtual',
                                !!checked
                              )
                            }
                          />
                          <Label htmlFor={`virtual-${variation.id}`}>
                            Virtual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`manageStock-${variation.id}`}
                            checked={variation.manageStock}
                            onCheckedChange={checked =>
                              handleVariationChange(
                                variation.id,
                                'manageStock',
                                !!checked
                              )
                            }
                          />
                          <Label htmlFor={`manageStock-${variation.id}`}>
                            Manage stock?
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor={`regularPrice-${variation.id}`}>
                            Regular price ($)
                          </Label>
                          <Input
                            type="number"
                            id={`regularPrice-${variation.id}`}
                            value={variation.regularPrice}
                            onChange={e =>
                              handleVariationChange(
                                variation.id,
                                'regularPrice',
                                e.target.value
                              )
                            }
                          />
                          {errors.regularPrice && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.regularPrice}
                            </p>
                          )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor={`salePrice-${variation.id}`}>
                            Sale price ($)
                          </Label>
                          <Input
                            type="number"
                            id={`salePrice-${variation.id}`}
                            value={variation.salePrice}
                            onChange={e =>
                              handleVariationChange(
                                variation.id,
                                'salePrice',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {variation.manageStock && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor={`stockQuantity-${variation.id}`}>
                              Stock quantity
                            </Label>
                            <Input
                              type="number"
                              id={`stockQuantity-${variation.id}`}
                              value={variation.stockQuantity}
                              onChange={e =>
                                handleVariationChange(
                                  variation.id,
                                  'stockQuantity',
                                  e.target.value
                                )
                              }
                            />
                            {errors.stockQuantity && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.stockQuantity}
                              </p>
                            )}
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>Allow backorders?</Label>
                            <Select
                              value={variation.allowBackorders}
                              onValueChange={value =>
                                handleVariationChange(
                                  variation.id,
                                  'allowBackorders',
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">Do not allow</SelectItem>
                                <SelectItem value="notify">
                                  Allow, but notify
                                </SelectItem>
                                <SelectItem value="yes">Allow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>Stock status</Label>
                            <Select
                              value={variation.stockStatus}
                              onValueChange={value =>
                                handleVariationChange(
                                  variation.id,
                                  'stockStatus',
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in">In stock</SelectItem>
                                <SelectItem value="out">
                                  Out of stock
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-orange-200 pt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>PDF Template</Label>
                            <Select
                              value={variation.pdfTemplate}
                              onValueChange={value =>
                                handleVariationChange(
                                  variation.id,
                                  'pdfTemplate',
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Please Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="template1">
                                  Template 1
                                </SelectItem>
                                <SelectItem value="template2">
                                  Template 2
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>Voucher Delivery</Label>
                            <Select
                              value={variation.voucherDelivery}
                              onValueChange={value =>
                                handleVariationChange(
                                  variation.id,
                                  'voucherDelivery',
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Default" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="download">
                                  Download
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor={`voucherCodes-${variation.id}`}>
                            Voucher Codes
                          </Label>
                          <Textarea
                            id={`voucherCodes-${variation.id}`}
                            value={variation.voucherCodes}
                            onChange={e =>
                              handleVariationChange(
                                variation.id,
                                'voucherCodes',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor={`vendorAddress-${variation.id}`}>
                            Vendor Address
                          </Label>
                          <Textarea
                            id={`vendorAddress-${variation.id}`}
                            value={variation.vendorAddress}
                            onChange={e =>
                              handleVariationChange(
                                variation.id,
                                'vendorAddress',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
              Save changes
            </Button>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
