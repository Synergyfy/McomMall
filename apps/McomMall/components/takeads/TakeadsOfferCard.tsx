'use client';

import Link from 'next/link';
import { ArrowUpRight, BadgePercent, Loader2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatTakeadsPrice, getTakeadsClickUrl } from '@/service/takeads/hook';
import { PublicTakeadsOffer } from '@/service/takeads/types';
import TakeadsDisclosure from './TakeadsDisclosure';

interface TakeadsOfferCardProps {
  offer: PublicTakeadsOffer;
  source?: string;
  className?: string;
  compact?: boolean;
  /** Business-only offers authenticate the click instead of using an anchor. */
  onCtaClick?: (offer: PublicTakeadsOffer) => void | Promise<void>;
  ctaLoading?: boolean;
}

export default function TakeadsOfferCard({
  offer,
  source = 'deals',
  className,
  compact = false,
  onCtaClick,
  ctaLoading = false,
}: TakeadsOfferCardProps) {
  const image = offer.images?.[0];
  const href = getTakeadsClickUrl(offer.id, {
    source,
    placement: offer.placement,
  });

  return (
    <div
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={offer.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <BadgePercent className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className="border-0 bg-sky-600 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-sky-600">
            {offer.sourceLabel}
          </Badge>
          <Badge
            variant="outline"
            className="border-slate-200 bg-white/90 text-[10px] font-bold uppercase text-slate-700"
          >
            {offer.offerType}
          </Badge>
        </div>
        {offer.isFeatured && (
          <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
            Featured
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
          {offer.merchantName
            ? `From ${offer.merchantName}`
            : 'External merchant offer'}
        </p>
        <h3 className="line-clamp-2 text-base font-bold text-gray-900">
          {offer.title}
        </h3>
        {!compact && (offer.shortDescription || offer.description) && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {offer.shortDescription || offer.description}
          </p>
        )}

        {(() => {
          const price = formatTakeadsPrice(offer.price, offer.currency);
          return price ? (
            <p className="mt-2 text-base font-black text-emerald-700">
              {price}
            </p>
          ) : null;
        })()}

        {offer.couponCode && (
          <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-2 py-1">
            <span className="text-[10px] font-bold uppercase text-sky-600">
              Code
            </span>
            <code className="text-xs font-black tracking-wide text-sky-900">
              {offer.couponCode}
            </code>
          </div>
        )}

        {offer.endDate && (
          <p className="mt-2 text-xs text-gray-400">
            Available until {new Date(offer.endDate).toLocaleDateString()}
          </p>
        )}

        <div className="mt-auto pt-4">
          {onCtaClick ? (
            <button
              type="button"
              onClick={() => onCtaClick(offer)}
              disabled={ctaLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:cursor-wait disabled:opacity-70"
            >
              {ctaLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              {offer.offerType === 'coupon' || offer.offerType === 'deal'
                ? 'View deal'
                : `Buy from ${offer.merchantName || 'merchant'}`}
            </button>
          ) : (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700"
            >
              {offer.offerType === 'coupon' || offer.offerType === 'deal'
                ? 'View deal'
                : `Buy from ${offer.merchantName || 'merchant'}`}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
          <TakeadsDisclosure compact />
        </div>
      </div>
    </div>
  );
}
