'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  CreateVoucherProductDto,
  VoucherProduct,
} from '@/service/vouchers/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InfoTooltip = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SubNote = ({ text }: { text: string }) => (
  <p className="text-xs text-gray-500 mt-1">{text}</p>
);

type VoucherProductFormData = CreateVoucherProductDto & {
  discountType: 'fixed_cart' | 'percent';
  couponAmount: number;
  minSpend: number;
  maxSpend: number;
  usageLimitPerCoupon: number;
  usageLimitPerUser: number;
};

interface VoucherProductFormProps {
  onSubmit: (data: CreateVoucherProductDto) => void;
  initialData?: VoucherProduct;
  isSubmitting?: boolean;
}

export const VoucherProductForm: React.FC<VoucherProductFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [fixedAmountInput, setFixedAmountInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VoucherProductFormData>({
    defaultValues: initialData
      ? {
          ...initialData,
          discountType: initialData.discountType || 'fixed_cart',
          couponAmount: initialData.couponAmount || 0,
        }
      : {
          name: '',
          fixedAmounts: [],
          usage: 'both',
          allowPartialRedemption: true,
          isEnabled: true,
          allowCustomAmount: false,
          discountType: 'fixed_cart',
          couponAmount: 0,
          minSpend: 0,
          maxSpend: 0,
          usageLimitPerCoupon: 0,
          usageLimitPerUser: 0,
        },
  });

  const fixedAmounts = watch('fixedAmounts') || [];
  const allowCustomAmount = watch('allowCustomAmount');

  const handleFormSubmit = (data: VoucherProductFormData) => {
    const processedData: CreateVoucherProductDto = {
      ...data,
      fixedAmounts: data.fixedAmounts || [],
      expiryDays: data.expiryDays ? Number(data.expiryDays) : undefined,
    };

    if (!data.allowCustomAmount) {
      delete processedData.minCustomAmount;
      delete processedData.maxCustomAmount;
    } else {
      processedData.minCustomAmount = Number(data.minCustomAmount);
      processedData.maxCustomAmount = Number(data.maxCustomAmount);
    }

    if (data.bonusThreshold || data.bonusAmount) {
      if (!data.bonusThreshold || data.bonusThreshold <= 0) {
        // This should be caught by form validation, but as a safeguard.
        return;
      }
      if (!data.bonusAmount || data.bonusAmount <= 0) {
        // This should be caught by form validation, but as a safeguard.
        return;
      }
      processedData.bonusThreshold = Number(data.bonusThreshold);
      processedData.bonusAmount = Number(data.bonusAmount);
    }

    onSubmit(processedData);
  };

  const handleFixedAmountKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newAmount = Number(fixedAmountInput.trim());
      if (
        !isNaN(newAmount) &&
        newAmount > 0 &&
        !fixedAmounts.includes(newAmount)
      ) {
        setValue('fixedAmounts', [...fixedAmounts, newAmount]);
        setFixedAmountInput('');
      }
    }
  };

  const removeFixedAmount = (amountToRemove: number) => {
    setValue(
      'fixedAmounts',
      fixedAmounts.filter(amount => amount !== amountToRemove)
    );
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="name">Coupon Code</Label>
          <InfoTooltip text="The code shoppers will use to apply the coupon." />
        </div>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1"
        />
        <SubNote text="e.g., SUMMER2024" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" />
        <SubNote text="A brief description of the coupon and what it offers." />
      </div>

      <div>
        <Label htmlFor="discountType">Discount Type</Label>
        <Controller
          name="discountType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_cart">Fixed Cart Discount</SelectItem>
                <SelectItem value="percent">Percentage Discount</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {watch('discountType') === 'fixed_cart' && (
          <SubNote text="This coupon provides a fixed discount on the entire purchase." />
        )}
      </div>

      <div>
        <Label htmlFor="couponAmount">Coupon Amount</Label>
        <div className="relative">
          <Input
            id="couponAmount"
            type="number"
            {...register('couponAmount', {
              required: 'Coupon amount is required',
              max: watch('discountType') === 'percent' ? 100 : undefined,
            })}
            className="mt-1"
          />
          {watch('discountType') === 'percent' && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">%</span>
          )}
        </div>
        {errors.couponAmount && (
          <p className="text-red-500">{errors.couponAmount.message}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="fixedAmounts">Fixed Amounts</Label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <AnimatePresence>
            {fixedAmounts.map(amount => (
              <motion.div
                key={amount}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5"
                >
                  {amount}
                  <button
                    type="button"
                    onClick={() => removeFixedAmount(amount)}
                    className="rounded-full hover:bg-gray-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <Input
          id="fixedAmounts"
          value={fixedAmountInput}
          onChange={e => setFixedAmountInput(e.target.value)}
          onKeyDown={handleFixedAmountKeyDown}
          placeholder="Type amount and press Enter or comma"
          className="mt-2"
        />
        {errors.fixedAmounts && (
          <p className="mt-1 text-red-500">{errors.fixedAmounts.message}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="allowCustomAmount">Allow Custom Amount</Label>
          <Controller
            name="allowCustomAmount"
            control={control}
            render={({ field }) => (
              <Switch
                id="allowCustomAmount"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {allowCustomAmount && (
        <>
          <div>
            <Label htmlFor="minCustomAmount">Min Amount</Label>
            <Input
              id="minCustomAmount"
              type="number"
              {...register('minCustomAmount', {
                valueAsNumber: true,
                required: 'Min amount is required',
              })}
              className="mt-1"
            />
            {errors.minCustomAmount && (
              <p className="mt-1 text-red-500">
                {errors.minCustomAmount.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="maxCustomAmount">Max Amount</Label>
            <Input
              id="maxCustomAmount"
              type="number"
              {...register('maxCustomAmount', {
                valueAsNumber: true,
                required: 'Max amount is required',
              })}
              className="mt-1"
            />
            {errors.maxCustomAmount && (
              <p className="mt-1 text-red-500">
                {errors.maxCustomAmount.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <h3 className="text-lg font-medium">Usage Restrictions</h3>
        <SubNote text="Control who can use this coupon and how it can be used." />
      </div>

      <div>
        <Label htmlFor="minSpend">Minimum Spend</Label>
        <Input id="minSpend" type="number" {...register('minSpend')} className="mt-1" />
        <SubNote text="The minimum amount that must be spent for the coupon to be valid." />
      </div>

      <div>
        <Label htmlFor="maxSpend">Maximum Spend</Label>
        <Input id="maxSpend" type="number" {...register('maxSpend')} className="mt-1" />
        <SubNote text="The maximum amount that can be spent for the coupon to be valid." />
      </div>

      <div className="sm:col-span-2">
        <h3 className="text-lg font-medium">Usage Limits</h3>
        <SubNote text="Set limits on how many times the coupon can be used." />
      </div>

      <div>
        <Label htmlFor="usageLimitPerCoupon">Usage Limit per Coupon</Label>
        <Input id="usageLimitPerCoupon" type="number" {...register('usageLimitPerCoupon')} className="mt-1" />
        <SubNote text="The total number of times the coupon can be used." />
      </div>

      <div>
        <Label htmlFor="usageLimitPerUser">Usage Limit per User</Label>
        <Input id="usageLimitPerUser" type="number" {...register('usageLimitPerUser')} className="mt-1" />
        <SubNote text="The number of times a single user can use the coupon." />
      </div>

        <div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="bonusThreshold">Bonus Threshold</Label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>If a customer spends at least this much on a single voucher, they will receive a bonus amount.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <Input
                id="bonusThreshold"
                type="number"
                {...register('bonusThreshold', { valueAsNumber: true })}
                className="mt-1"
            />
            {errors.bonusThreshold && (
                <p className="mt-1 text-red-500">
                    {errors.bonusThreshold.message}
                </p>
            )}
        </div>

        <div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="bonusAmount">Bonus Amount</Label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>The extra amount to add to the voucher balance when the bonus threshold is met.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <Input
                id="bonusAmount"
                type="number"
                {...register('bonusAmount', { valueAsNumber: true })}
                className="mt-1"
            />
            {errors.bonusAmount && (
                <p className="mt-1 text-red-500">
                    {errors.bonusAmount.message}
                </p>
            )}
        </div>

      <div>
        <Label htmlFor="expiryDays">Expiry in Days (optional)</Label>
        <Input
          id="expiryDays"
          type="number"
          {...register('expiryDays')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="usage">Usage</Label>
        <Controller
          name="usage"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select usage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Online & In-store</SelectItem>
                <SelectItem value="online_only">Online Only</SelectItem>
                <SelectItem value="instore_only">In-store Only</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex items-center justify-between sm:col-span-2">
        <Label htmlFor="allowPartialRedemption">
          Allow Partial Redemption
        </Label>
        <Controller
          name="allowPartialRedemption"
          control={control}
          render={({ field }) => (
            <Switch
              id="allowPartialRedemption"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between sm:col-span-2">
        <Label htmlFor="isEnabled">Enable Product for Purchase</Label>
        <Controller
          name="isEnabled"
          control={control}
          render={({ field }) => (
            <Switch
              id="isEnabled"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? 'Submitting...'
            : initialData
            ? 'Update Product'
            : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};