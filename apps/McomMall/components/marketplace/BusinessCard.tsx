'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  MapPin,
  Star,
} from 'lucide-react';
import { PublicBusiness } from '@/service/marketplace/types';
import SafeImage from '@/components/SafeImage';

interface BusinessCardProps {
  business: PublicBusiness;
  viewMode?: 'grid' | 'list';
}

export default function BusinessCard({
  business,
  viewMode = 'grid',
}: BusinessCardProps) {
  const bannerUrl = business.bannerUrl || business.media?.[0] || null;
  const category =
    business.category?.name ||
    business.sector?.name ||
    business.listingType?.[0] ||
    null;
  const location = [business.location?.city, business.location?.postcode]
    .filter(Boolean)
    .join(', ');
  const rating = Number(business.averageRating || 0);
  const reviewCount = Number(business.reviewCount || 0);
  // In-house businesses live on the full listing detail page (products,
  // services, booking, contact), not the legacy /business profile page.
  const href = `/listings/${business.id}?source=in-house`;

  const bannerBlock = (
    <div
      className={
        viewMode === 'list'
          ? 'relative h-48 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 sm:h-auto sm:w-64'
          : 'relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50'
      }
    >
      <SafeImage
        src={bannerUrl}
        alt={business.bannerAltText || business.businessName}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        fallback={
          <div className="flex h-full min-h-[9rem] w-full items-center justify-center text-orange-300">
            <Building2 className="h-14 w-14" />
          </div>
        }
      />
      {category && (
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {category}
        </span>
      )}
      {business.isVerified && (
        <span
          title="Verified business"
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-blue-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
        >
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </span>
      )}
    </div>
  );

  const nameBlock = (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md ${
          viewMode === 'grid' ? '-mt-9' : ''
        }`}
      >
        <SafeImage
          src={business.logoUrl}
          alt={business.logoAltText || business.businessName}
          className="h-full w-full object-contain p-1"
          fallback={
            <span className="flex h-full w-full items-center justify-center bg-orange-50 text-orange-300">
              <Building2 className="h-6 w-6" />
            </span>
          }
        />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-orange-600">
          {business.businessName}
        </h3>
        {location && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" />
            {location}
          </p>
        )}
      </div>
      {business.isVerified && (
        <BadgeCheck className="h-5 w-5 flex-shrink-0 text-blue-500" />
      )}
    </div>
  );

  const footer = (
    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
      {rating > 0 ? (
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)}
          {reviewCount > 0 && (
            <span className="font-normal text-gray-400">
              ({reviewCount})
            </span>
          )}
        </div>
      ) : (
        <span className="text-xs font-medium text-gray-400">
          Local business
        </span>
      )}
      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
        Visit store
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );

  return (
    <Link href={href} className="group block h-full">
      {viewMode === 'list' ? (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg sm:flex-row">
          {bannerBlock}
          <div className="flex flex-1 flex-col p-5">
            {nameBlock}
            {business.shortDescription && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                {business.shortDescription}
              </p>
            )}
            {footer}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
          {bannerBlock}
          <div className="flex flex-1 flex-col p-4 pt-3">
            {nameBlock}
            {business.shortDescription && (
              <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">
                {business.shortDescription}
              </p>
            )}
            {footer}
          </div>
        </div>
      )}
    </Link>
  );
}
