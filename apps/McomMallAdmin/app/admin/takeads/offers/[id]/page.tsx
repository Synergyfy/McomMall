'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  Link2,
  Loader2,
  Pause,
  Rocket,
  Save,
  X,
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
  useGetTakeadsOffer,
  useRejectTakeadsOffer,
  useResolveTakeadsOffer,
  useTakeadsOfferAction,
  useUpdateTakeadsOffer,
} from '@/service/takeads/hook';
import {
  TakeadsOfferType,
  TakeadsVisibility,
  UpdateTakeadsOfferPayload,
} from '@/service/takeads/types';
import PlanVariantMultiSelect from '@/app/admin/takeads/components/PlanVariantMultiSelect';

export default function TakeadsOfferDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: offer, isLoading } = useGetTakeadsOffer(id);
  const update = useUpdateTakeadsOffer();
  const resolve = useResolveTakeadsOffer();
  const action = useTakeadsOfferAction();
  const reject = useRejectTakeadsOffer();

  const [form, setForm] = useState<UpdateTakeadsOfferPayload>({});
  const [imagesText, setImagesText] = useState('');

  useEffect(() => {
    if (!offer) return;
    setForm({
      title: offer.title,
      shortDescription: offer.shortDescription ?? '',
      description: offer.description ?? '',
      imageSource: offer.imageSource ?? '',
      mcomSectorId: offer.mcomSectorId ?? '',
      mcomCategoryId: offer.mcomCategoryId ?? '',
      mcomSubCategoryId: offer.mcomSubCategoryId ?? '',
      offerType: offer.offerType,
      campaignLabel: offer.campaignLabel ?? '',
      termsAndConditions: offer.termsAndConditions ?? '',
      countryCode: offer.countryCode,
      currency: 'GBP',
      price: offer.price ?? undefined,
      visibility: offer.visibility ?? 'public',
      allowedPlanVariantIds: offer.allowedPlanVariantIds ?? [],
      isFeatured: offer.isFeatured,
      displayOrder: offer.displayOrder,
      adminDisabled: offer.adminDisabled,
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
      endDate: offer.endDate ? offer.endDate.slice(0, 10) : '',
    });
    setImagesText((offer.images ?? []).join('\n'));
  }, [offer]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading offer…
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        TakeAds offer not found.
      </div>
    );
  }

  const set = <K extends keyof UpdateTakeadsOfferPayload>(
    key: K,
    value: UpdateTakeadsOfferPayload[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const audienceReady =
    form.visibility !== 'plan_only' ||
    (form.allowedPlanVariantIds?.length ?? 0) > 0;

  const save = () => {
    update.mutate({
      id: offer.id,
      payload: {
        ...form,
        images: imagesText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{offer.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Badge variant="outline">{offer.sourceType}</Badge>
              <Badge variant="outline">{offer.offerType}</Badge>
              <Badge
                variant="outline"
                className={
                  offer.approvalStatus === 'approved'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : offer.approvalStatus === 'rejected'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                }
              >
                {offer.approvalStatus}
              </Badge>
              <Badge
                variant="outline"
                className={
                  offer.publicationStatus === 'published'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }
              >
                {offer.publicationStatus}
              </Badge>
              <Badge
                variant="outline"
                className={
                  offer.visibility === 'plan_only'
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }
              >
                {offer.visibility === 'plan_only' ? 'Plan-only' : 'Public'}
              </Badge>
              {offer.subId && <span>subId: {offer.subId}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/takeads/offers/${offer.id}/preview`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => resolve.mutate(offer.id)}
            disabled={resolve.isPending}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Resolve link
          </Button>
          {offer.approvalStatus === 'pending' && (
            <Button
              variant="outline"
              onClick={() => action.mutate({ id: offer.id, action: 'approve' })}
              disabled={action.isPending || !offer.resolvedTrackingUrl}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {offer.approvalStatus === 'approved' &&
            offer.publicationStatus !== 'published' && (
              <Button
                onClick={() => action.mutate({ id: offer.id, action: 'publish' })}
                disabled={action.isPending}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
          {offer.publicationStatus === 'published' && (
            <Button
              variant="outline"
              onClick={() => action.mutate({ id: offer.id, action: 'pause' })}
              disabled={action.isPending}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {offer.approvalStatus !== 'rejected' && (
            <Button
              variant="ghost"
              onClick={() =>
                reject.mutate({
                  id: offer.id,
                  reviewNote: 'Rejected from the offer detail page.',
                })
              }
              disabled={reject.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">MCOM presentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display title</Label>
                <Input
                  value={form.title ?? ''}
                  onChange={(event) => set('title', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Short description</Label>
                <Input
                  value={form.shortDescription ?? ''}
                  onChange={(event) =>
                    set('shortDescription', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={form.description ?? ''}
                  onChange={(event) => set('description', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Images (one URL per line)</Label>
                <Textarea
                  rows={3}
                  value={imagesText}
                  onChange={(event) => setImagesText(event.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Use only images MCOM is authorised to display. Record the
                  source below.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Image source / usage note</Label>
                <Input
                  value={form.imageSource ?? ''}
                  onChange={(event) => set('imageSource', event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Offer type</Label>
                  <Select
                    value={form.offerType ?? 'product'}
                    onValueChange={(value) =>
                      set('offerType', value as TakeadsOfferType)
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
                  <Label>Campaign label</Label>
                  <Input
                    value={form.campaignLabel ?? ''}
                    onChange={(event) => set('campaignLabel', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display order</Label>
                  <Input
                    type="number"
                    value={form.displayOrder ?? 0}
                    onChange={(event) =>
                      set('displayOrder', Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={form.startDate ?? ''}
                    onChange={(event) => set('startDate', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={form.endDate ?? ''}
                    onChange={(event) => set('endDate', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.countryCode ?? 'GB'}
                    onChange={(event) => set('countryCode', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency (GBP only)</Label>
                  <Input value="GBP" disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Price (GBP, source-authorised)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price ?? ''}
                    onChange={(event) =>
                      set(
                        'price',
                        event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      )
                    }
                  />
                  <p className="text-xs text-slate-500">
                    Enter pounds; MCOM stores integer pence.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Terms / conditions</Label>
                <Textarea
                  rows={3}
                  value={form.termsAndConditions ?? ''}
                  onChange={(event) =>
                    set('termsAndConditions', event.target.value)
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.isFeatured ?? false}
                    onCheckedChange={(checked) =>
                      set('isFeatured', checked === true)
                    }
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.adminDisabled ?? false}
                    onCheckedChange={(checked) =>
                      set('adminDisabled', checked === true)
                    }
                  />
                  <Label>Admin disabled</Label>
                </div>
              </div>
              <Button
                onClick={save}
                disabled={update.isPending || !audienceReady}
              >
                {update.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
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
                  onChange={(ids) => set('allowedPlanVariantIds', ids)}
                />
              )}
              {!audienceReady && (
                <p className="text-xs text-amber-700">
                  Select at least one plan variant before saving a plan-only
                  offer.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Source (read-only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Merchant
                </p>
                <p className="text-slate-800">
                  {offer.merchantName || offer.externalMerchantId || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Destination
                </p>
                <a
                  href={offer.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sky-700 hover:underline"
                >
                  {offer.destinationUrl}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Tracking link
                </p>
                {offer.resolvedTrackingUrl ? (
                  <a
                    href={offer.resolvedTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-emerald-700 hover:underline"
                  >
                    {offer.resolvedTrackingUrl}
                  </a>
                ) : (
                  <p className="text-amber-700">Not resolved yet</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Source IDs
                </p>
                <p className="text-xs text-slate-600">
                  Merchant: {offer.externalMerchantId || '—'}
                  <br />
                  Coupon: {offer.externalCouponId || '—'}
                  <br />
                  Programme: {offer.externalProgramId || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Storefront route
                </p>
                {offer.visibility === 'plan_only' ? (
                  <p className="text-xs text-violet-700">
                    Hidden from public /deals. Visible only in the business
                    Marketing dashboard.
                  </p>
                ) : (
                  <Link
                    href={`/takeads/${offer.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                  >
                    /takeads/{offer.id}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Availability checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Upstream active</span>
                <Badge
                  variant="outline"
                  className={
                    offer.upstreamActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }
                >
                  {offer.upstreamActive ? 'Yes' : 'No'}
                </Badge>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Tracking link</span>
                <Badge
                  variant="outline"
                  className={
                    offer.resolvedTrackingUrl
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }
                >
                  {offer.resolvedTrackingUrl ? 'Resolved' : 'Missing'}
                </Badge>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Admin disabled</span>
                <Badge variant="outline">
                  {offer.adminDisabled ? 'Yes' : 'No'}
                </Badge>
              </p>
              <p className="text-xs text-slate-500">
                Publishing requires approval, a resolved link, an active
                upstream offer and valid dates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
