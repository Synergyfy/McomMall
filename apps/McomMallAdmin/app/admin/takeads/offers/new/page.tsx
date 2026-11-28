'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Globe2,
  Info,
  Link2,
  Loader2,
  Save,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { cn } from '@/lib/utils';
import {
  fetchCategories,
  fetchSectors,
  fetchSubcategories,
} from '@/app/admin/content/api';
import { Category, Sector, Subcategory } from '@/app/admin/types';
import {
  useCreateTakeadsOffer,
  useGetTakeadsCoupons,
  useGetTakeadsMerchants,
  useResolveTakeadsLink,
  useTakeadsOfferAction,
} from '@/service/takeads/hook';
import {
  CreateTakeadsOfferPayload,
  ResolveTakeadsLinkResult,
  TakeadsOfferType,
  TakeadsSourceType,
  TakeadsVisibility,
} from '@/service/takeads/types';
import PlanVariantMultiSelect from '@/app/admin/takeads/components/PlanVariantMultiSelect';

const UK_COUNTRY_CODE = 'GB';
const OFFER_CURRENCY = 'GBP';

// Store the stable MCOM Central Hub ID when present, matching the other admin
// catalogue forms. The local ID is only a fallback for unmapped rows.
const taxonomyValue = (row: { id: string; centralId?: string | null }) =>
  row.centralId || row.id;

