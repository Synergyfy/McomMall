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
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type VoucherProductFormData = CreateVoucherProductDto;

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
        }
      : {
          name: '',
          fixedAmounts: [],
          usage: 'both',
          allowPartialRedemption: true,
          isEnabled: true,
          allowCustomAmount: false,
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
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1"
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" />
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