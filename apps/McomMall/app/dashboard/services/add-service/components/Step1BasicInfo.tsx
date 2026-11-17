'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings, Check, ChevronsUpDown, HelpCircle, X, Store, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { UserListing } from '@/service/listings/types';
import { useGetUserListings } from '@/service/listings/hook';
import { getBusinessTaxonomy, pickCentralBusiness } from '@/lib/central-business';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const CENTRAL_BUSINESS_URL = `${process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000'}/dashboard/business-profile`;

function ClassificationItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold">{value || '—'}</span>
    </div>
  );
}

const AUDIENCE_OPTIONS = [
  "Families", "Seniors", "Students", "Professionals", "Couples", "Children", "Business Owners", "Everyone"
];

const COMMON_TAGS = [
  "Reliable", "Fast", "Affordable", "Premium", "Eco-friendly", "Expert", "Licensed", "Insured", "24/7 Service"
];

export function Step1BasicInfo() {
  const router = useRouter();
  const form = useFormContext();
  const currentBusinessId = form.watch('businessId');
  const sectorValue = form.watch('sector');
  const categoryValue = form.watch('category');
  const subCategoryValue = form.watch('subcategory');

  const { data: listings, isLoading: isLoadingListings } = useGetUserListings(1, 100);

  const [audienceOpen, setAudienceOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [showNoBusinessDialog, setShowNoBusinessDialog] = useState(false);

  const businesses = useMemo(() => {
    if (!listings?.data) return [];
    return listings.data.filter((l: UserListing) =>
      l.id && l.id.trim() !== '' &&
      l.listingType.some(type => type.toLowerCase() === 'service')
    );
  }, [listings]);

  useEffect(() => {
    if (!isLoadingListings && businesses.length === 0) {
      setShowNoBusinessDialog(true);
    }
  }, [isLoadingListings, businesses.length]);

  // Every user has one MCOM Central business. Attach services to it
  // automatically instead of asking them to pick a listing.
  const business = pickCentralBusiness(businesses);
  const businessTaxonomy = getBusinessTaxonomy(business as any);

  useEffect(() => {
    const business = pickCentralBusiness(businesses);
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
      form.setValue('category', taxonomy.categoryName, { shouldValidate: true });
    }
    if (
      taxonomy.subCategoryName &&
      subCategoryValue !== taxonomy.subCategoryName
    ) {
      form.setValue('subcategory', taxonomy.subCategoryName, { shouldValidate: true });
    }
  }, [
    isLoadingListings,
    businesses,
    currentBusinessId,
    sectorValue,
    categoryValue,
    subCategoryValue,
    form,
  ]);

  const toggleSelection = (fieldName: string, value: string) => {
    const currentValues = form.getValues(fieldName)?.split(',').map((v: string) => v.trim()).filter(Boolean) || [];
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v: string) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    form.setValue(fieldName, newValues.join(', '));
  };

  const removeValue = (fieldName: string, value: string) => {
    const currentValues = form.getValues(fieldName)?.split(',').map((v: string) => v.trim()).filter(Boolean) || [];
    const newValues = currentValues.filter((v: string) => v !== value);
    form.setValue(fieldName, newValues.join(', '));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Provide the fundamental details of your service. It will be attached to your MCOM Central business automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Service Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">
                    Service Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter a clear, descriptive name for your service.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input placeholder="e.g. Professional House Cleaning" {...field} className="py-6 text-base" />
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
              Sector, category and sub-category are taken from your business profile so
              services stay consistent with MCOM Central.
            </p>
            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-background px-4 py-3 sm:grid-cols-3">
              <ClassificationItem label="Sector" value={businessTaxonomy.sectorName} />
              <ClassificationItem label="Category" value={businessTaxonomy.categoryName} />
              <ClassificationItem
                label="Sub-category"
                value={businessTaxonomy.subCategoryName}
              />
            </div>
            {(!sectorValue || !categoryValue) && (
              <div className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span>
                  This service will inherit an incomplete classification. Add the missing
                  details to your business profile in MCOM Central.
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
            {form.formState.errors.sector?.message && (
              <p className="text-xs text-red-600">
                {String(form.formState.errors.sector.message)}
              </p>
            )}
          </div>

          {/* Short Description */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">Short Description</FormLabel>
                  <span className="text-xs text-muted-foreground">(Optional) - Brief catchphrase for search results.</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      A short summary (max 150 chars) shown in listings.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input placeholder="e.g. Expert cleaning for busy homes" {...field} maxLength={150} className="text-sm" />
                </FormControl>
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
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">Full Description</FormLabel>
                  <span className="text-xs text-muted-foreground">(Optional) - Detailed explanation of what you offer.</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Provide all the details customers need to know.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe your service in detail..."
                    className="min-h-[120px] text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Audience & Tags (Dropdowns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FormLabel className="text-base font-semibold">Target Audience</FormLabel>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Who is this service primarily for?
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover open={audienceOpen} onOpenChange={setAudienceOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-auto min-h-[48px] py-2 px-3"
                        >
                          <div className="flex flex-wrap gap-1">
                            {field.value ? field.value.split(',').map((v: string) => v.trim()).filter(Boolean).map((v: string) => (
                              <Badge key={v} variant="secondary" className="flex items-center gap-1">
                                {v}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue("targetAudience", v);
                                  }}
                                />
                              </Badge>
                            )) : <span className="text-muted-foreground">Select audience...</span>}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search audience..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {AUDIENCE_OPTIONS.map((option) => (
                              <CommandItem
                                key={option}
                                onSelect={() => toggleSelection("targetAudience", option)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.split(',').map((v: string) => v.trim()).includes(option)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FormLabel className="text-base font-semibold">Tags</FormLabel>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Add keywords to help customers find your service.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-auto min-h-[48px] py-2 px-3"
                        >
                          <div className="flex flex-wrap gap-1">
                            {field.value ? field.value.split(',').map((v: string) => v.trim()).filter(Boolean).map((v: string) => (
                              <Badge key={v} variant="secondary" className="flex items-center gap-1">
                                {v}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue("tags", v);
                                  }}
                                />
                              </Badge>
                            )) : <span className="text-muted-foreground">Select tags...</span>}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {COMMON_TAGS.map((tag) => (
                              <CommandItem
                                key={tag}
                                onSelect={() => toggleSelection("tags", tag)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.split(',').map((v: string) => v.trim()).includes(tag)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* No Business Found Dialog */}
      <AlertDialog open={showNoBusinessDialog} onOpenChange={setShowNoBusinessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">No Service Business Found</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed">
              Your business profile is managed in MCOM Central. You need a <span className="font-semibold">Service</span> type business profile there before you can add a service.
              <br /><br />
              Update your business profile in MCOM Central so its listing type includes <span className="font-semibold">Service</span>, then sign back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push('/dashboard/services')}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000'}/getstarted/business?source=mcommall`}>
              Open MCOM Central
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
