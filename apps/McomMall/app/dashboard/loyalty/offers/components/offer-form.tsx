'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Tag,
  ShieldCheck,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useGetMyProducts } from '@/service/store/products/hook';
import { Product } from '@/service/store/products/types';
import { CreateOfferDto, UpdateOfferDto } from '@/service/offers/types';

export interface OfferFormValues {
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
}

interface FormErrors {
  name?: string;
  points?: string;
  rewardCouponType?: string;
  discountAmount?: string;
  discountPercentage?: string;
  freeProductId?: string;
  bonusPoints?: string;
}

interface OfferFormProps {
  initialData?: Partial<OfferFormValues>;
  onSubmit: (data: CreateOfferDto | UpdateOfferDto) => Promise<void>;
  isPending: boolean;
  submitButtonText: string;
  /** Optional live-state callback, useful for previews. */
  onChange?: (data: OfferFormValues) => void;
}

const inputClassName =
  'h-11 rounded-xl border-[#e7d9d1] bg-white text-sm text-gray-900 shadow-none placeholder:text-gray-400 focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-100';

/* -------------------------------------------------------------------------- */
/*                              Small UI helpers                              */
/* -------------------------------------------------------------------------- */

function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-gray-700"
      >
        {children}
        {required && <span className="ml-0.5 text-orange-600">*</span>}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Help: ${typeof children === 'string' ? children : 'field'}`}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-64 px-3 py-2 text-xs leading-relaxed font-medium"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#a14000] ring-1 ring-orange-100">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function SwitchField({
  id,
  label,
  description,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[#ece4de] bg-[#fdfbfa] p-4 transition-colors hover:border-orange-200">
      <div className="min-w-0">
        <FieldLabel htmlFor={id} hint={hint}>
          {label}
        </FieldLabel>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1 shrink-0"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Form                                     */
/* -------------------------------------------------------------------------- */

export default function OfferForm({
  initialData,
  onSubmit,
  isPending,
  submitButtonText,
  onChange,
}: OfferFormProps) {
  const todayStart = startOfDay(new Date());
  const { data: products, isLoading: isLoadingProducts } = useGetMyProducts();
  const [openIncludedProducts, setOpenIncludedProducts] =
    React.useState(false);
  const [openExcludedProducts, setOpenExcludedProducts] =
    React.useState(false);

  const [formData, setFormData] = useState<OfferFormValues>({
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
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Keep the latest callback without re-triggering the effect on every render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    onChangeRef.current?.(formData);
  }, [formData]);

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

  const handleSelectChange = <T extends keyof OfferFormValues>(name: T, value: OfferFormValues[T]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof OfferFormValues, checked: boolean) => {
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
        discountAmount:
          formData.rewardCouponType === 'FIXED_CART_DISCOUNT' &&
          formData.discountAmount
            ? parseFloat(formData.discountAmount)
            : undefined,
        discountPercentage:
          formData.rewardCouponType === 'PERCENTAGE_DISCOUNT' &&
          formData.discountPercentage
            ? parseFloat(formData.discountPercentage)
            : undefined,
        freeProductId:
          formData.rewardCouponType === 'FREE_PRODUCTS'
            ? formData.freeProductId || undefined
            : undefined,
        bonusPoints:
          formData.rewardCouponType === 'BONUS_POINTS' && formData.bonusPoints
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
      };
      await onSubmit(dataToSubmit);
    } else {
      console.log('Form has validation errors:', validationErrors);
    }
  };

  const handleMultiSelectChange = (
    field: 'includedProductIds' | 'excludedProductIds',
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
    <TooltipProvider delayDuration={150}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ---------------------------------------------------------------- */}
        {/* Offer details                                                    */}
        {/* ---------------------------------------------------------------- */}
        <Card className="gap-0 overflow-hidden rounded-2xl border-[#efe3dc] bg-white py-0 shadow-[0_2px_10px_rgba(31,27,24,0.04)]">
          <CardHeader className="border-b border-[#f6ece6] px-5 py-5 sm:px-6">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Offer Details"
              description="The basics customers will see on this reward."
            />
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-6 sm:px-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2.5">
                <FieldLabel htmlFor="name" required hint="Customer-facing title shown on the reward card, e.g. “20% Off Summer Collection”.">
                  Offer Name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., 20% Off Summer Collection"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
                <FieldError message={errors.name} />
              </div>

              <div className="grid gap-2.5">
                <FieldLabel htmlFor="points" required hint="How many loyalty points a customer must spend to redeem this reward.">
                  Points Required
                </FieldLabel>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min={1}
                  placeholder="e.g., 500"
                  value={formData.points}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
                <FieldError message={errors.points} />
              </div>
            </div>

            <div className="grid gap-2.5">
              <FieldLabel htmlFor="description" hint="A short, appealing explanation of what customers get and why it is worth redeeming.">
                Description
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Tell your customers what they get and why it’s special…"
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[96px] resize-none rounded-xl border-[#e7d9d1] bg-white text-sm text-gray-900 shadow-none placeholder:text-gray-400 focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Reward configuration                                             */}
        {/* ---------------------------------------------------------------- */}
        <Card className="gap-0 overflow-hidden rounded-2xl border-[#efe3dc] bg-white py-0 shadow-[0_2px_10px_rgba(31,27,24,0.04)]">
          <CardHeader className="border-b border-[#f6ece6] px-5 py-5 sm:px-6">
            <SectionHeader
              icon={<Tag className="h-5 w-5" />}
              title="Reward Configuration"
              description="Define what the customer receives when they redeem."
            />
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-6 sm:px-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2.5">
                <FieldLabel htmlFor="rewardCouponType" required hint="What the customer receives after redeeming: a fixed cart discount, a percentage discount, free products or bonus points.">
                  Reward Coupon Type
                </FieldLabel>
                <Select
                  name="rewardCouponType"
                  value={formData.rewardCouponType}
                  onValueChange={value =>
                    handleSelectChange('rewardCouponType', value as OfferFormValues['rewardCouponType'])
                  }
                >
                  <SelectTrigger id="rewardCouponType" className="h-11 w-full rounded-xl border-[#e7d9d1] bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-orange-100">
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
                <FieldError message={errors.rewardCouponType} />
              </div>

              {formData.rewardCouponType === 'FIXED_CART_DISCOUNT' && (
                <div className="grid gap-2.5">
                  <FieldLabel htmlFor="discountAmount" required hint="The amount taken off the cart total, in your store currency.">
                    Discount Amount
                  </FieldLabel>
                  <Input
                    id="discountAmount"
                    name="discountAmount"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g., 10.00"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    className={inputClassName}
                  />
                  <FieldError message={errors.discountAmount} />
                </div>
              )}

              {formData.rewardCouponType === 'PERCENTAGE_DISCOUNT' && (
                <div className="grid gap-2.5">
                  <FieldLabel htmlFor="discountPercentage" required hint="The percentage taken off eligible items. Enter a value between 1 and 100.">
                    Discount Percentage (%)
                  </FieldLabel>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g., 20"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    className={inputClassName}
                  />
                  <FieldError message={errors.discountPercentage} />
                </div>
              )}

              {formData.rewardCouponType === 'FREE_PRODUCTS' && (
                <div className="grid gap-2.5">
                  <FieldLabel htmlFor="freeProductId" required hint="The product a customer receives for free when they redeem this reward.">
                    Free Product
                  </FieldLabel>
                  <Select
                    name="freeProductId"
                    value={formData.freeProductId}
                    onValueChange={value =>
                      handleSelectChange('freeProductId', value as string)
                    }
                  >
                    <SelectTrigger id="freeProductId" className="h-11 w-full rounded-xl border-[#e7d9d1] bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-orange-100">
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
                  <FieldError message={errors.freeProductId} />
                </div>
              )}

              {formData.rewardCouponType === 'BONUS_POINTS' && (
                <div className="grid gap-2.5">
                  <FieldLabel htmlFor="bonusPoints" required hint="How many bonus points a customer receives when they redeem this reward.">
                    Bonus Points
                  </FieldLabel>
                  <Input
                    id="bonusPoints"
                    name="bonusPoints"
                    type="number"
                    min={1}
                    placeholder="e.g., 100"
                    value={formData.bonusPoints}
                    onChange={handleInputChange}
                    className={inputClassName}
                  />
                  <FieldError message={errors.bonusPoints} />
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2.5">
                <FieldLabel htmlFor="limitUsageToXProducts" hint="Limits how many units of the reward can be applied per order. Leave blank for no limit.">
                  Limit Usage to X Products
                </FieldLabel>
                <Input
                  id="limitUsageToXProducts"
                  name="limitUsageToXProducts"
                  type="number"
                  min={1}
                  placeholder="No limit"
                  value={formData.limitUsageToXProducts}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
              </div>
              <div className="grid gap-2.5">
                <FieldLabel htmlFor="expireAfterXDays" hint="How many days after redemption the coupon expires. Leave blank if it never expires.">
                  Expire After X Days
                </FieldLabel>
                <Input
                  id="expireAfterXDays"
                  name="expireAfterXDays"
                  type="number"
                  min={1}
                  placeholder="Never expires"
                  value={formData.expireAfterXDays}
                  onChange={handleInputChange}
                  className={inputClassName}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Restrictions & limits                                            */}
        {/* ---------------------------------------------------------------- */}
        <Card className="gap-0 overflow-hidden rounded-2xl border-[#efe3dc] bg-white py-0 shadow-[0_2px_10px_rgba(31,27,24,0.04)]">
          <CardHeader className="border-b border-[#f6ece6] px-5 py-5 sm:px-6">
            <SectionHeader
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Restrictions & Limits"
              description="Control when and how often this reward can be used."
            />
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-6 sm:px-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SwitchField
                id="allowFreeShipping"
                label="Allow Free Shipping"
                description="Waive delivery fees on orders using this reward."
                hint="Removes the delivery fee for any order that uses this reward."
                checked={formData.allowFreeShipping}
                onCheckedChange={checked =>
                  handleSwitchChange('allowFreeShipping', checked)
                }
              />
              <SwitchField
                id="individualUseOnly"
                label="Individual Use Only"
                description="Cannot be combined with other coupons."
                hint="Prevents customers from stacking this reward with any other coupon or reward."
                checked={formData.individualUseOnly}
                onCheckedChange={checked =>
                  handleSwitchChange('individualUseOnly', checked)
                }
              />
              <SwitchField
                id="excludeSaleItems"
                label="Exclude Sale Items"
                description="Sale products are not eligible."
                hint="Products already on sale will not qualify for this reward."
                checked={formData.excludeSaleItems}
                onCheckedChange={checked =>
                  handleSwitchChange('excludeSaleItems', checked)
                }
              />
              <SwitchField
                id="allowLimitToReset"
                label="Allow Limit to Reset"
                description="Reset the per-customer usage limit."
                hint="Automatically resets the per-customer usage limit after the configured period."
                checked={formData.allowLimitToReset}
                onCheckedChange={checked =>
                  handleSwitchChange('allowLimitToReset', checked)
                }
              />
            </div>

            <div className="grid gap-2.5 sm:max-w-xs">
              <FieldLabel htmlFor="limitPerCustomer" hint="The maximum number of times a single customer can redeem this reward. Leave blank for unlimited.">
                Limit Per Customer
              </FieldLabel>
              <Input
                id="limitPerCustomer"
                name="limitPerCustomer"
                type="number"
                min={1}
                placeholder="No limit"
                value={formData.limitPerCustomer}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="grid gap-2.5">
                <FieldLabel htmlFor="includedProductIds" hint="Only these products will qualify for the reward. Leave empty to include every product.">
                  Included Products
                </FieldLabel>
                <Popover
                  open={openIncludedProducts}
                  onOpenChange={setOpenIncludedProducts}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openIncludedProducts}
                      className={cn(
                        'h-11 w-full justify-between rounded-xl border-[#e7d9d1] bg-white px-3 text-sm font-normal shadow-none hover:bg-white',
                        formData.includedProductIds.length === 0 &&
                          'text-gray-400'
                      )}
                    >
                      {formData.includedProductIds.length > 0
                        ? `${formData.includedProductIds.length} product(s) selected`
                        : 'All products'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                                  'mr-2 h-4 w-4 text-orange-600',
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

              <div className="grid gap-2.5">
                <FieldLabel htmlFor="excludedProductIds" hint="These products will never qualify for the reward, even if they are otherwise eligible.">
                  Excluded Products
                </FieldLabel>
                <Popover
                  open={openExcludedProducts}
                  onOpenChange={setOpenExcludedProducts}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openExcludedProducts}
                      className={cn(
                        'h-11 w-full justify-between rounded-xl border-[#e7d9d1] bg-white px-3 text-sm font-normal shadow-none hover:bg-white',
                        formData.excludedProductIds.length === 0 &&
                          'text-gray-400'
                      )}
                    >
                      {formData.excludedProductIds.length > 0
                        ? `${formData.excludedProductIds.length} product(s) selected`
                        : 'No products excluded'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                                  'mr-2 h-4 w-4 text-orange-600',
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
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="grid gap-2.5">
                <FieldLabel htmlFor="beginDate" hint="The date this reward becomes available. Leave empty to start immediately.">
                  Begin Date
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="beginDate"
                      variant="outline"
                      className={cn(
                        'h-11 w-full justify-start rounded-xl border-[#e7d9d1] bg-white px-3 text-left text-sm font-normal shadow-none hover:bg-white',
                        !formData.beginDate && 'text-gray-400'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
                      {formData.beginDate ? (
                        format(formData.beginDate, 'PPP')
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.beginDate}
                      onSelect={date => handleSelectChange('beginDate', date)}
                      disabled={date => isBefore(date, todayStart)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2.5">
                <FieldLabel htmlFor="endDate" hint="The date this reward stops being available. Leave empty to run indefinitely.">
                  End Date
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        'h-11 w-full justify-start rounded-xl border-[#e7d9d1] bg-white px-3 text-left text-sm font-normal shadow-none hover:bg-white',
                        !formData.endDate && 'text-gray-400'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
                      {formData.endDate ? (
                        format(formData.endDate, 'PPP')
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={date => handleSelectChange('endDate', date)}
                      disabled={date =>
                        isBefore(
                          date,
                          formData.beginDate
                            ? startOfDay(formData.beginDate)
                            : todayStart
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

        {/* Actions */}
        <div className="flex flex-col-reverse items-stretch gap-3 rounded-2xl border border-[#efe3dc] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(31,27,24,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-gray-500">
            Fields marked <span className="text-orange-600">*</span> are
            required.
          </p>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#a14000] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#8a3700] sm:w-auto"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : submitButtonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
