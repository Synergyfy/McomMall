'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  Store,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetTakeadsOfferPreview } from '@/service/takeads/hook';

const formatPrice = (price?: number | null, currency?: string) => {
  if (price == null) return null;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(price);
  } catch {
    return `${currency || ''} ${price.toFixed(2)}`.trim();
  }
};

export default function TakeadsOfferPreviewPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: offer, isLoading, isError } = useGetTakeadsOfferPreview(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading preview…
      </div>
    );
  }

  if (isError || !offer) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        This offer preview is not available.
      </div>
    );
  }

  const price = formatPrice(offer.price, offer.currency);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/takeads/offers/${offer.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Storefront preview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Admin-only view. Draft offers can be previewed here before they
              are approved and published.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            Approval: {offer.approvalStatus}
          </Badge>
          <Badge
            variant="outline"
            className={
              offer.publicationStatus === 'published'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }
          >
            Publication: {offer.publicationStatus}
          </Badge>
          <Badge
            variant="outline"
            className={
              offer.visibility === 'plan_only'
                ? 'border-violet-200 bg-violet-50 text-violet-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }
          >
            Audience:{' '}
            {offer.visibility === 'plan_only'
              ? `Plan-only · ${offer.allowedPlanVariantIds?.length ?? 0} variants`
              : 'Public'}
          </Badge>
          <Badge
            variant="outline"
            className={
              offer.linkResolved
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }
          >
            Link: {offer.linkResolved ? 'resolved' : 'missing'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="relative aspect-[16/9] bg-slate-50">
              {offer.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.images[0]}
                  alt={offer.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Store className="h-12 w-12" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge className="border-0 bg-sky-600 text-white hover:bg-sky-600">
                  {offer.sourceLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-white/90 text-slate-700"
                >
                  {offer.offerType}
                </Badge>
              </div>
              {offer.isFeatured && (
                <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  Featured
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                {offer.merchantName ? `From ${offer.merchantName}` : 'External merchant offer'}
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {offer.title}
              </h2>
              {price && (
                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {price}
                </p>
              )}
              {(offer.shortDescription || offer.description) && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                  {offer.shortDescription || offer.description}
                </p>
              )}
              {offer.campaignLabel && (
                <Badge variant="outline" className="mt-4">
                  {offer.campaignLabel}
                </Badge>
              )}

              <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-sky-800">
                  Buy from {offer.merchantName || 'merchant'}
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <p className="mt-2 text-center text-xs text-sky-700">
                  On the storefront this button records an MCOM click, then
                  redirects to the merchant through TakeAds. The tracking URL
                  is hidden from this preview.
                </p>
              </div>

              {offer.affiliateDisclosure && (
                <p className="mt-4 text-xs text-slate-500">
                  {offer.affiliateDisclosure}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Preview details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Merchant
                </p>
                <p className="text-slate-800">
                  {offer.merchantName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Category ID
                </p>
                <p className="font-mono text-xs text-slate-700">
                  {offer.mcomCategoryId || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Market / currency
                </p>
                <p className="text-slate-700">
                  {offer.countryCode} · {offer.currency}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Availability
                </p>
                <p className="text-xs text-slate-600">
                  {offer.startDate
                    ? `From ${new Date(offer.startDate).toLocaleDateString()}`
                    : 'No start date'}
                  <br />
                  {offer.endDate
                    ? `Until ${new Date(offer.endDate).toLocaleDateString()}`
                    : 'No end date'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Destination
                </p>
                <a
                  href={offer.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 break-all text-sky-700 hover:underline"
                >
                  {offer.destinationUrl}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              {offer.imageSource && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Image source
                  </p>
                  <p className="text-xs text-slate-600">{offer.imageSource}</p>
                </div>
              )}
              {offer.termsAndConditions && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Terms
                  </p>
                  <p className="whitespace-pre-wrap text-xs text-slate-600">
                    {offer.termsAndConditions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
