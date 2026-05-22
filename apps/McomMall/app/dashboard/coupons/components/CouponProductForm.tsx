'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


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
  backgroundImage: z.any().optional(),
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
        backgroundImage: null,
        textColor: '#000000',
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
      backgroundImage: couponProduct.backgroundImage ?? null,
      textColor: couponProduct.textColor ?? '#000000',
    };
  }, [couponProduct]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: sanitizedDefaultValues,
  });

  const [fixedAmountInput, setFixedAmountInput] = React.useState('');
  const fixedAmounts = form.watch('fixedAmounts') || [];
  const allowCustomAmount = form.watch('allowCustomAmount');
  const [imagePreview, setImagePreview] = React.useState<string | null>(couponProduct?.backgroundImage || null);

  useEffect(() => {
    form.reset(sanitizedDefaultValues);
    setImagePreview(couponProduct?.backgroundImage || null);
  }, [sanitizedDefaultValues, form, couponProduct]);

  const handleFixedAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const value = parseFloat(fixedAmountInput.trim());
      if (!isNaN(value) && value > 0 && !fixedAmounts.includes(value)) {
        form.setValue('fixedAmounts', [...fixedAmounts, value]);
      }
      setFixedAmountInput('');
    }
  };

  const removeFixedAmount = (amount: number) => {
    form.setValue('fixedAmounts', fixedAmounts.filter((a) => a !== amount));
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
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
          <Input
            value={fixedAmountInput}
            onChange={(e) => setFixedAmountInput(e.target.value)}
            onKeyDown={handleFixedAmountKeyDown}
            placeholder="Enter amount and press , or Enter"
            className="mt-1"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {fixedAmounts.map((amount) => (
              <div key={amount} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
                £{amount}
                <button type="button" onClick={() => removeFixedAmount(amount)} className="ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
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
        {allowCustomAmount && (
          <>
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
          </>
        )}
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
              <FormLabel>Background Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(e.target.files);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {imagePreview && (
          <div className="mt-4">
            <img src={imagePreview} alt="Image preview" width={500} height={300} />
          </div>
        )}
        <FormField
          control={form.control}
          name="textColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <div className="w-6 h-6 rounded-full border mr-2" style={{ backgroundColor: field.value }} />
                      {field.value}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-2">
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-40 h-40 cursor-pointer border-0 p-0 bg-transparent"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{couponProduct ? 'Update' : 'Create'}</Button>
      </form>
    </Form>
  );
}
