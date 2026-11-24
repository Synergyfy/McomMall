'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  BadgePercent,
  Building2,
  ChevronLeft,
  Eye,
  Image as ImageIcon,
  Link2,
  Loader2,
  Package,
  Save,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  fetchCategories,
  fetchSectors,
  fetchSubcategories,
} from '@/app/admin/content/api';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
  AdminPromotionalOffer,
  CreatePromotionalOfferPayload,
  PromotionalOfferingType,
} from '@/service/promotional-offers/types';

interface PromotionalOfferFormProps {
  offeringType: PromotionalOfferingType;
  initial?: AdminPromotionalOffer;
  isSaving?: boolean;
  onSubmit: (payload: CreatePromotionalOfferPayload) => void;
}

const emptyDefaults = (
  offeringType: PromotionalOfferingType,
): CreatePromotionalOfferPayload => ({
  name: '',
  offeringType,
  sector: '',
  category: '',
  subCategory: '',
  brand: '',
  tags: [],
  shortDescription: '',
  description: '',
  images: [],
  price: undefined,
  salePrice: undefined,
  currency: 'GBP',
  destinationUrl: '',
  affiliateTrackingUrl: '',
  affiliateNetwork: 'awin',
  advertiserId: '',
  advertiserName: '',
  advertiserProgramme: '',
  awinProductId: '',
  commissionRate: 0,
  businessCommissionRate: 0,
  availability: 'all',
  businessIds: [],
  status: 'draft',
  startDate: '',
  endDate: '',
  termsAndConditions: '',
  isFeatured: false,
  displayOrder: 0,
});

