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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Info,
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
} from '../types';

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description: string;
  icon: React.ElementType;
}

const DELIVERY_OPTIONS: Array<ChoiceOption<ServiceDeliveryOption | 'multiple'>> =
  [
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

const CUSTOMER_ACTIONS: Array<ChoiceOption<CustomerAction>> = [
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

/**
 * A native-friendly dropdown that keeps the description of every option
 * visible inside the list and explains the selected choice underneath.
 * Full-width, 48px-tall trigger so it is easy to use on a phone.
 */
function ChoiceSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  label,
}: {
  value?: T | '';
  onChange: (value: T) => void;
  options: Array<ChoiceOption<T>>;
  placeholder: string;
  label: string;
}) {
  const selected = options.find((option) => option.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <>
      <Select
        value={value || undefined}
        onValueChange={(next) => onChange(next as T)}
      >
        <SelectTrigger
          aria-label={label}
          className="h-12 w-full rounded-xl border-2 border-gray-100 bg-white px-3 text-left text-base font-medium shadow-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-11"
        >
          <SelectValue placeholder={placeholder}>
            {selected && (
              <span className="flex min-w-0 items-center gap-2">
                {SelectedIcon && (
                  <SelectedIcon className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="truncate">{selected.label}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80 w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] [&_[data-radix-select-viewport]]:h-auto">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="items-start py-3 pr-9 pl-2"
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-900">
                      {option.label}
                    </span>
                    <span className="whitespace-normal text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selected && (
        <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{selected.description}</span>
        </div>
      )}
    </>
  );
}

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
    <div className="space-y-4 animate-in fade-in duration-500 sm:space-y-6">
      {/* Delivery options */}
      <Card className="gap-4 overflow-hidden py-5 shadow-sm sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            Booking & Availability
          </CardTitle>
          <CardDescription>
            Explain how customers receive the service and what they should do
            next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          <FormField
            control={control}
            name="deliverySelection"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-base font-semibold">
                  Service Delivery <span className="text-red-500">*</span>
                </FormLabel>
                <ChoiceSelect
                  label="Service Delivery"
                  value={field.value}
                  onChange={selectDelivery}
                  options={DELIVERY_OPTIONS}
                  placeholder="Choose how you deliver this service"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {deliverySelection === 'multiple' && (
            <FormField
              control={control}
              name="deliveryOptions"
              render={({ field }) => (
                <FormItem className="space-y-2 rounded-xl border bg-muted/30 p-3 sm:p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Choose every option that applies
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select at least two ways customers can receive this
                      service.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {DELIVERY_OPTIONS.filter(
                      (option) => option.value !== 'multiple',
                    ).map((option) => {
                      const value = option.value as ServiceDeliveryOption;
                      const checked = (
                        (field.value ?? []) as ServiceDeliveryOption[]
                      ).includes(value);
                      return (
                        <label
                          key={value}
                          className={cn(
                            'flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border bg-background px-3 py-2.5 transition-colors',
                            checked
                              ? 'border-primary/40 bg-primary/5'
                              : 'hover:bg-muted/40',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMultipleOption(value)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-[#f48c25]"
                          />
                          <span className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="text-xs leading-relaxed text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Customer action */}
          <FormField
            control={control}
            name="customerAction"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-base font-semibold">
                  Customer Action <span className="text-red-500">*</span>
                </FormLabel>
                <ChoiceSelect
                  label="Customer Action"
                  value={field.value}
                  onChange={field.onChange}
                  options={CUSTOMER_ACTIONS}
                  placeholder="Choose what customers should do next"
                />
                <FormDescription>
                  What should happen when a customer views this service?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Working days */}
      <Card className="gap-4 overflow-hidden py-5 shadow-sm sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
            Working Days & Hours
          </CardTitle>
          <CardDescription>
            Let customers know when the service is available. You can leave this
            as the default and update it later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-4 sm:space-y-3 sm:px-6">
          {schedule.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No working days have been configured yet.
            </p>
          )}
          {schedule.map((day, index) => (
            <div
              key={String(day.day)}
              className={cn(
                'rounded-xl border p-3 transition-colors sm:flex sm:items-center sm:gap-3',
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
                <div className="flex items-center gap-2">
                  {!day.enabled && (
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Closed
                    </span>
                  )}
                  <Switch
                    aria-label={`Toggle ${
                      DAY_LABELS[String(day.day).toLowerCase()] ?? day.day
                    }`}
                    checked={Boolean(day.enabled)}
                    onCheckedChange={(checked) =>
                      updateSchedule(index, { enabled: checked })
                    }
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-1 items-end gap-2 sm:mt-0">
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                    Opens
                  </span>
                  <Input
                    type="time"
                    value={day.startTime ?? '09:00'}
                    disabled={!day.enabled}
                    onChange={(e) =>
                      updateSchedule(index, { startTime: e.target.value })
                    }
                    className="h-11 w-full text-base sm:h-9 sm:text-sm"
                  />
                </div>
                <span className="pb-2.5 text-gray-400">–</span>
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                    Closes
                  </span>
                  <Input
                    type="time"
                    value={day.endTime ?? '17:00'}
                    disabled={!day.enabled}
                    onChange={(e) =>
                      updateSchedule(index, { endTime: e.target.value })
                    }
                    className="h-11 w-full text-base sm:h-9 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          <FormMessage />
        </CardContent>
      </Card>

      {/* Booking instructions */}
      <Card className="gap-4 overflow-hidden py-5 shadow-sm sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-5 w-5 shrink-0 text-primary" />
            Appointment Arrangements
          </CardTitle>
          <CardDescription>
            Tell customers how appointments are arranged and any instructions
            they need before booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
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
