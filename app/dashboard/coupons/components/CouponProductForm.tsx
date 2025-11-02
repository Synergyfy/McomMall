'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreateCouponProductDto, CouponProduct, UpdateCouponProductDto } from '@/service/coupon-products/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  fixedAmounts: z.array(z.number()).optional(),
  allowCustomAmount: z.boolean().optional(),
  minCustomAmount: z.coerce.number().optional(),
  maxCustomAmount: z.coerce.number().optional(),
  allowReloading: z.boolean().optional(),
  bonusThreshold: z.coerce.number().optional(),
  bonusAmount: z.coerce.number().optional(),
  expiryDays: z.coerce.number().optional(),
  backgroundImage: z.string().optional(),
  textColor: z.string().optional(),
});

interface CouponProductFormProps {
  couponProduct?: CouponProduct;
  onSubmit: (data: CreateCouponProductDto | UpdateCouponProductDto) => void;
}

export function CouponProductForm({ couponProduct, onSubmit }: CouponProductFormProps) {
  const sanitizedDefaultValues = React.useMemo(() => {
    if (!couponProduct) {
      return {
        name: '',
        description: '',
        fixedAmounts: [],
        allowCustomAmount: false,
        minCustomAmount: 0,
        maxCustomAmount: 0,
        allowReloading: false,
        bonusThreshold: 0,
        bonusAmount: 0,
        expiryDays: 0,
        backgroundImage: '',
        textColor: '',
      };
    }
    return {
      ...couponProduct,
      description: couponProduct.description ?? '',
      fixedAmounts: couponProduct.fixedAmounts ?? [],
      minCustomAmount: couponProduct.minCustomAmount ?? 0,
      maxCustomAmount: couponProduct.maxCustomAmount ?? 0,
      bonusThreshold: couponProduct.bonusThreshold ?? 0,
      bonusAmount: couponProduct.bonusAmount ?? 0,
      expiryDays: couponProduct.expiryDays ?? 0,
      backgroundImage: couponProduct.backgroundImage ?? '',
      textColor: couponProduct.textColor ?? '',
    };
  }, [couponProduct]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: sanitizedDefaultValues,
  });

  const [fixedAmounts, setFixedAmounts] = React.useState<number[]>(couponProduct?.fixedAmounts || []);

  useEffect(() => {
    form.reset(sanitizedDefaultValues);
    if (couponProduct) {
      setFixedAmounts(couponProduct.fixedAmounts || []);
    }
  }, [sanitizedDefaultValues, form, couponProduct]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const data = { ...values, fixedAmounts };
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Summer Special" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="A short description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Fixed Amounts</FormLabel>
          {fixedAmounts.map((amount, index) => (
            <div key={index} className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  const newAmounts = [...fixedAmounts];
                  newAmounts[index] = Number(e.target.value);
                  setFixedAmounts(newAmounts);
                }}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const newAmounts = [...fixedAmounts];
                  newAmounts.splice(index, 1);
                  setFixedAmounts(newAmounts);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setFixedAmounts([...fixedAmounts, 0])}
            className="mt-2"
          >
            Add Fixed Amount
          </Button>
        </div>
        <FormField
          control={form.control}
          name="allowCustomAmount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Custom Amount</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minCustomAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Custom Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxCustomAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Custom Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allowReloading"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Reloading</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bonusThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bonus Threshold</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bonusAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bonus Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiryDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Days</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="backgroundImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="textColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <FormControl>
                <Input placeholder="#FFFFFF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{couponProduct ? 'Update' : 'Create'}</Button>
      </form>
    </Form>
  );
}
