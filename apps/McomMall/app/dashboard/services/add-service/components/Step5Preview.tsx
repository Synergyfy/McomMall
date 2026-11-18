'use client';

import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Globe2,
  HelpCircle,
  MapPin,
  MessageSquare,
  Pencil,
  PhoneCall,
  Store,
} from 'lucide-react';
import { pickCentralBusiness } from '@/lib/central-business';
import { useGetUserListings } from '@/service/listings/hook';
import {
  CUSTOMER_ACTION_LABELS,
  DELIVERY_OPTION_LABELS,
  getServicePriceLabel,
} from '@/lib/service-pricing';
import type {
  CustomerAction,
  ServiceDeliveryOption,
} from '@/service/services/types';
import { cn } from '@/lib/utils';

interface Step5PreviewProps {
  onEditStep: (step: number) => void;
}

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function EditButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="justify-start gap-2 border-gray-200 text-xs font-semibold sm:text-sm"
    >
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

export function Step5Preview({ onEditStep }: Step5PreviewProps) {
  const { watch } = useFormContext();
  const values = watch();
  const { data: listings } = useGetUserListings(1, 100);
  const business = pickCentralBusiness(
    (listings?.data ?? []) as Array<any>,
  ) as any;
  const location = (business as any)?.location;

  const media = (values.media ?? []) as Array<File | string>;
  const objectUrls = useMemo(
    () =>
      media
        .filter((item): item is File => typeof item !== 'string')
        .map((file) => URL.createObjectURL(file)),
    [media],
  );

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const images = useMemo(() => {
    let fileIndex = 0;
    return media.map((item) => {
      if (typeof item === 'string') return item;
      const url = objectUrls[fileIndex] ?? '';
      fileIndex += 1;
      return url;
    });
  }, [media, objectUrls]);

  const deliveryOptions = (values.deliveryOptions ??
    []) as ServiceDeliveryOption[];
  const customerAction = (values.customerAction ?? 'bookNow') as CustomerAction;
  const schedule = (values.availability?.schedule ?? []) as Array<
    Record<string, any>
  >;
  const enabledDays = schedule.filter((day) => day.enabled);
  const faqs = (values.faqs ?? []).filter(
    (faq: any) => faq?.question?.trim() && faq?.answer?.trim(),
  );

  const priceLabel = getServicePriceLabel({
    pricingType: values.pricingType,
    price: values.price,
    priceMax: values.priceMax,
    isQuoteModel: values.pricingType === 'quote',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Preview your service
          </CardTitle>
          <CardDescription>
            This is how customers will see your service on Mcom Mall. Review
            each section, make any changes, then submit when you are happy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <EditButton
              label="Edit Basic Information"
              onClick={() => onEditStep(1)}
            />
            <EditButton label="Edit Pricing" onClick={() => onEditStep(2)} />
            <EditButton
              label="Edit Booking & Availability"
              onClick={() => onEditStep(3)}
            />
            <EditButton
              label="Edit Additional Information"
              onClick={() => onEditStep(4)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer-facing preview */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[260px] bg-gray-100">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0]}
                alt={values.name || 'Service preview'}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-gray-400">
                Service image preview
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600 shadow-sm">
              Service
            </span>
          </div>

          <div className="space-y-5 p-6 md:p-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                {values.name || 'Your service name'}
              </h2>
              {values.shortDescription && (
                <p className="text-sm text-gray-600">
                  {values.shortDescription}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Pricing
              </p>
              <p className="text-3xl font-black text-orange-600">
                {priceLabel}
              </p>
            </div>

            {deliveryOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Service Delivery
                </p>
                <div className="flex flex-wrap gap-2">
                  {deliveryOptions.map((option) => (
                    <Badge
                      key={option}
                      variant="outline"
                      className="border-orange-100 bg-orange-50 text-orange-700"
                    >
                      {DELIVERY_OPTION_LABELS[option]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Booking
              </p>
              <Button
                type="button"
                disabled
                className="w-full bg-orange-600 py-6 text-base font-bold text-white hover:bg-orange-600 disabled:opacity-100"
              >
                {CUSTOMER_ACTION_LABELS[customerAction] ?? 'Book Now'}
              </Button>
            </div>

            {business && (
              <div className="flex items-center gap-3 rounded-xl border bg-gray-50 px-3 py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
                  <Store className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {business.businessName}
                  </p>
                  {location && (
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {[location.city, location.postcode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 border-t bg-gray-50 p-3 sm:grid-cols-6">
            {images.slice(1, 7).map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`Service preview ${index + 2}`}
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <div className="space-y-8 border-t p-6 md:p-8">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {values.description || 'No description provided yet.'}
            </p>
          </section>

          {enabledDays.length > 0 && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Calendar className="h-5 w-5 text-orange-500" />
                Availability
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[...enabledDays]
                  .sort(
                    (a, b) =>
                      DAY_ORDER.indexOf(String(a.day).toLowerCase()) -
                      DAY_ORDER.indexOf(String(b.day).toLowerCase()),
                  )
                  .map((day) => (
                    <div
                      key={String(day.day)}
                      className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm"
                    >
                      <span className="font-semibold capitalize text-gray-800">
                        {day.day}
                      </span>
                      <span className="text-xs font-bold text-orange-600">
                        {day.startTime} – {day.endTime}
                      </span>
                    </div>
                  ))}
              </div>
              {values.appointmentArrangements && (
                <p className="text-sm text-gray-600">
                  {values.appointmentArrangements}
                </p>
              )}
              {values.availabilityNotes && (
                <p className="text-sm text-gray-600">
                  {values.availabilityNotes}
                </p>
              )}
            </section>
          )}

          {values.bookingInstructions && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Booking Instructions
              </h3>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {values.bookingInstructions}
              </p>
            </section>
          )}

          {(values.duration || values.serviceConditions) && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Clock className="h-5 w-5 text-orange-500" />
                Additional Information
              </h3>
              {values.duration && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Duration:</span>{' '}
                  {Number(values.duration)} minutes
                </p>
              )}
              {values.serviceConditions && (
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  <span className="font-semibold">Conditions:</span>{' '}
                  {values.serviceConditions}
                </p>
              )}
            </section>
          )}

          {faqs.length > 0 && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <HelpCircle className="h-5 w-5 text-orange-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {faqs.map((faq: any) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border bg-white p-4"
                  >
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
                      {faq.question}
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" /> Published on Mcom Mall
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3.5 w-3.5" /> Customers use the action you
              selected
            </span>
            <span
              className={cn(
                'flex items-center gap-1 font-semibold text-emerald-600',
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Business details from
              MCOM Central
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}
