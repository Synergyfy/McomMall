'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { BadgePoundSterling, Info, PoundSterling } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRICING_TYPE_OPTIONS } from '@/lib/service-pricing';

export function Step2Pricing() {
  const form = useFormContext();
  const { control, watch, setValue } = form;
  const pricingType = watch('pricingType');

  const selectPricingType = (value: string) => {
    setValue('pricingType', value, { shouldValidate: true });
    form.clearErrors(['price', 'priceMax']);
    if (value === 'quote' || value === 'free') {
      setValue('price', undefined);
      setValue('priceMax', undefined);
    }
  };

  const priceLabel =
    pricingType === 'startingFrom'
      ? 'Starting Price'
      : pricingType === 'hourly'
        ? 'Hourly Rate'
        : 'Price';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <PoundSterling className="w-5 h-5 text-primary" />
            Pricing
          </CardTitle>
          <CardDescription>
            Choose how customers will be charged. The price fields adapt to the
            option you select.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="pricingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Pricing Option <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PRICING_TYPE_OPTIONS.map((option) => {
                    const selected = field.value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectPricingType(option.value)}
                        className={cn(
                          'flex flex-col gap-1 rounded-xl border-2 p-4 text-left transition-all',
                          selected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <span className="flex items-center justify-between text-sm font-bold text-gray-900">
                          {option.label}
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          )}
                        </span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {(pricingType === 'fixed' ||
            pricingType === 'startingFrom' ||
            pricingType === 'hourly') && (
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-top-2">
                  <FormLabel className="text-sm font-semibold">
                    {priceLabel} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        £
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        className="py-6 pl-8"
                      />
                    </div>
                  </FormControl>
                  {pricingType === 'startingFrom' && (
                    <FormDescription>
                      Customers will see &ldquo;From&rdquo; before this price.
                    </FormDescription>
                  )}
                  {pricingType === 'hourly' && (
                    <FormDescription>
                      Customers will see this rate per hour.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {pricingType === 'range' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2">
              <FormField
                control={control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Minimum Price <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          £
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          className="py-6 pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="priceMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Maximum Price <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          £
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          className="py-6 pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {pricingType === 'quote' && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 animate-in fade-in">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  Customers will request a quotation
                </p>
                <p className="text-xs text-blue-800">
                  No price is required. You can respond with a tailored quote
                  after reviewing the customer&apos;s requirements.
                </p>
              </div>
            </div>
          )}

          {pricingType === 'free' && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 animate-in fade-in">
              <BadgePoundSterling className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-900">
                  This service is free
                </p>
                <p className="text-xs text-emerald-800">
                  Customers will see &ldquo;Free&rdquo; instead of a price.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
