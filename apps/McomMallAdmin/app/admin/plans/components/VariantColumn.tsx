'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanTier, getTierLabel } from '@/app/admin/types/plan';
import { PlanFormValues, VARIANT_HINTS } from './plan-schema';
import { TIER_THEME } from './plan-theme';

const QUOTA_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'maxListings', label: 'Listings' },
  { key: 'maxProducts', label: 'Products' },
  { key: 'maxServices', label: 'Services' },
  { key: 'maxImagesPerListing', label: 'Images/Listing' },
  { key: 'maxGiftCardTemplates', label: 'Gift Cards' },
  { key: 'maxCouponTemplates', label: 'Coupons' },
  { key: 'maxLoyaltyPrograms', label: 'Loyalty' },
  { key: 'featuredListingAllowance', label: 'Featured' },
];

const FLAG_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'priorityInSearch', label: 'Priority Search' },
  { key: 'advancedAnalytics', label: 'Analytics' },
  { key: 'dedicatedSupport', label: 'Support' },
  { key: 'allowCustomBranding', label: 'Branding' },
  { key: 'allowGroupCreation', label: 'Groups' },
];

interface VariantColumnProps {
  index: number;
  tier: PlanTier;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-bold text-[11px] uppercase tracking-[0.14em] text-slate-400">
      {children}
    </h4>
  );
}

export function VariantColumn({ index, tier }: VariantColumnProps) {
  const { control, watch } = useFormContext<PlanFormValues>();
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: `variants.${index}.features` as never,
  });

  const theme = TIER_THEME[tier];
  const Icon = theme.icon;
  const isActive = watch(`variants.${index}.isActive` as never) as unknown as boolean;
  const duration = VARIANT_HINTS[tier].split('·')[1]?.trim() ?? '';

  return (
    <div
      className={cn(
        'rounded-2xl border-2 bg-white shadow-sm flex flex-col min-w-0 overflow-hidden transition-all',
        isActive ? theme.border : 'border-slate-200 opacity-90',
      )}
    >
      <div className={cn('bg-gradient-to-r px-5 py-4 text-white', theme.banner)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold leading-tight">
                {getTierLabel(tier)}
              </h3>
              <p className="text-xs text-white/80">{VARIANT_HINTS[tier]}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 hover:bg-white/20"
          >
            {duration}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        <div className={cn('rounded-xl p-4', theme.soft)}>
          <FormField
            control={control}
            name={`variants.${index}.price` as never}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={cn('font-bold', theme.text)}>
                  Price — one-off for {duration}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      £
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7 text-xl font-extrabold bg-white"
                      {...field}
                      value={(field.value as number) ?? 0}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber || 0)
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name={`variants.${index}.stripePriceId` as never}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Price ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="price_..."
                    {...field}
                    value={(field.value as string) ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${index}.paypalPlanId` as never}
            render={({ field }) => (
              <FormItem>
                <FormLabel>PayPal Plan ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="P-..."
                    {...field}
                    value={(field.value as string) ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name={`variants.${index}.isActive` as never}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-dashed p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-bold">
                  Sell this variant
                </FormLabel>
                <FormDescription className="text-xs">
                  Paused variants stay saved but hidden from buyers.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={(field.value as boolean) ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <SectionTitle>Quotas</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {QUOTA_FIELDS.map((quota) => (
              <FormField
                key={quota.key}
                control={control}
                name={
                  `variants.${index}.configuration.quotas.${quota.key}` as never
                }
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{quota.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={(field.value as number) ?? 0}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <FormField
              control={control}
              name={
                `variants.${index}.configuration.quotas.allowProductListing` as never
              }
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg bg-slate-50 px-3 py-2">
                  <FormLabel className="text-sm">Allow Products</FormLabel>
                  <FormControl>
                    <Switch
                      checked={(field.value as boolean) ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={
                `variants.${index}.configuration.quotas.allowServiceListing` as never
              }
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg bg-slate-50 px-3 py-2">
                  <FormLabel className="text-sm">Allow Services</FormLabel>
                  <FormControl>
                    <Switch
                      checked={(field.value as boolean) ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle>Pricing page bullets</SectionTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendFeature('')}
              className="gap-1 h-8"
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {featureFields.map((field, featureIndex) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={control}
                  name={`variants.${index}.features.${featureIndex}`}
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          {...field}
                          value={(field.value as string) ?? ''}
                          placeholder="e.g. Advanced Analytics"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeFeature(featureIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {featureFields.length === 0 && (
              <p className="text-xs text-slate-400 italic rounded-lg border border-dashed p-3 text-center">
                No bullets yet — add what buyers will see.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <SectionTitle>Feature flags</SectionTitle>
          {FLAG_FIELDS.map((flag) => (
            <FormField
              key={flag.key}
              control={control}
              name={
                `variants.${index}.configuration.featureFlags.${flag.key}` as never
              }
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border px-3 py-2 space-y-0">
                  <FormLabel className="text-sm">{flag.label}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={(field.value as boolean) ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
