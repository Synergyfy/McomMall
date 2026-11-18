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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CalendarDays,
  CalendarCheck,
  ClipboardList,
  Globe2,
  Layers,
  MapPin,
  MessageSquare,
  PhoneCall,
  Search,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_ACTION_LABELS } from '@/lib/service-pricing';
import type {
  CustomerAction,
  ServiceDeliveryOption,
} from '@/service/services/types';

const DELIVERY_OPTIONS: Array<{
  value: ServiceDeliveryOption | 'multiple';
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: 'atBusiness',
    label: 'At Business Premises',
    description: 'Customers come to your shop, office or studio.',
    icon: Store,
  },
  {
    value: 'atCustomer',
    label: 'At Customer Location',
    description: 'You travel to the customer.',
    icon: MapPin,
  },
  {
    value: 'online',
    label: 'Online / Remote',
    description: 'The service is delivered remotely.',
    icon: Globe2,
  },
  {
    value: 'multiple',
    label: 'Multiple Options',
    description: 'Offer more than one way to receive the service.',
    icon: Layers,
  },
];

const CUSTOMER_ACTIONS: Array<{
  value: CustomerAction;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: 'bookNow',
    label: CUSTOMER_ACTION_LABELS.bookNow,
    description: 'Customers can book a date and time immediately.',
    icon: CalendarCheck,
  },
  {
    value: 'requestQuote',
    label: CUSTOMER_ACTION_LABELS.requestQuote,
    description: 'Customers send their requirements for a tailored price.',
    icon: ClipboardList,
  },
  {
    value: 'enquiry',
    label: CUSTOMER_ACTION_LABELS.enquiry,
    description: 'Customers send a message before deciding.',
    icon: MessageSquare,
  },
  {
    value: 'contactBusiness',
    label: CUSTOMER_ACTION_LABELS.contactBusiness,
    description: 'Show your phone and email for direct contact.',
    icon: PhoneCall,
  },
];

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function Step3BookingAvailability() {
  const { control, watch, setValue } = useFormContext();
  const deliverySelection = watch('deliverySelection');
  const deliveryOptions = (watch('deliveryOptions') ??
    []) as ServiceDeliveryOption[];
  const schedule = (watch('availability.schedule') ?? []) as Array<
    Record<string, any>
  >;

  const selectDelivery = (value: ServiceDeliveryOption | 'multiple') => {
    setValue('deliverySelection', value, { shouldValidate: true });
    if (value === 'multiple') {
      if (deliveryOptions.length === 0) {
        setValue('deliveryOptions', [], { shouldValidate: true });
      }
      return;
    }
    setValue('deliveryOptions', [value], { shouldValidate: true });
  };

  const toggleMultipleOption = (option: ServiceDeliveryOption) => {
    const next = deliveryOptions.includes(option)
      ? deliveryOptions.filter((item) => item !== option)
      : [...deliveryOptions, option];
    setValue('deliveryOptions', next, { shouldValidate: true });
  };

  const updateSchedule = (index: number, patch: Record<string, unknown>) => {
    const next = schedule.map((day, i) =>
      i === index ? { ...day, ...patch } : day,
    );
    setValue('availability.schedule', next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Delivery options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-primary" />
            Booking & Availability
          </CardTitle>
          <CardDescription>
            Explain how customers receive the service and what they should do
            next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <FormField
            control={control}
            name="deliverySelection"
            render={() => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Service Delivery <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = deliverySelection === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectDelivery(option.value)}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                          selected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            selected
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            {option.label}
                          </span>
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {deliverySelection === 'multiple' && (
                  <div className="mt-3 space-y-2 rounded-xl border bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Choose every option that applies
                    </p>
                    {DELIVERY_OPTIONS.filter(
                      (option) => option.value !== 'multiple',
                    ).map((option) => {
                      const value = option.value as ServiceDeliveryOption;
                      const checked = deliveryOptions.includes(value);
                      return (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMultipleOption(value)}
                            className="h-4 w-4 accent-[#f48c25]"
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer action */}
          <FormField
            control={control}
            name="customerAction"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Customer Action <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>
                  What should happen when a customer views this service?
                </FormDescription>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CUSTOMER_ACTIONS.map((option) => {
                    const selected = field.value === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                          selected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            selected
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            {option.label}
                          </span>
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Working days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="w-5 h-5 text-primary" />
            Working Days & Hours
          </CardTitle>
          <CardDescription>
            Let customers know when the service is available. You can leave this
            as the default and update it later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedule.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No working days have been configured yet.
            </p>
          )}
          {schedule.map((day, index) => (
            <div
              key={String(day.day)}
              className={cn(
                'flex flex-col gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center',
                day.enabled ? 'bg-white' : 'bg-gray-50 opacity-75',
              )}
            >
              <div className="flex items-center justify-between gap-4 sm:w-40">
                <span
                  className={cn(
                    'text-sm font-bold capitalize',
                    day.enabled ? 'text-gray-900' : 'text-gray-400',
                  )}
                >
                  {DAY_LABELS[String(day.day).toLowerCase()] ?? day.day}
                </span>
                <Switch
                  checked={Boolean(day.enabled)}
                  onCheckedChange={(checked) =>
                    updateSchedule(index, { enabled: checked })
                  }
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="time"
                  value={day.startTime ?? '09:00'}
                  disabled={!day.enabled}
                  onChange={(e) =>
                    updateSchedule(index, { startTime: e.target.value })
                  }
                  className="h-9 flex-1"
                />
                <span className="text-gray-400">–</span>
                <Input
                  type="time"
                  value={day.endTime ?? '17:00'}
                  disabled={!day.enabled}
                  onChange={(e) =>
                    updateSchedule(index, { endTime: e.target.value })
                  }
                  className="h-9 flex-1"
                />
              </div>
            </div>
          ))}
          <FormMessage />
        </CardContent>
      </Card>

      {/* Booking instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-primary" />
            Appointment Arrangements
          </CardTitle>
          <CardDescription>
            Tell customers how appointments are arranged and any instructions
            they need before booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="appointmentArrangements"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Appointment Arrangements{' '}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. We confirm appointments within 24 hours and send a reminder the day before."
                    {...field}
                    value={field.value ?? ''}
                    className="min-h-[90px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="bookingInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Booking Instructions{' '}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Please provide access details and any parking information when booking."
                    {...field}
                    value={field.value ?? ''}
                    className="min-h-[90px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="availabilityNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Additional Availability Notes{' '}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Emergency call-outs are available on weekends."
                    {...field}
                    value={field.value ?? ''}
                    className="min-h-[90px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
