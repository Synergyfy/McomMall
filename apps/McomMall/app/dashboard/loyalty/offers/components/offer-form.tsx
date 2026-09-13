'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Tag,
  HelpCircle,
  ArrowRight,
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, startOfDay } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useGetMyProducts } from '@/service/store/products/hook';
import { Product } from '@/service/store/products/types';
import { CreateOfferDto, UpdateOfferDto } from '@/service/offers/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetUserListings } from '@/service/listings/hook';
import { InHouseBusiness, UserListing } from '@/service/listings/types';

interface FormData {
  name: string;
  description: string;
  points: string;
  beginDate?: Date;
  endDate?: Date;
  rewardCouponType:
    | 'FIXED_CART_DISCOUNT'
    | 'PERCENTAGE_DISCOUNT'
    | 'FREE_PRODUCTS'
    | 'BONUS_POINTS'
    | '';
  discountAmount: string;
  discountPercentage: string;
  freeProductId: string;
  bonusPoints: string;
  limitUsageToXProducts: string;
  expireAfterXDays: string;
  allowFreeShipping: boolean;
  individualUseOnly: boolean;
  excludeSaleItems: boolean;
  limitPerCustomer: string;
  allowLimitToReset: boolean;
  includedProductIds: string[];
  excludedProductIds: string[];
  offerScope: 'ALL_LISTINGS' | 'SPECIFIC_LISTINGS' | 'SPECIFIC_PRODUCTS';
  businessIds: string[];
}

interface FormErrors {
  name?: string;
  points?: string;
  rewardCouponType?: string;
  discountAmount?: string;
  discountPercentage?: string;
  freeProductId?: string;
  bonusPoints?: string;
  businessIds?: string;
  includedProductIds?: string;
}

interface OfferFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: CreateOfferDto | UpdateOfferDto) => Promise<void>;
  isPending: boolean;
  submitButtonText: string;
}

