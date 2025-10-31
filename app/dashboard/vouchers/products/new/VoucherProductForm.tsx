'use client';

import React, { useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { CreateVoucherProductDto } from '@/service/vouchers/types';
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

type VoucherProductFormData = CreateVoucherProductDto;

interface VoucherProductFormProps {
  form: UseFormReturn<VoucherProductFormData>;
  isSubmitting?: boolean;
}

export const VoucherProductForm: React.FC<VoucherProductFormProps> = ({
  form,
  isSubmitting,
}) => {
  const [fixedAmountInput, setFixedAmountInput] = useState('');
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = form;

  const fixedAmounts = watch('fixedAmounts') || [];
  const allowCustomAmount = watch('allowCustomAmount');
  const id = watch('id');

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
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="name">Name</Label>
          <InfoTooltip text="The name of the voucher product." />
        </div>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1"
        />
        <SubNote text="e.g., Summer Sale Voucher" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} className="mt-1" />
        <SubNote text="A brief description of the coupon and what it offers." />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="backgroundImage">Background Image</Label>
        <Input
          id="backgroundImage"
          type="file"
          {...register('backgroundImage')}
          className="mt-1"
        />
        <SubNote text="Upload a background image for the voucher card." />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="textColor">Text Color</Label>
        <Input
          id="textColor"
          type="color"
          {...register('textColor')}
          className="mt-1"
        />
        <SubNote text="Select a text color for the voucher card." />
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
        <Label htmlFor="allowReloading">Allow Reloading</Label>
        <Controller
          name="allowReloading"
          control={control}
          render={({ field }) => (
            <Switch
              id="allowReloading"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
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
        <Button type="submit" disabled={isSubmitting || formIsSubmitting} className="w-full">
          {isSubmitting
            ? 'Submitting...'
            : id
            ? 'Update Product'
            : 'Create Product'}
        </Button>
      </div>
    </div>
  );
};