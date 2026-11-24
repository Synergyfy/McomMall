'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  Gift,
  Image as ImageIcon,
  Link2,
  Loader2,
  Megaphone,
  Package,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
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
import { useGetAdminBusinesses } from '@/service/admin/hook';
import { useGetAllAdminProducts } from '@/service/product/hook';
import { useGetAllAdminServices } from '@/service/services/hook';
import { useGetPromotionalOffers } from '@/service/promotional-offers/hook';
import {
  CampaignItem,
  CampaignPayload,
  PromotionalCampaign,
  PromotionalCampaignStatus,
  PromotionalRewardType,
} from '@/service/promotional-campaigns/types';

interface CampaignFormProps {
  initial?: PromotionalCampaign;
  isSaving?: boolean;
  onSubmit: (payload: CampaignPayload) => void;
}

type ItemTab = 'product' | 'service' | 'promotional_offer';

const defaultPayload = (): CampaignPayload => ({
  name: '',
  description: '',
  termsAndConditions: '',
  status: 'draft',
  startDate: '',
  endDate: '',
  rewardType: 'other',
  rewardTitle: '',
  rewardDescription: '',
  rewardValue: undefined,
  availableToAll: false,
  isFeatured: false,
  promotionalMaterials: [],
  businessIds: [],
  items: [],
});