export default function OfferForm({
  initialData,
  onSubmit,
  isPending,
  submitButtonText,
}: OfferFormProps) {
  const todayStart = startOfDay(new Date());
  const { data: products, isLoading: isLoadingProducts } = useGetMyProducts();
  const { data: listings, isLoading: isLoadingListings } = useGetUserListings();
  const [openIncludedProducts, setOpenIncludedProducts] =
    React.useState(false);
  const [openExcludedProducts, setOpenExcludedProducts] =
    React.useState(false);
  const [openBusinessIds, setOpenBusinessIds] = React.useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    points: '',
    beginDate: undefined,
    endDate: undefined,
    rewardCouponType: '',
    discountAmount: '',
    discountPercentage: '',
    freeProductId: '',
    bonusPoints: '',
    limitUsageToXProducts: '',
    expireAfterXDays: '',
    allowFreeShipping: false,
    individualUseOnly: false,
    excludeSaleItems: false,
    limitPerCustomer: '',
    allowLimitToReset: false,
    includedProductIds: [],
    excludedProductIds: [],
    offerScope: 'ALL_LISTINGS',
    businessIds: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const includedProductsOptions = useMemo(() => {
    if (!products) return [];
    return products.filter(p => !formData.excludedProductIds.includes(p.id));
  }, [products, formData.excludedProductIds]);

  const excludedProductsOptions = useMemo(() => {
    if (!products) return [];
    return products.filter(p => !formData.includedProductIds.includes(p.id));
  }, [products, formData.includedProductIds]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = <T extends keyof FormData>(name: T, value: FormData[T]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof FormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Offer name is required.';
    }
    if (!formData.points || parseInt(formData.points, 10) <= 0) {
      newErrors.points = 'Points must be a positive integer.';
    }
    if (!formData.rewardCouponType) {
      newErrors.rewardCouponType = 'Reward coupon type is required.';
    }
    if (
      formData.rewardCouponType === 'FIXED_CART_DISCOUNT' &&
      (!formData.discountAmount ||
        parseFloat(formData.discountAmount) <= 0)
    ) {
      newErrors.discountAmount =
        'Discount amount must be a positive number.';
    }
    if (
      formData.rewardCouponType === 'PERCENTAGE_DISCOUNT' &&
      (!formData.discountPercentage ||
        parseFloat(formData.discountPercentage) <= 0)
    ) {
      newErrors.discountPercentage =
        'Discount percentage must be a positive number.';
    }
    if (
      formData.rewardCouponType === 'FREE_PRODUCTS' &&
      !formData.freeProductId
    ) {
      newErrors.freeProductId = 'Free product is required.';
    }
    if (
      formData.rewardCouponType === 'BONUS_POINTS' &&
      (!formData.bonusPoints || parseInt(formData.bonusPoints, 10) <= 0)
    ) {
      newErrors.bonusPoints = 'Bonus points must be a positive integer.';
    }
    if (
      formData.offerScope === 'SPECIFIC_LISTINGS' &&
      formData.businessIds.length === 0
    ) {
      newErrors.businessIds = 'At least one business must be selected.';
    }
    if (
      formData.offerScope === 'SPECIFIC_PRODUCTS' &&
      formData.includedProductIds.length === 0
    ) {
      newErrors.includedProductIds =
        'At least one product must be selected.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const dataToSubmit = {
        name: formData.name,
        description: formData.description,
        points: parseInt(formData.points, 10),
        beginDate: formData.beginDate,
        endDate: formData.endDate,
        rewardCouponType: formData.rewardCouponType as
          | 'FIXED_CART_DISCOUNT'
          | 'PERCENTAGE_DISCOUNT'
          | 'FREE_PRODUCTS'
          | 'BONUS_POINTS',
        discountAmount: formData.discountAmount
          ? parseFloat(formData.discountAmount)
          : undefined,
        discountPercentage: formData.discountPercentage
          ? parseFloat(formData.discountPercentage)
          : undefined,
        freeProductId: formData.freeProductId || undefined,
        bonusPoints: formData.bonusPoints
          ? parseInt(formData.bonusPoints, 10)
          : undefined,
        limitUsageToXProducts: formData.limitUsageToXProducts
          ? parseInt(formData.limitUsageToXProducts, 10)
          : undefined,
        expireAfterXDays: formData.expireAfterXDays
          ? parseInt(formData.expireAfterXDays, 10)
          : undefined,
        allowFreeShipping: formData.allowFreeShipping,
        individualUseOnly: formData.individualUseOnly,
        excludeSaleItems: formData.excludeSaleItems,
        limitPerCustomer: formData.limitPerCustomer
          ? parseInt(formData.limitPerCustomer, 10)
          : undefined,
        allowLimitToReset: formData.allowLimitToReset,
        includedProductIds: formData.includedProductIds,
        excludedProductIds: formData.excludedProductIds,
        offerScope: formData.offerScope,
        businessIds: formData.businessIds,
      };
      await onSubmit(dataToSubmit);
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  const handleMultiSelectChange = (
    field: 'includedProductIds' | 'excludedProductIds' | 'businessIds',
    id: string
  ) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(id)
        ? currentValues.filter(v => v !== id)
        : [...currentValues, id];
      return { ...prev, [field]: newValues };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-gray-500" />
            Offer Details
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="offerScope">Offer Scope</Label>
            <RadioGroup
              value={formData.offerScope}
              onValueChange={
                (value: 'ALL_LISTINGS' | 'SPECIFIC_LISTINGS' | 'SPECIFIC_PRODUCTS') =>
                  handleSelectChange('offerScope', value)
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ALL_LISTINGS" id="all-listings" />
                <Label htmlFor="all-listings">All Listings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="SPECIFIC_LISTINGS"
                  id="specific-listings"
                />
                <Label htmlFor="specific-listings">Specific Listings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="SPECIFIC_PRODUCTS"
                  id="specific-products"
                />
                <Label htmlFor="specific-products">Specific Products</Label>
              </div>
            </RadioGroup>
          </div>
          {formData.offerScope === 'SPECIFIC_LISTINGS' && (
            <div className="grid gap-2">
              <Label htmlFor="businessIds">Businesses</Label>
              <Popover
                open={openBusinessIds}
                onOpenChange={setOpenBusinessIds}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBusinessIds}
                    className="w-full justify-between"
                  >
                    {formData.businessIds.length > 0
                      ? `${formData.businessIds.length} business(es) selected`
                      : 'Select businesses...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search businesses..." />
                    <CommandEmpty>No businesses found.</CommandEmpty>
                    <CommandGroup>
                      {isLoadingListings ? (
                        <CommandItem>Loading...</CommandItem>
                      ) : (
                        listings?.data?.map((listing: UserListing) => (
                          <CommandItem
                            key={listing.id}
                            onSelect={() =>
                              handleMultiSelectChange(
                                'businessIds',
                                listing.id
                              )
                            }
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.businessIds.includes(listing.id)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {listing.businessName}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.businessIds && (
                <p className="text-base text-red-600 mt-1">
                  {errors.businessIds}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Offer Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && (
              <p className="text-base text-red-600 mt-1">{errors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              name="points"
              type="number"
              value={formData.points}
              onChange={handleInputChange}
            />
            {errors.points && (
              <p className="text-base text-red-600 mt-1">{errors.points}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <Tag className="h-6 w-6 mr-3 text-gray-500" />
            Offer Rules
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="rewardCouponType">Reward Coupon Type</Label>
              <Select
                name="rewardCouponType"
                value={formData.rewardCouponType}
                onValueChange={value =>
                  handleSelectChange('rewardCouponType', value as typeof formData.rewardCouponType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED_CART_DISCOUNT">
                    Fixed Cart Discount
                  </SelectItem>
                  <SelectItem value="PERCENTAGE_DISCOUNT">
                    Percentage Discount
                  </SelectItem>
                  <SelectItem value="FREE_PRODUCTS">Free Products</SelectItem>
                  <SelectItem value="BONUS_POINTS">Bonus Points</SelectItem>
                </SelectContent>
              </Select>
              {errors.rewardCouponType && (
                <p className="text-base text-red-600 mt-1">
                  {errors.rewardCouponType}
                </p>
              )}
            </div>
          </div>

          {formData.rewardCouponType === 'FIXED_CART_DISCOUNT' && (
            <div className="grid gap-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <Input
                id="discountAmount"
                name="discountAmount"
                type="number"
                value={formData.discountAmount}
                onChange={handleInputChange}
              />
              {errors.discountAmount && (
                <p className="text-base text-red-600 mt-1">
                  {errors.discountAmount}
                </p>
              )}
            </div>
          )}

          {formData.rewardCouponType === 'PERCENTAGE_DISCOUNT' && (
            <div className="grid gap-2">
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                value={formData.discountPercentage}
                onChange={handleInputChange}
              />
              {errors.discountPercentage && (
                <p className="text-base text-red-600 mt-1">
                  {errors.discountPercentage}
                </p>
              )}
            </div>
          )}

          {formData.rewardCouponType === 'FREE_PRODUCTS' && (
            <div className="grid gap-2">
              <Label htmlFor="freeProductId">Free Product</Label>
              <Select
                name="freeProductId"
                value={formData.freeProductId}
                onValueChange={value =>
                  handleSelectChange('freeProductId', value as string)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProducts ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    products?.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.freeProductId && (
                <p className="text-base text-red-600 mt-1">
                  {errors.freeProductId}
                </p>
              )}
            </div>
          )}

          {formData.rewardCouponType === 'BONUS_POINTS' && (
            <div className="grid gap-2">
              <Label htmlFor="bonusPoints">Bonus Points</Label>
              <Input
                id="bonusPoints"
                name="bonusPoints"
                type="number"
                value={formData.bonusPoints}
                onChange={handleInputChange}
              />
              {errors.bonusPoints && (
                <p className="text-base text-red-600 mt-1">
                  {errors.bonusPoints}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="limitUsageToXProducts">
                Limit Usage to X Products
              </Label>
              <Input
                id="limitUsageToXProducts"
                name="limitUsageToXProducts"
                type="number"
                placeholder="No limit"
                value={formData.limitUsageToXProducts}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expireAfterXDays">Expire After X Days</Label>
              <Input
                id="expireAfterXDays"
                name="expireAfterXDays"
                type="number"
                placeholder="Never expires"
                value={formData.expireAfterXDays}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            <HelpCircle className="h-6 w-6 mr-3 text-gray-500" />
            Restrictions
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="allowFreeShipping"
                checked={formData.allowFreeShipping}
                onCheckedChange={checked =>
                  handleSwitchChange('allowFreeShipping', checked)
                }
              />
              <Label htmlFor="allowFreeShipping">Allow Free Shipping</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="individualUseOnly"
                checked={formData.individualUseOnly}
                onCheckedChange={checked =>
                  handleSwitchChange('individualUseOnly', checked)
                }
              />
              <Label htmlFor="individualUseOnly">Individual Use Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="excludeSaleItems"
                checked={formData.excludeSaleItems}
                onCheckedChange={checked =>
                  handleSwitchChange('excludeSaleItems', checked)
                }
              />
              <Label htmlFor="excludeSaleItems">Exclude Sale Items</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="allowLimitToReset"
                checked={formData.allowLimitToReset}
                onCheckedChange={checked =>
                  handleSwitchChange('allowLimitToReset', checked)
                }
              />
              <Label htmlFor="allowLimitToReset">Allow Limit to Reset</Label>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limitPerCustomer">Limit Per Customer</Label>
            <Input
              id="limitPerCustomer"
              name="limitPerCustomer"
              type="number"
              placeholder="No limit"
              value={formData.limitPerCustomer}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="includedProductIds">Included Products</Label>
            <Popover
              open={openIncludedProducts}
              onOpenChange={setOpenIncludedProducts}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openIncludedProducts}
                  className="w-full justify-between"
                >
                  {formData.includedProductIds.length > 0
                    ? `${formData.includedProductIds.length} product(s) selected`
                    : 'Select products...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {isLoadingProducts ? (
                      <CommandItem>Loading...</CommandItem>
                    ) : (
                      includedProductsOptions?.map((product: Product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() =>
                            handleMultiSelectChange(
                              'includedProductIds',
                              product.id
                            )
                          }
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.includedProductIds.includes(product.id)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {product.title}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.includedProductIds && (
              <p className="text-base text-red-600 mt-1">
                {errors.includedProductIds}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="excludedProductIds">Excluded Products</Label>
            <Popover
              open={openExcludedProducts}
              onOpenChange={setOpenExcludedProducts}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openExcludedProducts}
                  className="w-full justify-between"
                >
                  {formData.excludedProductIds.length > 0
                    ? `${formData.excludedProductIds.length} product(s) selected`
                    : 'Select products...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {isLoadingProducts ? (
                      <CommandItem>Loading...</CommandItem>
                    ) : (
                      excludedProductsOptions?.map((product: Product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() =>
                            handleMultiSelectChange(
                              'excludedProductIds',
                              product.id
                            )
                          }
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.excludedProductIds.includes(product.id)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {product.title}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="beginDate">Begin Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.beginDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.beginDate ? (
                      format(formData.beginDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.beginDate}
                    onSelect={(date) => handleSelectChange('beginDate', date)}
                    disabled={(date) => isBefore(date, todayStart)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleSelectChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3 w-full sm:w-auto text-lg"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : submitButtonText}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </form>
  );
}