export default function PromotionalOfferForm({
  offeringType,
  initial,
  isSaving,
  onSubmit,
}: PromotionalOfferFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<CreatePromotionalOfferPayload>({
      defaultValues: emptyDefaults(offeringType),
    });

  const [businessSearch, setBusinessSearch] = useState('');

  const values = watch();
  const images = values.images ?? [];
  const availability = values.availability ?? 'all';
  const selectedBusinessIds = values.businessIds ?? [];

  const { data: sectors = [] } = useQuery({
    queryKey: ['admin-promotional-sectors'],
    queryFn: fetchSectors,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-promotional-categories'],
    queryFn: fetchCategories,
  });
  const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses(
    { page: 1, limit: 200 },
  );

  const filteredSectors = sectors;
  const selectedSector = useMemo(
    () => sectors.find((sector) => sector.name === values.sector),
    [sectors, values.sector],
  );
  const selectedCategoryId = useMemo(
    () =>
      categories.find((category) => category.name === values.category)?.id,
    [categories, values.category],
  );
  const filteredCategories = useMemo(
    () =>
      selectedSector
        ? categories.filter(
            (category) => category.sectorId === selectedSector.id,
          )
        : categories,
    [categories, selectedSector],
  );
  const { data: subcategories = [] } = useQuery({
    queryKey: ['admin-promotional-subcategories', selectedCategoryId],
    queryFn: () => fetchSubcategories(selectedCategoryId as string),
    enabled: !!selectedCategoryId,
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      ...emptyDefaults(offeringType),
      name: initial.name,
      offeringType: initial.offeringType,
      sector: initial.sector ?? '',
      category: initial.category ?? '',
      subCategory: initial.subCategory ?? '',
      brand: initial.brand ?? '',
      shortDescription: initial.shortDescription ?? '',
      description: initial.description ?? '',
      images: initial.images ?? [],
      tags: initial.tags ?? [],
      currency: initial.currency ?? 'GBP',
      destinationUrl: initial.destinationUrl,
      affiliateTrackingUrl: initial.affiliateTrackingUrl ?? '',
      affiliateNetwork: initial.affiliateNetwork ?? 'awin',
      advertiserId: initial.advertiserId ?? '',
      advertiserName: initial.advertiserName ?? '',
      advertiserProgramme: initial.advertiserProgramme ?? '',
      awinProductId: initial.awinProductId ?? '',
      availability: initial.availability,
      businessIds:
        initial.selectedBusinesses?.map((business) => business.id) ?? [],
      status: initial.status ?? 'draft',
      startDate: initial.startDate
        ? new Date(initial.startDate).toISOString().slice(0, 16)
        : '',
      endDate: initial.endDate
        ? new Date(initial.endDate).toISOString().slice(0, 16)
        : '',
      termsAndConditions: initial.termsAndConditions ?? '',
      price: initial.price ?? undefined,
      salePrice: initial.salePrice ?? undefined,
      commissionRate: initial.commissionRate ?? 0,
      businessCommissionRate: initial.businessCommissionRate ?? 0,
      isFeatured: initial.isFeatured ?? false,
      displayOrder: initial.displayOrder ?? 0,
    });
  }, [initial, offeringType, reset]);

  const updateImage = (index: number, url: string) => {
    const next = [...images];
    next[index] = url;
    setValue('images', next.filter((value) => value !== undefined));
  };

  const addImageSlot = () => setValue('images', [...images, '']);

  const removeImage = (index: number) => {
    const next = images.filter((_, position) => position !== index);
    setValue('images', next.length ? next : ['']);
  };

  const toggleBusiness = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedBusinessIds, id]))
      : selectedBusinessIds.filter((businessId) => businessId !== id);
    setValue('businessIds', next);
  };

  const submitWithStatus = (status: 'draft' | 'active') => {
    handleSubmit((data) => {
      if (!data.name?.trim()) {
        toast.error('Offer name is required.');
        return;
      }
      if (!data.destinationUrl?.trim()) {
        toast.error('Advertiser destination URL is required.');
        return;
      }

      const numeric = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };

      onSubmit({
        ...data,
        offeringType,
        status,
        images: (data.images ?? []).filter(Boolean),
        tags: (data.tags ?? []).filter(Boolean),
        price: numeric(data.price),
        salePrice: numeric(data.salePrice),
        commissionRate: numeric(data.commissionRate) ?? 0,
        businessCommissionRate:
          numeric(data.businessCommissionRate) ?? 0,
        businessIds:
          data.availability === 'selected' ? data.businessIds ?? [] : [],
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      });
    })();
  };

  const filteredBusinesses = (businessesData?.data ?? []).filter((business) =>
    businessSearch
      ? business.name
          .toLowerCase()
          .includes(businessSearch.toLowerCase())
      : true,
  );

  const previewPrice =
    values.salePrice ?? values.price ?? undefined;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {initial ? 'Edit' : 'Create'} Promotional{' '}
            {offeringType === 'service' ? 'Service' : 'Product'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            This is an external advertiser offer managed by MCOM. Businesses can
            add it to their storefront, but cannot edit it.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/promotional-offers')}
        >
          Cancel
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-orange-500" />
                Offer details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('name', { required: true })}
                  placeholder={
                    offeringType === 'service'
                      ? 'e.g. Luxury Spa Day for Two'
                      : 'e.g. Designer Leather Handbag'
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Select
                    value={values.sector || ''}
                    onValueChange={(value) => {
                      setValue('sector', value);
                      setValue('category', '');
                      setValue('subCategory', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.name}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={values.category || ''}
                    onValueChange={(value) => {
                      setValue('category', value);
                      setValue('subCategory', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={values.subCategory || ''}
                    onValueChange={(value) => setValue('subCategory', value)}
                    disabled={!values.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem
                          key={subcategory.id}
                          value={subcategory.name}
                        >
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Brand (optional)</Label>
                  <Input
                    {...register('brand')}
                    placeholder="Advertiser brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={(values.tags ?? []).join(', ')}
                    onChange={(event) =>
                      setValue(
                        'tags',
                        event.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="summer, beauty, gift"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short description</Label>
                <Textarea
                  {...register('shortDescription')}
                  rows={2}
                  placeholder="One-line summary shown on cards"
                />
              </div>
              <div className="space-y-2">
                <Label>Full description</Label>
                <Textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Describe the product or service and the advertiser terms."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-orange-500" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(images.length ? images : ['']).map((image, index) => (
                <div key={index} className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Image {index + 1}
                    </span>
                    {(images.length > 1 || image) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <ImageUpload
                    value={image}
                    onChange={(url) => updateImage(index, url)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addImageSlot}
              >
                Add another image
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Pricing &amp; commission
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Display price (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Sale price (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('salePrice', { valueAsNumber: true })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform commission rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('commissionRate', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Business commission share (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('businessCommissionRate', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4 text-orange-500" />
                Advertiser &amp; tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Destination URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('destinationUrl', { required: true })}
                  placeholder="https://advertiser.example.com/product/123"
                />
                <p className="text-xs text-slate-500">
                  Where customers complete the purchase. Awin is optional: even
                  without Awin keys, MCOM appends a reference containing the
                  promoting business ID to this link.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Awin advertiser ID</Label>
                  <Input
                    {...register('advertiserId')}
                    placeholder="e.g. 12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advertiser name</Label>
                  <Input
                    {...register('advertiserName')}
                    placeholder="e.g. Fashion Brand UK"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advertiser programme</Label>
                  <Input
                    {...register('advertiserProgramme')}
                    placeholder="Programme / campaign name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Awin product ID</Label>
                  <Input
                    {...register('awinProductId')}
                    placeholder="Optional feed product ID"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pre-built affiliate URL (optional)</Label>
                <Input
                  {...register('affiliateTrackingUrl')}
                  placeholder="https://www.awin1.com/cread.php?...&clickref={clickref}"
                />
                <p className="text-xs text-slate-500">
                  Leave blank to let MCOM build the link automatically. Use{' '}
                  {'{clickref}'} as a placeholder when supplying your own. Awin
                  advertiser fields are optional until the Awin account is
                  connected.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-orange-500" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setValue('availability', 'all')}
                  className={`rounded-xl border p-4 text-left ${
                    availability === 'all'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200'
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    All businesses
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Every eligible business can add this offer to its
                    storefront.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('availability', 'selected')}
                  className={`rounded-xl border p-4 text-left ${
                    availability === 'selected'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200'
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    Selected businesses
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Only the businesses you choose can see and import it.
                  </p>
                </button>
              </div>

              {availability === 'selected' && (
                <div className="space-y-3 rounded-xl border p-4">
                  <Input
                    value={businessSearch}
                    onChange={(event) => setBusinessSearch(event.target.value)}
                    placeholder="Search businesses…"
                  />
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {businessesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading businesses…
                      </div>
                    ) : filteredBusinesses.length ? (
                      filteredBusinesses.map((business) => (
                        <label
                          key={business.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-2 hover:bg-slate-50"
                        >
                          <Checkbox
                            checked={selectedBusinessIds.includes(
                              business.id,
                            )}
                            onCheckedChange={(checked) =>
                              toggleBusiness(business.id, !!checked)
                            }
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {business.name}
                          </span>
                          {business.sector ? (
                            <span className="ml-auto text-xs text-slate-400">
                              {business.sector}
                            </span>
                          ) : null}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No businesses found.
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedBusinessIds.length} business
                    {selectedBusinessIds.length === 1 ? '' : 'es'} selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BadgePercent className="h-4 w-4 text-orange-500" />
                Promotion window &amp; terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="datetime-local"
                    {...register('startDate')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input type="datetime-local" {...register('endDate')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Terms and conditions</Label>
                <Textarea
                  {...register('termsAndConditions')}
                  rows={4}
                  placeholder="Promotion terms, eligibility, and redemption instructions."
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={!!values.isFeatured}
                  onCheckedChange={(checked) =>
                    setValue('isFeatured', !!checked)
                  }
                />
                <div>
                  <Label className="cursor-pointer">
                    Prioritise this offer in the marketplace
                  </Label>
                  <p className="mt-1 text-xs text-slate-500">
                    The offer only appears in the marketplace after a business
                    claims it, and it is shown under that business&apos;s name.
                    This flag moves claimed offers to the top.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => submitWithStatus('draft')}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as draft
            </Button>
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSaving}
              onClick={() => submitWithStatus('active')}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish offer
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-orange-500" />
                Storefront preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-dashed border-sky-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-sky-50">
                  {images.filter(Boolean)[0] ? (
                    <img
                      src={images.filter(Boolean)[0]}
                      alt={values.name || 'Offer preview'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sky-300">
                      <BadgePercent className="h-10 w-10" />
                    </div>
                  )}
                  <Badge className="absolute left-3 top-3 border-0 bg-sky-600 text-white hover:bg-sky-600">
                    MCOM Promotional
                  </Badge>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
                    {values.advertiserName || 'External advertiser'}
                  </p>
                  <h3 className="mt-1 font-bold text-slate-900">
                    {values.name || 'Offer name'}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {values.shortDescription ||
                      values.description ||
                      'Offer description will appear here.'}
                  </p>
                  <p className="mt-3 text-lg font-black text-slate-900">
                    {previewPrice
                      ? `£${Number(previewPrice).toFixed(2)}`
                      : 'Price at advertiser'}
                  </p>
                  <div className="mt-3 rounded-xl bg-sky-600 px-4 py-2 text-center text-sm font-bold text-white">
                    View at advertiser
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Customers are taken to the advertiser&apos;s site to complete
                the purchase. The affiliate click is recorded against the
                business whose storefront sent them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4 text-xs text-slate-500">
              <p className="flex items-center gap-2 font-semibold text-slate-700">
                <ChevronLeft className="h-3 w-3" />
                MCOM keeps ownership
              </p>
              <p>
                The offer stays a separate external record. It is not added to
                the business&apos;s own product or service catalogue and cannot
                be edited by the business.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