export default function PromotionalCampaignForm({
  initial,
  isSaving,
  onSubmit,
}: CampaignFormProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<CampaignPayload>(() => {
    if (!initial) return defaultPayload();
    return {
      name: initial.name,
      description: initial.description ?? '',
      termsAndConditions: initial.termsAndConditions ?? '',
      status: initial.status,
      startDate: initial.startDate
        ? new Date(initial.startDate).toISOString().slice(0, 16)
        : '',
      endDate: initial.endDate
        ? new Date(initial.endDate).toISOString().slice(0, 16)
        : '',
      rewardType: initial.rewardType ?? 'other',
      rewardTitle: initial.rewardTitle ?? '',
      rewardDescription: initial.rewardDescription ?? '',
      rewardValue: initial.rewardValue ?? undefined,
      availableToAll: initial.availableToAll,
      isFeatured: initial.isFeatured,
      promotionalMaterials: initial.promotionalMaterials ?? [],
      businessIds:
        initial.participants?.map((participant) => participant.businessId) ??
        [],
      items:
        initial.items?.map((item) => ({
          itemType: item.itemType,
          productId: item.productId ?? undefined,
          serviceId: item.serviceId ?? undefined,
          offerId: item.offerId ?? undefined,
          ownerBusinessId: item.ownerBusinessId ?? undefined,
          title: item.title,
          imageUrl: item.imageUrl ?? undefined,
          price: item.price ?? undefined,
          destinationUrl: item.destinationUrl ?? undefined,
          displayOrder: item.displayOrder,
        })) ?? [],
    };
  });

  const [itemTab, setItemTab] = useState<ItemTab>('product');
  const [productSearch, setProductSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [offerSearch, setOfferSearch] = useState('');
  const [businessSearch, setBusinessSearch] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  const { data: products } = useGetAllAdminProducts({
    search: productSearch || undefined,
    limit: 50,
    page: 1,
  });
  const { data: services } = useGetAllAdminServices({
    search: serviceSearch || undefined,
    limit: 50,
    page: 1,
  });
  const { data: offers } = useGetPromotionalOffers({
    search: offerSearch || undefined,
    limit: 50,
    page: 1,
  });
  const { data: businessesData } = useGetAdminBusinesses({
    page: 1,
    limit: 200,
  });

  const businesses = businessesData?.data ?? [];
  const filteredBusinesses = useMemo(
    () =>
      businesses.filter((business) =>
        businessSearch
          ? business.name
              .toLowerCase()
              .includes(businessSearch.toLowerCase())
          : true,
      ),
    [businesses, businessSearch],
  );

  const update = <K extends keyof CampaignPayload>(
    key: K,
    value: CampaignPayload[K],
  ) => setPayload((current) => ({ ...current, [key]: value }));

  const itemKey = (item: CampaignItem) =>
    `${item.itemType}:${item.productId || item.serviceId || item.offerId || item.title}`;

  const addItem = (item: CampaignItem) => {
    if (payload.items.some((existing) => itemKey(existing) === itemKey(item))) {
      toast.info('That item is already in the campaign.');
      return;
    }
    update('items', [...payload.items, item]);
  };

  const removeItem = (item: CampaignItem) =>
    update(
      'items',
      payload.items.filter(
        (existing) => itemKey(existing) !== itemKey(item),
      ),
    );

  const toggleBusiness = (id: string, checked: boolean) => {
    update(
      'businessIds',
      checked
        ? Array.from(new Set([...(payload.businessIds ?? []), id]))
        : (payload.businessIds ?? []).filter((businessId) => businessId !== id),
    );
  };

  const submit = (status: PromotionalCampaignStatus) => {
    if (!payload.name.trim()) {
      toast.error('Campaign name is required.');
      return;
    }
    if (!payload.items.length) {
      toast.error('Add at least one product, service or promotional offer.');
      return;
    }
    onSubmit({
      ...payload,
      status,
      rewardValue: Number.isFinite(Number(payload.rewardValue))
        ? Number(payload.rewardValue)
        : undefined,
      promotionalMaterials: payload.promotionalMaterials.filter(
        (material) => material.url,
      ),
      businessIds: payload.availableToAll ? [] : payload.businessIds ?? [],
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {initial ? 'Edit' : 'Create'} Promotional Campaign
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Combine merchant products, services and MCOM promotional offers into
            one campaign that selected businesses can join.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/promotional-campaigns')}
        >
          Cancel
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4 text-orange-500" />
                Campaign details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Campaign name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={payload.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="e.g. Summer Beauty & Fashion Promotion"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={payload.description}
                  onChange={(event) =>
                    update('description', event.target.value)
                  }
                  rows={3}
                  placeholder="What is this campaign about?"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="datetime-local"
                    value={payload.startDate}
                    onChange={(event) =>
                      update('startDate', event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="datetime-local"
                    value={payload.endDate}
                    onChange={(event) => update('endDate', event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Terms and conditions</Label>
                <Textarea
                  value={payload.termsAndConditions}
                  onChange={(event) =>
                    update('termsAndConditions', event.target.value)
                  }
                  rows={3}
                  placeholder="Promotion conditions, eligibility and redemption rules."
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={payload.isFeatured}
                  onCheckedChange={(checked) =>
                    update('isFeatured', !!checked)
                  }
                />
                <Label className="cursor-pointer">
                  Feature this campaign in business dashboards
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-orange-500" />
                Products, services &amp; offers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: 'product', label: 'Products', icon: Package },
                    { key: 'service', label: 'Services', icon: Wrench },
                    {
                      key: 'promotional_offer',
                      label: 'MCOM Offers',
                      icon: Sparkles,
                    },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setItemTab(tab.key)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                        itemTab === tab.key
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {itemTab === 'product' && (
                <div className="space-y-3">
                  <Input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search merchant products…"
                  />
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {(products?.data ?? []).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 rounded-lg border p-2"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {product.businessName} · £
                            {Number(product.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            addItem({
                              itemType: 'product',
                              productId: product.id,
                              ownerBusinessId: product.businessId,
                              title: product.name,
                              imageUrl: product.images?.[0],
                              price: product.price,
                            })
                          }
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itemTab === 'service' && (
                <div className="space-y-3">
                  <Input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Search merchant services…"
                  />
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {(services?.data ?? []).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center gap-3 rounded-lg border p-2"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                          {service.images?.[0] ? (
                            <img
                              src={service.images[0]}
                              alt={service.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {service.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {service.businessName} · £
                            {Number(service.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            addItem({
                              itemType: 'service',
                              serviceId: service.id,
                              ownerBusinessId: service.businessId,
                              title: service.name,
                              imageUrl: service.images?.[0],
                              price: service.price,
                            })
                          }
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itemTab === 'promotional_offer' && (
                <div className="space-y-3">
                  <Input
                    value={offerSearch}
                    onChange={(event) => setOfferSearch(event.target.value)}
                    placeholder="Search MCOM promotional offers…"
                  />
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {(offers?.data ?? []).map((offer) => (
                      <div
                        key={offer.id}
                        className="flex items-center gap-3 rounded-lg border p-2"
                      >
                        <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                          {offer.images?.[0] ? (
                            <img
                              src={offer.images[0]}
                              alt={offer.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {offer.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {offer.advertiserName || 'External advertiser'}
                            {offer.price
                              ? ` · £${Number(offer.salePrice ?? offer.price).toFixed(2)}`
                              : ''}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            addItem({
                              itemType: 'promotional_offer',
                              offerId: offer.id,
                              title: offer.name,
                              imageUrl: offer.images?.[0],
                              price: offer.salePrice ?? offer.price ?? undefined,
                            })
                          }
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Selected items ({payload.items.length})</Label>
                {payload.items.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
                    Add at least one item above.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {payload.items.map((item) => (
                      <div
                        key={itemKey(item)}
                        className="flex items-center gap-2 rounded-lg border bg-slate-50 p-2"
                      >
                        <Badge variant="outline" className="capitalize">
                          {item.itemType === 'promotional_offer'
                            ? 'MCOM offer'
                            : item.itemType}
                        </Badge>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.title}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500"
                          onClick={() => removeItem(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="h-4 w-4 text-orange-500" />
                Reward
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Reward type</Label>
                  <Select
                    value={payload.rewardType}
                    onValueChange={(value) =>
                      update('rewardType', value as PromotionalRewardType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voucher">Voucher</SelectItem>
                      <SelectItem value="discount">Discount</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reward value (£, optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payload.rewardValue ?? ''}
                    onChange={(event) =>
                      update(
                        'rewardValue',
                        event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reward title</Label>
                  <Input
                    value={payload.rewardTitle}
                    onChange={(event) =>
                      update('rewardTitle', event.target.value)
                    }
                    placeholder="e.g. £10 voucher"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reward description</Label>
                <Textarea
                  value={payload.rewardDescription}
                  onChange={(event) =>
                    update('rewardDescription', event.target.value)
                  }
                  rows={3}
                  placeholder="How customers earn and redeem the reward."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-orange-500" />
                Participating businesses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                onClick={() => update('availableToAll', !payload.availableToAll)}
                className={`w-full rounded-xl border p-4 text-left ${
                  payload.availableToAll
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200'
                }`}
              >
                <p className="font-semibold text-slate-900">
                  Make available to all businesses
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Every business can see the campaign and choose whether to
                  participate.
                </p>
              </button>

              {!payload.availableToAll && (
                <div className="space-y-3 rounded-xl border p-4">
                  <Input
                    value={businessSearch}
                    onChange={(event) => setBusinessSearch(event.target.value)}
                    placeholder="Search businesses…"
                  />
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {filteredBusinesses.map((business) => (
                      <label
                        key={business.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-2 hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={(payload.businessIds ?? []).includes(
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
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {(payload.businessIds ?? []).length} selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-orange-500" />
                Promotional materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value=""
                onChange={(url) => {
                  if (url) {
                    update('promotionalMaterials', [
                      ...payload.promotionalMaterials,
                      { type: 'image', url },
                    ]);
                  }
                }}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {payload.promotionalMaterials
                  .filter((material) => material.type === 'image')
                  .map((material, index) => (
                    <div key={`${material.url}-${index}`} className="relative">
                      <img
                        src={material.url}
                        alt="Campaign material"
                        className="h-32 w-full rounded-xl object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute right-2 top-2 h-7 w-7"
                        onClick={() =>
                          update(
                            'promotionalMaterials',
                            payload.promotionalMaterials.filter(
                              (item) => item !== material,
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
              <div className="space-y-2">
                <Label>Add material link</Label>
                <div className="flex gap-2">
                  <Input
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    placeholder="https://…"
                  />
                  <Input
                    value={linkLabel}
                    onChange={(event) => setLinkLabel(event.target.value)}
                    placeholder="Label"
                    className="max-w-[160px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!linkUrl) return;
                      update('promotionalMaterials', [
                        ...payload.promotionalMaterials,
                        {
                          type: 'link',
                          url: linkUrl,
                          label: linkLabel || undefined,
                        },
                      ]);
                      setLinkUrl('');
                      setLinkLabel('');
                    }}
                  >
                    <Link2 className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
                {payload.promotionalMaterials
                  .filter((material) => material.type === 'link')
                  .map((material, index) => (
                    <div
                      key={`${material.url}-link-${index}`}
                      className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                    >
                      <Link2 className="h-4 w-4 text-slate-400" />
                      <span className="flex-1 truncate">
                        {material.label || material.url}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500"
                        onClick={() =>
                          update(
                            'promotionalMaterials',
                            payload.promotionalMaterials.filter(
                              (item) => item !== material,
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => submit('draft')}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as draft
            </Button>
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSaving}
              onClick={() => submit('active')}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish campaign
            </Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-orange-500" />
                Campaign summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p className="text-lg font-black text-slate-900">
                {payload.name || 'Campaign name'}
              </p>
              <p>
                {payload.items.length} item
                {payload.items.length === 1 ? '' : 's'} ·{' '}
                {payload.availableToAll
                  ? 'All businesses'
                  : `${(payload.businessIds ?? []).length} businesses`}
              </p>
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                  Reward
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {payload.rewardTitle ||
                    `${payload.rewardType} reward`}
                </p>
                {payload.rewardValue ? (
                  <p className="text-orange-700">
                    £{Number(payload.rewardValue).toFixed(2)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                {payload.items.slice(0, 6).map((item) => (
                  <p key={itemKey(item)} className="truncate text-xs">
                    • {item.title}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
