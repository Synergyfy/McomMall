'use client';

import React from 'react';
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

type VoucherProductFormData = Omit<CreateVoucherProductDto, 'fixedAmounts'> & {
  fixedAmounts: string;
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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VoucherProductFormData>({
    defaultValues: initialData
      ? {
          ...initialData,
          fixedAmounts: initialData.fixedAmounts.join(', '),
        }
      : {},
  });

  const handleFormSubmit = (data: VoucherProductFormData) => {
    const processedData = {
      ...data,
      fixedAmounts: data.fixedAmounts
        .split(',')
        .map(item => Number(item.trim()))
        .filter(n => !isNaN(n) && n > 0),
      expiryDays: data.expiryDays ? Number(data.expiryDays) : undefined,
    };
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
      </div>

      <div>
        <Label htmlFor="fixedAmounts">
          Fixed Amounts (comma-separated)
        </Label>
        <Input
          id="fixedAmounts"
          {...register('fixedAmounts', {
            required: 'At least one amount is required',
          })}
          placeholder="e.g., 10, 25, 50"
        />
        {errors.fixedAmounts && (
          <p className="text-red-500">{errors.fixedAmounts.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="expiryDays">Expiry in Days</Label>
        <Input
          id="expiryDays"
          type="number"
          {...register('expiryDays')}
          placeholder="e.g., 90"
        />
      </div>

      <div>
        <Label htmlFor="usage">Usage</Label>
        <Controller
          name="usage"
          control={control}
          defaultValue="both"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
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

      <div className="flex items-center justify-between">
        <Label htmlFor="allowPartialRedemption">
          Allow Partial Redemption
        </Label>
        <Controller
          name="allowPartialRedemption"
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Switch
              id="allowPartialRedemption"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isEnabled">Enable Product for Purchase</Label>
        <Controller
          name="isEnabled"
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Switch
              id="isEnabled"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Submitting...'
          : initialData
          ? 'Update Product'
          : 'Create Product'}
      </Button>
    </form>
  );
};