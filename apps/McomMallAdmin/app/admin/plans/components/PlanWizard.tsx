'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { cn } from '@/lib/utils';
import { ArrowRight, Check, ClipboardList, Layers } from 'lucide-react';
import { Plan, getTierLabel } from '@/app/admin/types/plan';
import { VariantColumn } from './VariantColumn';
import { TIER_THEME } from './plan-theme';
import {
  PlanFormValues,
  VARIANT_ORDER,
  blankPlanValues,
  planSchema,
  planToFormValues,
  slugify,
} from './plan-schema';

const STEPS = [
  { id: 1, label: 'General', hint: 'Name, slug & visibility' },
  { id: 2, label: 'Variants', hint: 'Standard · Pro · Pro+' },
] as const;

interface PlanWizardProps {
  initialData?: Plan;
  onSubmit: (values: PlanFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3">
      {STEPS.map((item, index) => {
        const done = step > item.id;
        const active = step === item.id;
        return (
          <li key={item.id} className="flex items-center gap-3 flex-1 last:flex-none">
            <div
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all',
                active
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-400',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold',
                  active
                    ? 'bg-white text-slate-900'
                    : done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : item.id}
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">
                  {item.label}
                </span>
                <span
                  className={cn(
                    'block text-[11px] leading-tight',
                    active ? 'text-slate-300' : done ? 'text-emerald-600' : 'text-slate-400',
                  )}
                >
                  {item.hint}
                </span>
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 rounded-full',
                  done ? 'bg-emerald-400' : 'bg-slate-200',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function LivePriceSummary() {
  const { control } = useFormContext<PlanFormValues>();
  const variants = useWatch({ control, name: 'variants' });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(variants ?? []).map((variant, index) => {
        const theme = TIER_THEME[VARIANT_ORDER[index]];
        if (!theme) return null;
        const amount = Number(variant?.price) || 0;
        return (
          <Badge
            key={VARIANT_ORDER[index]}
            variant="outline"
            className={cn('gap-1.5 px-3 py-1.5 text-xs font-bold', theme.chip)}
          >
            {getTierLabel(VARIANT_ORDER[index])} · £{amount.toFixed(2)}
          </Badge>
        );
      })}
    </div>
  );
}

export function PlanWizard({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: PlanWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: blankPlanValues(),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (initialData) {
      form.reset(planToFormValues(initialData));
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');

  useEffect(() => {
    if (!slugValue && nameValue) {
      form.setValue('slug', slugify(nameValue), { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue]);

  const handleContinue = async () => {
    const valid = await form.trigger(['name', 'slug', 'description', 'isActive']);
    if (valid) setStep(2);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Stepper step={step} />

        {step === 1 && (
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden max-w-3xl">
            <div className="flex items-center gap-3 border-b bg-slate-50/60 px-6 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-slate-900">
                  Plan basics
                </h2>
                <p className="text-xs text-slate-500">
                  One plan family — its three variants come next.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Gold"
                          className="text-base font-semibold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. gold" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Who is this plan for?"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Shown under the plan name on the pricing page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-dashed p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Inactive plans are hidden from buyers but keep existing
                        subscribers.
                      </FormDescription>
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

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleContinue}
                  size="lg"
                  className="gap-2"
                >
                  Continue to Variants <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 pb-28">
            <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Layers className="h-5 w-5" />
              </span>
              <p className="text-sm text-slate-600">
                Configure all three variants side by side. Each has its own
                price — charged once for the full duration — plus quotas and
                features. Everything saves together as one plan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {VARIANT_ORDER.map((tier, index) => (
                <VariantColumn key={tier} index={index} tier={tier} />
              ))}
            </div>

            <div className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border bg-white/95 backdrop-blur px-5 py-3.5 shadow-xl shadow-slate-900/10">
                <LivePriceSummary />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : submitLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
