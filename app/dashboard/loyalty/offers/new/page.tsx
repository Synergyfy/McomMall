'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  FileText,
  Tag,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAddOffer } from '@/service/offers/hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
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
import { businessCategories } from '@/lib/business-categories';

interface FormData {
  name: string;
  description: string;
  points: string;
  beginDate: string;
  endDate: string;
  rewardCouponType:
    | 'FIXED_CART_DISCOUNT'
    | 'PERCENTAGE_DISCOUNT'
    | 'FREE_PRODUCTS'
    | 'BONUS_POINTS'
    | '';
  limitUsageToXProducts: string;
  expireAfterXDays: string;
  allowFreeShipping: boolean;
  individualUseOnly: boolean;
  excludeSaleItems: boolean;
  limitPerCustomer: string;
  allowLimitToReset: boolean;
  categoryId: string;
  includedProductIds: string[];
  excludedProductIds: string[];
  excludedCategoryIds: string[];
}

interface FormErrors {
  name?: string;
  points?: string;
  rewardCouponType?: string;
  categoryId?: string;
}

export default function OfferForm() {
  const router = useRouter();
  const createOffer = useAddOffer();
  const { data: products, isLoading: isLoadingProducts } = useGetMyProducts();
  const categories = businessCategories.flatMap(main =>
    main.subCategories.map(sub => ({ id: sub.name, name: sub.name }))
  );
  const isLoadingCategories = false;
  const [isSuccess, setIsSuccess] = useState(false);
  const [openIncludedProducts, setOpenIncludedProducts] =
    React.useState(false);
  const [openExcludedProducts, setOpenExcludedProducts] =
    React.useState(false);
  const [openExcludedCategories, setOpenExcludedCategories] =
    React.useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    points: '',
    beginDate: '',
    endDate: '',
    rewardCouponType: '',
    limitUsageToXProducts: '',
    expireAfterXDays: '',
    allowFreeShipping: false,
    individualUseOnly: false,
    excludeSaleItems: false,
    limitPerCustomer: '',
    allowLimitToReset: false,
    categoryId: '',
    includedProductIds: [],
    excludedProductIds: [],
    excludedCategoryIds: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
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
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await createOffer.mutateAsync({
          name: formData.name,
          description: formData.description,
          points: parseInt(formData.points, 10),
          beginDate: formData.beginDate || undefined,
          endDate: formData.endDate || undefined,
          rewardCouponType: formData.rewardCouponType as
            | 'FIXED_CART_DISCOUNT'
            | 'PERCENTAGE_DISCOUNT'
            | 'FREE_PRODUCTS'
            | 'BONUS_POINTS',
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
          categoryId: formData.categoryId,
          includedProductIds: formData.includedProductIds,
          excludedProductIds: formData.excludedProductIds,
          excludedCategoryIds: formData.excludedCategoryIds,
        });
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to create offer:', error);
      }
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  const handleMultiSelectChange = (
    field: 'includedProductIds' | 'excludedProductIds' | 'excludedCategoryIds',
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
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 sm:mb-0">
              Create Offer
            </h1>
            <div className="text-base text-gray-500 flex items-center space-x-1">
              <span>Home</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700">Offers</span>
            </div>
          </div>
        </header>

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
                <Label htmlFor="name">Offer Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <p className="text-base text-red-600 mt-1">
                    {errors.name}
                  </p>
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
                  <p className="text-base text-red-600 mt-1">
                    {errors.points}
                  </p>
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
                      handleSelectChange('rewardCouponType', value)
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
                      <SelectItem value="FREE_PRODUCTS">
                        Free Products
                      </SelectItem>
                      <SelectItem value="BONUS_POINTS">
                        Bonus Points
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rewardCouponType && (
                    <p className="text-base text-red-600 mt-1">
                      {errors.rewardCouponType}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onValueChange={value =>
                      handleSelectChange('categoryId', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        categories?.map(
                          (category: { id: string; name: string }) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-base text-red-600 mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

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
                  <Label htmlFor="expireAfterXDays">
                    Expire After X Days
                  </Label>
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
                  <Label htmlFor="individualUseOnly">
                    Individual Use Only
                  </Label>
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
                  <Label htmlFor="allowLimitToReset">
                    Allow Limit to Reset
                  </Label>
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
                          products?.map((product: Product) => (
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
                                  formData.includedProductIds.includes(
                                    product.id
                                  )
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
                          products?.map((product: Product) => (
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
                                  formData.excludedProductIds.includes(
                                    product.id
                                  )
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
              <div className="grid gap-2">
                <Label htmlFor="excludedCategoryIds">
                  Excluded Categories
                </Label>
                <Popover
                  open={openExcludedCategories}
                  onOpenChange={setOpenExcludedCategories}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openExcludedCategories}
                      className="w-full justify-between"
                    >
                      {formData.excludedCategoryIds.length > 0
                        ? `${formData.excludedCategoryIds.length} category(s) selected`
                        : 'Select categories...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {isLoadingCategories ? (
                          <CommandItem>Loading...</CommandItem>
                        ) : (
                          categories?.map(
                            (category: { id: string; name: string }) => (
                              <CommandItem
                                key={category.id}
                                onSelect={() =>
                                  handleMultiSelectChange(
                                    'excludedCategoryIds',
                                    category.id
                                  )
                                }
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.excludedCategoryIds.includes(
                                      category.id
                                    )
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            )
                          )
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
                          format(new Date(formData.beginDate), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.beginDate
                            ? new Date(formData.beginDate)
                            : undefined
                        }
                        onSelect={date =>
                          handleSelectChange(
                            'beginDate',
                            date?.toISOString() || ''
                          )
                        }
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
                          format(new Date(formData.endDate), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.endDate
                            ? new Date(formData.endDate)
                            : undefined
                        }
                        onSelect={date =>
                          handleSelectChange(
                            'endDate',
                            date?.toISOString() || ''
                          )
                        }
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
              disabled={createOffer.isPending}
            >
              {createOffer.isPending ? 'Creating...' : 'Create Offer'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent>
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle className="h-6 w-6 text-green-600" />
            </motion.div>
            <DialogTitle className="text-center">Offer Created!</DialogTitle>
            <DialogDescription className="text-center">
              Your new offer has been created successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => router.push('/dashboard/loyalty/offers')}>
              Go to Offers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
