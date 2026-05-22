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
import { X, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-2">
    <FormLabel>{label}</FormLabel>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

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
  logoUrl: z.any().optional(),
  textColor: z.string().optional(),
  isEnabled: z.boolean().optional(),
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
        logoUrl: null,
        textColor: '#000000',
        isEnabled: true,
      };
    }
    return {
      ...couponProduct,
      isEnabled: couponProduct.isEnabled ?? true,
      description: couponProduct.description ?? '',
      fixedAmounts: couponProduct.fixedAmounts ?? [],
      minCustomAmount: couponProduct.minCustomAmount ?? 0,
      maxCustomAmount: couponProduct.maxCustomAmount ?? 0,
      bonusThreshold: couponProduct.bonusThreshold ?? 0,
      bonusAmount: couponProduct.bonusAmount ?? 0,
      expiryDays: couponProduct.expiryDays ?? 0,
      backgroundImage: couponProduct.backgroundImage ?? null,
      logoUrl: couponProduct.logoUrl ?? null,
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
  const [logoPreview, setLogoPreview] = React.useState<string | null>(couponProduct?.logoUrl || null);

  useEffect(() => {
    form.reset(sanitizedDefaultValues);
    setImagePreview(couponProduct?.backgroundImage || null);
    setLogoPreview(couponProduct?.logoUrl || null);
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
              <LabelWithTooltip label="Name" tooltip="The name of the coupon as it will appear to customers." />
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
              <LabelWithTooltip label="Description" tooltip="A brief description explaining what this coupon is for or any specific terms." />
              <FormControl>
                <Input placeholder="A short description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <LabelWithTooltip label="Fixed Amounts" tooltip="Specific denominations available for purchase. Type a value and press Enter or comma to add." />
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
                <LabelWithTooltip label="Allow Custom Amount" tooltip="If enabled, customers can choose their own value between the minimum and maximum limits." />
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
                  <LabelWithTooltip label="Min Custom Amount" tooltip="The smallest amount a customer can enter for a custom-valued coupon." />
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
                  <LabelWithTooltip label="Max Custom Amount" tooltip="The largest amount a customer can enter for a custom-valued coupon." />
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
                <LabelWithTooltip label="Allow Reloading" tooltip="Allow customers to add more funds to their coupon after the initial purchase." />
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
              <LabelWithTooltip label="Bonus Threshold" tooltip="The minimum purchase amount required to trigger a bonus balance." />
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
              <LabelWithTooltip label="Bonus Amount" tooltip="The extra credit given to the customer when the bonus threshold is met." />
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
              <LabelWithTooltip label="Expiry Days" tooltip="Number of days the coupon is valid for after purchase. Set to 0 for no expiration." />
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
              <LabelWithTooltip label="Background Image" tooltip="Choose an image to serve as the background for the coupon card." />
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
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <LabelWithTooltip label="Logo" tooltip="Your business branding to display on the coupon card." />
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(e.target.files);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {logoPreview && (
          <div className="mt-4">
            <img src={logoPreview} alt="Logo preview" width={128} height={128} />
          </div>
        )}
        <FormField
          control={form.control}
          name="textColor"
          render={({ field }) => (
            <FormItem>
              <LabelWithTooltip label="Text Color" tooltip="The color of the text displayed on the coupon card." />
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
        <FormField
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <LabelWithTooltip label="Enabled" tooltip="Whether this coupon product is active and can be purchased." />
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
        <Button type="submit">{couponProduct ? 'Update' : 'Create'}</Button>
      </form>
    </Form>
  );
}
