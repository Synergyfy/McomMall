'use client';

import React, { useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { AlertCircle, ExternalLink, ImagePlus, Store } from 'lucide-react';
import {
  getBusinessTaxonomy,
  pickCentralBusiness,
} from '@/lib/central-business';
import { useGetUserListings } from '@/service/listings/hook';
import MultiMediaUpload from '@/components/dashboard/media/MultiMediaUpload';

const CENTRAL_BUSINESS_URL = `${
  process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000'
}/dashboard/business-profile`;

function ClassificationItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold">{value || '—'}</span>
    </div>
  );
}

export function Step1BasicInfo() {
  const form = useFormContext();
  const currentBusinessId = form.watch('businessId');
  const sectorValue = form.watch('sector');
  const categoryValue = form.watch('category');
  const media = (form.watch('media') ?? []) as Array<File | string>;

  const { data: listings, isLoading: isLoadingListings } = useGetUserListings(
    1,
    100,
  );

  // Every merchant has one MCOM Central business. Services can be added even
  // if the business has only sold products so far; the API adds the service
  // listing type automatically on first publish.
  const businesses = useMemo(() => {
    if (!listings?.data) return [];
    return listings.data.filter(
      (listing: any) => listing.id && listing.id.trim() !== '',
    );
  }, [listings]);

  const business = pickCentralBusiness(businesses as Array<any>) as any;
  const businessTaxonomy = getBusinessTaxonomy(business);

  const existingImages = useMemo(
    () => media.filter((item): item is string => typeof item === 'string'),
    [media],
  );
  const existingFiles = useMemo(
    () => media.filter((item): item is File => typeof item !== 'string'),
    [media],
  );

  useEffect(() => {
    if (isLoadingListings || !business) return;

    if (currentBusinessId !== business.id) {
      form.setValue('businessId', business.id, { shouldValidate: true });
    }

    // Sector, category and sub-category are owned by MCOM Central. Mirror them
    // onto the service so merchants never re-enter their business taxonomy.
    const taxonomy = getBusinessTaxonomy(business as any);
    const sector = taxonomy.sectorName || taxonomy.sectorId;
    if (sector && sectorValue !== sector) {
      form.setValue('sector', sector, { shouldValidate: true });
    }
    if (taxonomy.categoryName && categoryValue !== taxonomy.categoryName) {
      form.setValue('category', taxonomy.categoryName, {
        shouldValidate: true,
      });
    }
    if (taxonomy.subCategoryName) {
      form.setValue('subcategory', taxonomy.subCategoryName, {
        shouldValidate: true,
      });
    }
  }, [
    isLoadingListings,
    business,
    currentBusinessId,
    sectorValue,
    categoryValue,
    form,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="gap-4 overflow-hidden py-5 shadow-sm sm:gap-6 sm:py-6">
        <CardHeader className="px-4 pb-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Store className="w-5 h-5 shrink-0 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Introduce your service. It will be attached to your MCOM Central
            business automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Attached business (owned by MCOM Central Hub) */}
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Store className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Adding this service to your MCOM Central business
              </p>
              <p className="truncate text-sm font-semibold">
                {business?.businessName || 'Your registered business'}
              </p>
            </div>
          </div>

          {!isLoadingListings && !business && (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                No business profile found
              </div>
              <p className="text-xs">
                Your service must belong to the business registered with MCOM
                Central. Complete your business profile to continue.
              </p>
              <a
                href={CENTRAL_BUSINESS_URL}
                className="inline-flex items-center gap-1 text-xs font-semibold underline"
              >
                Open MCOM Central business profile
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Service Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Service Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Professional Plumbing Services"
                    {...field}
                    value={field.value ?? ''}
                    className="py-6 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business classification (owned by MCOM Central Hub) */}
          <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Store className="size-4" />
                </span>
                <p className="text-sm font-semibold">Business classification</p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Managed by MCOM Central
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Sector, category and sub-category are taken from your business
              profile so services stay consistent with MCOM Central.
            </p>
            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-background px-4 py-3 sm:grid-cols-3">
              <ClassificationItem
                label="Sector"
                value={businessTaxonomy.sectorName}
              />
              <ClassificationItem
                label="Category"
                value={businessTaxonomy.categoryName}
              />
              <ClassificationItem
                label="Sub-category"
                value={businessTaxonomy.subCategoryName}
              />
            </div>
            {(!sectorValue || !categoryValue) && (
              <div className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span>
                  This service will inherit an incomplete classification. Add
                  the missing details to your business profile in MCOM Central.
                </span>
                <a
                  href={CENTRAL_BUSINESS_URL}
                  className="inline-flex items-center gap-1 font-semibold text-amber-900 underline"
                >
                  Update business profile in MCOM Central
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Short Description */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Short Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="A brief introduction to the service"
                    {...field}
                    value={field.value ?? ''}
                    className="py-6"
                  />
                </FormControl>
                <FormDescription>
                  This appears in search results and service cards.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Full Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain what the service includes, what customers can expect and its benefits."
                    {...field}
                    value={field.value ?? ''}
                    className="min-h-[140px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service Images */}
          <FormField
            control={form.control}
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-semibold">
                  <ImagePlus className="h-4 w-4 text-primary" />
                  Service Images <span className="text-red-500">*</span>
                </FormLabel>
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
                    {existingImages.map((url) => (
                      <div
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-lg border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="Service"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() =>
                            field.onChange(media.filter((item) => item !== url))
                          }
                          className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-base font-bold leading-none text-white shadow-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <FormControl>
                  <MultiMediaUpload
                    initialFiles={existingFiles}
                    onMediaChange={(files) =>
                      field.onChange([...existingImages, ...files])
                    }
                    maxSize={30 * 1024 * 1024}
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 5 high-quality images that represent the service.
                  Max file size: 30MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