function FieldLabel({ children, hint }: { children: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`About ${children}`}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

interface TaxonomyOption {
  value: string;
  label: string;
  searchText: string;
}

interface TaxonomyComboboxProps {
  label: string;
  hint: string;
  value: string | undefined;
  options: TaxonomyOption[];
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function TaxonomyCombobox({
  label,
  hint,
  value,
  options,
  placeholder,
  loading,
  disabled,
  onChange,
}: TaxonomyComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-label={label}
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={cn('truncate', !selected && 'text-slate-500')}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}…`} />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Loading taxonomy…' : 'No matching taxonomy found.'}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.searchText}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        option.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && !selected && (
        <p className="text-xs text-amber-700">
          Current value ({value}) is not in the synced Central Hub taxonomy.
        </p>
      )}
    </div>
  );
}

function NewTakeadsOfferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const create = useCreateTakeadsOffer();
  const approve = useTakeadsOfferAction();
  const resolveLink = useResolveTakeadsLink();
  const { data: merchants, isLoading: merchantsLoading } =
    useGetTakeadsMerchants({ status: 'accepted', limit: 200 });
  const { data: coupons, isLoading: couponsLoading } = useGetTakeadsCoupons({
    approvalStatus: 'approved',
    limit: 200,
  });
  const { data: sectors = [], isLoading: sectorsLoading } = useQuery({
    queryKey: ['takeads-offer-taxonomy-sectors'],
    queryFn: fetchSectors,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['takeads-offer-taxonomy-categories'],
    queryFn: fetchCategories,
  });

  const [form, setForm] = useState<CreateTakeadsOfferPayload>({
    sourceType: 'product_url',
    offerType: 'product',
    countryCode: UK_COUNTRY_CODE,
    currency: OFFER_CURRENCY,
    visibility: 'public',
    allowedPlanVariantIds: [],
    isFeatured: false,
  });
  const [resolution, setResolution] =
    useState<ResolveTakeadsLinkResult | null>(null);

  const update = <K extends keyof CreateTakeadsOfferPayload>(
    key: K,
    value: CreateTakeadsOfferPayload[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const clearResolution = () => {
    setResolution(null);
    setForm((current) => ({
      ...current,
      resolvedTrackingUrl: undefined,
      subId: undefined,
    }));
  };

  // Deep links from the merchant and coupon pages. useSearchParams is a client
  // hook, so the whole form is wrapped in Suspense by the default export.
  useEffect(() => {
    const merchantId = searchParams?.get('merchantId');
    const couponId = searchParams?.get('coupon');
    if (!merchantId && !couponId) return;
    setForm((current) => ({
      ...current,
      ...(merchantId
        ? { sourceType: 'product_url' as const, externalMerchantId: merchantId }
        : {}),
      ...(couponId
        ? { sourceType: 'coupon' as const, externalCouponId: couponId }
        : {}),
    }));
  }, [searchParams]);

  useEffect(() => {
    if (!form.externalMerchantId || !merchants?.data.length) return;
    const merchant = merchants.data.find(
      (item) => item.externalMerchantId === form.externalMerchantId,
    );
    if (!merchant) return;
    setForm((current) => ({
      ...current,
      merchantName: current.merchantName || merchant.name,
      mcomSectorId: current.mcomSectorId || merchant.mcomSectorId || undefined,
      mcomCategoryId:
        current.mcomCategoryId || merchant.mcomCategoryId || undefined,
      mcomSubCategoryId:
        current.mcomSubCategoryId || merchant.mcomSubCategoryId || undefined,
    }));
  }, [form.externalMerchantId, merchants]);

  const selectedSector = sectors.find(
    (sector: Sector) => taxonomyValue(sector) === form.mcomSectorId,
  );
  const sectorCategories = useMemo(
    () =>
      selectedSector
        ? categories.filter(
            (category: Category) => category.sectorId === selectedSector.id,
          )
        : categories,
    [categories, selectedSector],
  );
  const selectedCategory = sectorCategories.find(
    (category: Category) => taxonomyValue(category) === form.mcomCategoryId,
  );
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery(
    {
      queryKey: ['takeads-offer-taxonomy-subcategories', selectedCategory?.id],
      queryFn: () => fetchSubcategories(selectedCategory!.id),
      enabled: !!selectedCategory?.id,
    },
  );

  const sectorOptions = useMemo(
    () =>
      sectors.map((sector: Sector) => ({
        value: taxonomyValue(sector),
        label: sector.name,
        searchText: `${sector.name} ${sector.centralId ?? ''} ${sector.centralSlug ?? ''}`,
      })),
    [sectors],
  );
  const categoryOptions = useMemo(
    () =>
      sectorCategories.map((category: Category) => ({
        value: taxonomyValue(category),
        label: category.name,
        searchText: `${category.name} ${category.sectorName} ${category.centralId ?? ''} ${category.centralSlug ?? ''}`,
      })),
    [sectorCategories],
  );
  const subcategoryOptions = useMemo(
    () =>
      subcategories.map((subcategory: Subcategory) => ({
        value: taxonomyValue(subcategory),
        label: subcategory.name,
        searchText: `${subcategory.name} ${subcategory.categoryName} ${subcategory.centralId ?? ''} ${subcategory.centralSlug ?? ''}`,
      })),
    [subcategories],
  );

  const isCoupon = form.sourceType === 'coupon';
  const isResolved = Boolean(form.resolvedTrackingUrl && form.subId);
  const selectedCoupon = coupons?.data.find(
    (coupon) => coupon.externalCouponId === form.externalCouponId,
  );
  // Coupon offers inherit their tracking link from the approved coupon. If the
  // source did not provide one, TakeAds cannot approve the offer.
  const canApproveCoupon = !isCoupon || !!selectedCoupon?.trackingLink;
  const audienceReady =
    form.visibility !== 'plan_only' ||
    (form.allowedPlanVariantIds?.length ?? 0) > 0;
  const isCreating = create.isPending || approve.isPending;

  const changeSourceType = (value: TakeadsSourceType) => {
    clearResolution();
    setForm((current) => ({ ...current, sourceType: value }));
  };

  const selectSector = (value: string) =>
    setForm((current) => ({
      ...current,
      mcomSectorId: value,
      mcomCategoryId: undefined,
      mcomSubCategoryId: undefined,
    }));

  const selectCategory = (value: string) =>
    setForm((current) => ({
      ...current,
      mcomCategoryId: value,
      mcomSubCategoryId: undefined,
    }));

  const selectSubCategory = (value: string) =>
    update('mcomSubCategoryId', value);

  const generateLink = () => {
    if (!form.destinationUrl || !form.externalMerchantId) return;
    resolveLink.mutate(
      {
        destinationUrl: form.destinationUrl,
        externalMerchantId: form.externalMerchantId,
        externalProgramId: form.externalProgramId || undefined,
        placement: 'marketplace',
      },
      {
        onSuccess: (result) => {
          setResolution(result);
          setForm((current) => ({
            ...current,
            resolvedTrackingUrl: result.resolvedTrackingUrl,
            subId: result.subId,
            images:
              current.images?.length || !result.imageUrl
                ? current.images
                : [result.imageUrl],
          }));
        },
      },
    );
  };

  const submit = async (approveAfterCreate = false) => {
    try {
      const offer = await create.mutateAsync({
        ...form,
        countryCode: UK_COUNTRY_CODE,
        currency: OFFER_CURRENCY,
      });
      if (approveAfterCreate) {
        try {
          await approve.mutateAsync({ id: offer.id, action: 'approve' });
        } catch {
          // The approval hook already shows the reason. Keep the created offer
          // in the list so the admin can resolve or review it there.
        }
      }
      router.push('/admin/takeads/offers');
    } catch {
      // The create hook already shows the reason; stay on the form.
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-sky-50 p-5 shadow-sm sm:p-7">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="mt-1 shrink-0 rounded-xl bg-white"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
            TakeAds · Offer setup
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            New TakeAds Offer
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Add an approved merchant product or coupon, then prepare it for the
            MCOM storefront. Approval and publication remain under your control.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-sky-200 bg-white px-3 py-1 text-sky-800"
            >
              <Globe2 className="h-3.5 w-3.5" />
              UK marketplace
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-700"
            >
              Prices in GBP (£)
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <CardTitle className="text-base font-bold text-slate-900">
                1. Approved source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-6">
              <div className="space-y-2">
                <FieldLabel hint="Choose whether this offer comes from an approved merchant product URL or an already approved TakeAds coupon.">
                  Source type
                </FieldLabel>
                <Select
                  value={form.sourceType}
                  onValueChange={(value) =>
                    changeSourceType(value as TakeadsSourceType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_url">
                      Product / destination URL
                    </SelectItem>
                    <SelectItem value="coupon">Imported coupon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCoupon ? (
                <div className="space-y-2">
                  <FieldLabel hint="Only coupons already approved in TakeAds can become offers. MCOM never invents a coupon code or discount.">
                    Approved coupon
                  </FieldLabel>
                  <Select
                    value={form.externalCouponId ?? ''}
                    onValueChange={(value) =>
                      update('externalCouponId', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          couponsLoading
                            ? 'Loading coupons…'
                            : 'Select an approved coupon'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(coupons?.data ?? []).map((coupon) => (
                        <SelectItem
                          key={coupon.id}
                          value={coupon.externalCouponId}
                        >
                          {coupon.name}
                          {coupon.code ? ` (${coupon.code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!couponsLoading && !coupons?.data.length && (
                    <p className="text-xs text-amber-700">
                      No approved coupons yet. Approve a coupon first, or use a
                      product URL from an accepted merchant.
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    An approved coupon already has a source tracking link; no
                    separate resolution step is needed.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <FieldLabel hint="Only merchants you have reviewed and accepted in MCOM can supply affiliate products.">
                      Accepted merchant
                    </FieldLabel>
                    <Select
                      value={form.externalMerchantId ?? ''}
                      onValueChange={(value) => {
                        clearResolution();
                        const merchant = merchants?.data.find(
                          (item) => item.externalMerchantId === value,
                        );
                        setForm((current) => ({
                          ...current,
                          externalMerchantId: value,
                          merchantName: merchant?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            merchantsLoading
                              ? 'Loading merchants…'
                              : 'Select an accepted merchant'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(merchants?.data ?? []).map((merchant) => (
                          <SelectItem
                            key={merchant.id}
                            value={merchant.externalMerchantId}
                          >
                            {merchant.name} —{' '}
                            {merchant.defaultDomain ||
                              merchant.externalMerchantId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!merchantsLoading && !merchants?.data.length && (
                      <p className="text-xs text-amber-700">
                        No accepted merchants yet.{' '}
                        <Link
                          href="/admin/takeads/merchants"
                          className="font-semibold underline"
                        >
                          Review merchants
                        </Link>{' '}
                        before adding products.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FieldLabel hint="The merchant product page MCOM is authorised to promote. TakeAds must resolve it before the offer can be saved.">
                      Destination URL
                    </FieldLabel>
                    <Input
                      value={form.destinationUrl ?? ''}
                      onChange={(event) => {
                        clearResolution();
                        update('destinationUrl', event.target.value);
                      }}
                      placeholder="https://merchant.example/product/123"
                    />
                    <p className="text-xs text-slate-500">
                      Use only a URL MCOM is authorised to promote. Resolution
                      happens before the offer is saved.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel hint="Optional TakeAds programme identifier. Leave blank and TakeAds will use the eligible programme for this merchant.">
                        TakeAds programme ID (optional)
                      </FieldLabel>
                      <Input
                        value={form.externalProgramId ?? ''}
                        onChange={(event) => {
                          clearResolution();
                          update('externalProgramId', event.target.value);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel hint="Display label for the merchant. It is prefilled from the accepted merchant record and can be adjusted here.">
                        Merchant name
                      </FieldLabel>
                      <Input
                        value={form.merchantName ?? ''}
                        onChange={(event) =>
                          update('merchantName', event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          2. Generate affiliate tracking link
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          TakeAds checks eligibility and returns a subId for
                          reporting.
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={generateLink}
                            disabled={
                              resolveLink.isPending ||
                              !form.externalMerchantId ||
                              !form.destinationUrl
                            }
                          >
                            {resolveLink.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Link2 className="mr-2 h-4 w-4" />
                            )}
                            Generate link
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          Asks TakeAds for an eligible tracking URL and an
                          attribution subId. No offer is created by this step.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {isResolved ? (
                      <div className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                        <p className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Link resolved
                        </p>
                        <p className="break-all font-mono">
                          {form.resolvedTrackingUrl}
                        </p>
                        <p>subId: {form.subId}</p>
                        {resolution?.imageUrl && (
                          <p>Source image attached from TakeAds.</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-amber-700">
                        Resolve the URL before saving. If TakeAds rejects it, no
                        draft is created.
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <CardTitle className="text-base font-bold text-slate-900">
                3. MCOM presentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-6">
              <div className="space-y-2">
                <FieldLabel hint="The title shown on the storefront card. Coupons can leave this blank to use the approved coupon name.">
                  Display title
                </FieldLabel>
                <Input
                  value={form.title ?? ''}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder={isCoupon ? 'Optional — uses the coupon name' : 'Offer title'}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel hint="A brief source-supported summary shown on cards. Do not add claims that the merchant or TakeAds did not supply.">
                  Short description
                </FieldLabel>
                <Input
                  value={form.shortDescription ?? ''}
                  onChange={(event) =>
                    update('shortDescription', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <FieldLabel hint="Longer source-supported copy for the offer detail view. Leave blank if the source has no additional description.">
                  Description
                </FieldLabel>
                <Textarea
                  rows={4}
                  value={form.description ?? ''}
                  onChange={(event) => update('description', event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel hint="How MCOM presents this offer: product, service, coupon or deal.">
                    Offer type
                  </FieldLabel>
                  <Select
                    value={form.offerType ?? 'product'}
                    onValueChange={(value) =>
                      update('offerType', value as TakeadsOfferType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="coupon">Coupon</SelectItem>
                      <SelectItem value="deal">Deal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel hint="Internal label for grouping offers in reports. Shoppers do not see this value.">
                    Campaign label
                  </FieldLabel>
                  <Input
                    value={form.campaignLabel ?? ''}
                    onChange={(event) =>
                      update('campaignLabel', event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel hint="Enter the source-provided price in pounds (e.g. 12.99). Leave blank when the source provides no price.">
                    Price (in pounds)
                  </FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-500">
                      £
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price ?? ''}
                      onChange={(event) =>
                        update(
                          'price',
                          event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        )
                      }
                      placeholder="Leave blank if not supplied"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel hint="Only source-provided terms belong here. MCOM does not generate or alter coupon conditions.">
                  Terms / conditions
                </FieldLabel>
                <Textarea
                  rows={3}
                  value={form.termsAndConditions ?? ''}
                  onChange={(event) =>
                    update('termsAndConditions', event.target.value)
                  }
                  placeholder="Only source-supported terms"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <CardTitle className="text-base font-bold text-slate-900">
                4. MCOM taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-6">
              <p className="text-xs text-slate-500">
                Sectors, categories and subcategories are synced from MCOM
                Central Hub. Type to search within each dropdown.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <TaxonomyCombobox
                  label="Sector"
                  hint="Central Hub sector. Type to search. Changing it clears the category and subcategory."
                  value={form.mcomSectorId}
                  options={sectorOptions}
                  placeholder={
                    sectorsLoading ? 'Loading sectors…' : 'Select sector'
                  }
                  loading={sectorsLoading}
                  onChange={selectSector}
                />
                <TaxonomyCombobox
                  label="Category"
                  hint="Central Hub category filtered by the selected sector. Type to search; changing it clears the subcategory."
                  value={form.mcomCategoryId}
                  options={categoryOptions}
                  placeholder={
                    !form.mcomSectorId
                      ? 'Select a sector first'
                      : categoriesLoading
                        ? 'Loading categories…'
                        : 'Select category'
                  }
                  loading={categoriesLoading}
                  disabled={!form.mcomSectorId}
                  onChange={selectCategory}
                />
                <TaxonomyCombobox
                  label="Subcategory"
                  hint="Central Hub subcategory filtered by the selected category. Type to search by name, ID or slug."
                  value={form.mcomSubCategoryId}
                  options={subcategoryOptions}
                  placeholder={
                    !form.mcomCategoryId
                      ? 'Select a category first'
                      : subcategoriesLoading
                        ? 'Loading subcategories…'
                        : 'Select subcategory'
                  }
                  loading={subcategoriesLoading}
                  disabled={!form.mcomCategoryId}
                  onChange={selectSubCategory}
                />
              </div>
              {(form.mcomSectorId ||
                form.mcomCategoryId ||
                form.mcomSubCategoryId) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">
                    Taxonomy saved with this offer
                  </p>
                  <p className="mt-1 break-all font-mono">
                    {[
                      form.mcomSectorId && `sector: ${form.mcomSectorId}`,
                      form.mcomCategoryId && `category: ${form.mcomCategoryId}`,
                      form.mcomSubCategoryId &&
                        `subcategory: ${form.mcomSubCategoryId}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <CardTitle className="text-base font-bold text-slate-900">
                5. Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-6">
              <div className="space-y-2">
                <FieldLabel hint="Public deals appear on the storefront /deals page. Plan-only deals are hidden there and appear only in the signed-in business Marketing dashboard.">
                  Visibility
                </FieldLabel>
                <Select
                  value={form.visibility ?? 'public'}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      visibility: value as TakeadsVisibility,
                      allowedPlanVariantIds:
                        value === 'public' ? [] : current.allowedPlanVariantIds,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public — all shoppers</SelectItem>
                    <SelectItem value="plan_only">
                      Plan-only — selected business plans
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.visibility === 'plan_only' && (
                <PlanVariantMultiSelect
                  value={form.allowedPlanVariantIds ?? []}
                  onChange={(ids) => update('allowedPlanVariantIds', ids)}
                />
              )}
              {form.visibility === 'public' && (
                <p className="text-xs text-slate-500">
                  This offer will be visible to every shopper once it is
                  approved and published.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6">
          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Save offer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.isFeatured ?? false}
                  onCheckedChange={(checked) =>
                    update('isFeatured', checked === true)
                  }
                />
                <FieldLabel hint="Marks the offer for featured placement after approval. It does not publish the offer.">
                  Featured offer
                </FieldLabel>
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-800">
                <p className="flex items-center gap-1 font-semibold">
                  {isCoupon ? (
                    <Ticket className="h-3.5 w-3.5" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5" />
                  )}
                  Approval is separate from publication
                </p>
                <p className="mt-1">
                  Create a pending draft, or create and approve in one step.
                  Publication remains a separate action from the offers list.
                </p>
              </div>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="w-full rounded-xl"
                      onClick={() => submit(false)}
                      disabled={
                        isCreating ||
                        !form.title ||
                        (!isCoupon && !isResolved) ||
                        !audienceReady
                      }
                    >
                      {isCreating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Create pending offer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    Saves an unpublished draft and returns you to the offers
                    list.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full rounded-xl"
                      onClick={() => submit(true)}
                      disabled={
                        isCreating ||
                        !form.title ||
                        (!isCoupon && !isResolved) ||
                        !canApproveCoupon ||
                        !audienceReady
                      }
                    >
                      {isCreating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Create &amp; approve
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    Creates the offer and approves it immediately. It stays
                    unpublished until you publish it from the offers list.
                  </TooltipContent>
                </Tooltip>
                {!canApproveCoupon && (
                  <p className="text-center text-xs text-amber-700">
                    This coupon has no TakeAds tracking link, so it cannot be
                    approved yet.
                  </p>
                )}
                {!audienceReady && (
                  <p className="text-center text-xs text-amber-700">
                    Select at least one plan variant for a plan-only offer.
                  </p>
                )}
              </div>
              <p className="text-center text-xs text-slate-500">
                Both options return you to /admin/takeads/offers.
              </p>
              {!isCoupon && !isResolved && (
                <p className="text-center text-xs text-amber-700">
                  Generate an affiliate link first.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="space-y-2 p-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <Badge variant="outline">National Brand</Badge>
                External merchant offer
              </p>
              <p className="flex items-center gap-2">
                <Badge variant="outline">Coupon / Deal</Badge>
                Coupon-backed offer
              </p>
              <p>
                Do not invent a code, discount, price or expiry. The public card
                only shows source-supported data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewTakeadsOfferPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading offer form…
        </div>
      }
    >
      <NewTakeadsOfferForm />
    </Suspense>
  );
}
