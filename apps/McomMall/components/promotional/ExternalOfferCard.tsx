'use client';

import Link from 'next/link';
import { ArrowUpRight, BadgePercent, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPromotionalClickUrl } from '@/service/promotional-offers/hook';
import { PromotionalOffer } from '@/service/promotional-offers/types';

interface ExternalOfferCardProps {
  offer: PromotionalOffer;
  businessId?: string;
  source?: string;
  className?: string;
  compact?: boolean;
}

const formatPrice = (offer: PromotionalOffer) => {
  if (offer.price === null || offer.price === undefined) return null;
  const value = offer.salePrice ?? offer.price;
  const currency = offer.currency === 'GBP' || !offer.currency ? '£' : '';
  return `${currency}${Number(value).toFixed(2)}`;
};

export default function ExternalOfferCard({
  offer,
  businessId,
  source = 'storefront',
  className,
  compact = false,
}: ExternalOfferCardProps) {
  const image = offer.images?.[0];
  const price = formatPrice(offer);
  const hasDiscount =
    offer.salePrice !== null &&
    offer.salePrice !== undefined &&
    offer.price !== null &&
    offer.price !== undefined &&
    Number(offer.salePrice) < Number(offer.price);

  const claimingBusinessId = businessId || offer.businessId || undefined;
  const sellerName = offer.businessName || offer.advertiserName;
  const href = getPromotionalClickUrl(offer.id, {
    businessId: claimingBusinessId,
    source,
  });

  return (
    <div
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-sky-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sky-50/60">
        {image ? (
          <img
            src={image}
            alt={offer.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sky-300">
            <BadgePercent className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className="border-0 bg-sky-600 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-sky-600">
            MCOM Promotional
          </Badge>
          {offer.offeringType === 'service' ? (
            <Badge
              variant="outline"
              className="border-sky-200 bg-white/90 text-[10px] font-bold uppercase text-sky-700"
            >
              Service
            </Badge>
          ) : null}
        </div>
        {hasDiscount && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
            Sale
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
          {sellerName ? `Sold by ${sellerName}` : 'Promoted by a local business'}
        </p>
        <h3 className="line-clamp-2 text-base font-bold text-gray-900">
          {offer.name}
        </h3>
        {!compact && (offer.shortDescription || offer.description) && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {offer.shortDescription || offer.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {price ? (
            <>
              <span className="text-lg font-black text-gray-900">{price}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  £{Number(offer.price).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-500">
              View price at advertiser
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700"
          >
            View at advertiser
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-gray-400">
            <ShieldCheck className="h-3 w-3" />
            You&apos;ll complete this purchase on the advertiser&apos;s site
          </p>
        </div>
      </div>
    </div>
  );
}
