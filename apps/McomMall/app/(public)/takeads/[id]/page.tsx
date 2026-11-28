'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  CalendarDays,
  Loader2,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatTakeadsPrice,
  getTakeadsClickUrl,
  useGetPublicTakeadsOffer,
} from '@/service/takeads/hook';

export default function TakeadsOfferPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: offer, isLoading, isError } = useGetPublicTakeadsOffer(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-24 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading offer…
      </div>
    );
  }

  if (isError || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 pt-28">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <BadgePercent className="mx-auto h-12 w-12 text-gray-300" />
            <h1 className="mt-4 text-2xl font-black text-gray-900">
              This offer is no longer available
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              The merchant promotion may have ended or been withdrawn. Browse
              current deals instead.
            </p>
            <Button asChild className="mt-6 rounded-xl bg-sky-600 hover:bg-sky-700">
              <Link href="/deals">Browse deals</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const image = offer.images?.[0];
  const price = formatTakeadsPrice(offer.price, offer.currency);
  const isDeal = offer.offerType === 'coupon' || offer.offerType === 'deal';
  const clickUrl = getTakeadsClickUrl(offer.id, {
    source: 'offer-detail',
    placement: offer.placement,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-28">
      <div className="container mx-auto px-4">
        <Link
          href="/deals"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to deals
        </Link>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-[16/9] bg-slate-50">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={offer.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <BadgePercent className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge className="border-0 bg-sky-600 text-xs font-bold uppercase text-white hover:bg-sky-600">
                    {offer.sourceLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/60 bg-white/90 text-xs font-bold uppercase text-slate-700"
                  >
                    {offer.offerType}
                  </Badge>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                  {offer.merchantName
                    ? `From ${offer.merchantName}`
                    : 'External merchant offer'}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                  {offer.title}
                </h1>
                {price && (
                  <p className="mt-2 text-2xl font-black text-emerald-700">
                    {price}
                  </p>
                )}
                {offer.shortDescription && (
                  <p className="mt-3 text-lg text-gray-600">
                    {offer.shortDescription}
                  </p>
                )}
                {offer.description && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {offer.description}
                  </p>
                )}

                {offer.couponCode && (
                  <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-sky-300 bg-sky-50 px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-sky-600">
                      Coupon code
                    </span>
                    <code className="rounded-lg bg-white px-3 py-1 text-base font-black tracking-wider text-sky-900 shadow-sm">
                      {offer.couponCode}
                    </code>
                  </div>
                )}

                {offer.termsAndConditions && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <h2 className="text-sm font-bold text-gray-900">
                      Offer conditions
                    </h2>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                      {offer.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900">
                  How it works
                </h2>
                <ul className="mt-3 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Store className="mt-0.5 h-4 w-4 text-sky-600" />
                    You visit the merchant&apos;s website.
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-600" />
                    Any purchase is completed with that merchant under its own
                    terms.
                  </li>
                  {offer.endDate && (
                    <li className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-sky-600" />
                      Available until{' '}
                      {new Date(offer.endDate).toLocaleDateString()}.
                    </li>
                  )}
                </ul>

                <Button
                  asChild
                  className="mt-5 w-full rounded-xl bg-sky-600 py-6 text-base font-bold hover:bg-sky-700"
                >
                  <a
                    href={clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {isDeal
                      ? `View deal at ${offer.merchantName || 'merchant'}`
                      : `Buy from ${offer.merchantName || 'merchant'}`}
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-400">
                  {offer.affiliateDisclosure}
                </p>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-sm text-sky-900">
                <p className="font-bold">MCOM Mall marketplace</p>
                <p className="mt-1 text-sky-800">
                  MCOM Mall selects and presents this offer. The merchant is
                  responsible for its products, checkout, payment, delivery and
                  after-sales service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
