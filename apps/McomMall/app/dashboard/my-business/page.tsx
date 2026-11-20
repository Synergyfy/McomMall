'use client';

import React from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Building2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Store,
  Tag,
  Wrench,
} from 'lucide-react';
import CentralManagedProfileNotice from '@/components/CentralManagedProfileNotice';
import SafeImage from '@/components/SafeImage';
import { pickCentralBusiness } from '@/lib/central-business';
import { useGetUserListings } from '@/service/listings/hook';
import { BusinessHour, UserListing } from '@/service/listings/types';
import { useGetMyProducts } from '@/service/store/products/hook';
import { useGetMyServices } from '@/service/services/hook';
import { useGetReviewsForBusinessOwner } from '@/service/reviews/hook';
import { Review } from '@/service/reviews/types';
import { CENTRAL_BUSINESS_ONBOARDING_URL } from '@/lib/mcom-solutions';

const formatDate = (value?: string | null) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= Math.round(rating)
            ? 'fill-amber-400 text-amber-400'
            : 'text-gray-300'
        }`}
      />
    ))}
  </div>
);

const SectionCard = ({
  title,
  icon,
  children,
  className = '',
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
        {icon}
      </span>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </section>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-2.5 last:border-0 sm:grid-cols-3 sm:gap-4">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </dt>
    <dd className="text-sm font-medium text-gray-700 sm:col-span-2">
      {value || '—'}
    </dd>
  </div>
);

const dayOrder = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const sortHours = (hours: BusinessHour[]) =>
  [...hours].sort(
    (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek),
  );

const getReviewAuthor = (review: Review) => {
  if (review.author?.name) return review.author.name;
  const name = [review.user?.firstName, review.user?.lastName]
    .filter(Boolean)
    .join(' ');
  return name || 'McomMall customer';
};

const BusinessOverview = ({ listing }: { listing: UserListing }) => {
  const { data: products = [] } = useGetMyProducts();
  const { data: services = [] } = useGetMyServices();
  const { data: reviewsData, isLoading: isLoadingReviews } =
    useGetReviewsForBusinessOwner(listing.id);

  const reviews = reviewsData?.data ?? [];
  const publishedReviews = reviews.filter(review => review.status !== 'pending');
  const averageRating = publishedReviews.length
    ? publishedReviews.reduce((sum, review) => sum + review.rating, 0) /
      publishedReviews.length
    : 0;

  const hours = listing.businessHours?.length
    ? sortHours(listing.businessHours)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Dashboard &gt; My Storefront
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900">
            My Storefront
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Everything about your business, synced from MCOM Central Hub, plus
            reviews collected directly on McomMall.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/store/products/add-product"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
          <Link
            href="/dashboard/services/add-service"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition-colors hover:bg-orange-100"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Link>
          <Link
            href={`/listings/${listing.id}?source=in-house`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            View public profile
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <CentralManagedProfileNotice />

      {/* Business hero */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="relative h-40 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 sm:h-52">
          {listing.bannerUrl && (
            <SafeImage
              src={listing.bannerUrl}
              alt={`${listing.businessName} cover`}
              className="h-full w-full object-cover"
            />
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700 shadow-sm backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Synced from MCOM Central
          </span>
        </div>
        <div className="relative px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-md sm:h-24 sm:w-24">
                <SafeImage
                  src={listing.logoUrl}
                  alt={listing.businessName}
                  className="h-full w-full object-contain p-1.5"
                  fallback={<Building2 className="h-9 w-9 text-gray-300" />}
                />
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-gray-900">
                    {listing.businessName}
                  </h2>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                    {listing.status}
                  </span>
                  {listing.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.listingType?.map(type => (
                    <span
                      key={type}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600"
                    >
                      {type}
                    </span>
                  ))}
                  {(listing.centralCategory || listing.category?.name) && (
                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                      {listing.centralCategory || listing.category?.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                <p className="text-lg font-black text-gray-900">
                  {listing.isClaimed ? 'Claimed' : 'Unclaimed'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Ownership
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                <p className="text-lg font-black text-gray-900">
                  {publishedReviews.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Reviews
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                <p className="text-lg font-black text-gray-900">
                  {products.length + services.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Catalog items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="About your business" icon={<Store className="h-4 w-4" />}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
            {listing.about ||
              listing.shortDescription ||
              'No business description has been added on MCOM Central yet.'}
          </p>
          {listing.centralBusinessId && (
            <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Central business ID:{' '}
              <span className="font-mono font-semibold text-gray-700">
                {listing.centralBusinessId}
              </span>
            </p>
          )}
        </SectionCard>

        <SectionCard title="Contact details" icon={<Phone className="h-4 w-4" />}>
          <dl>
            <InfoRow
              label="Phone"
              value={
                listing.businessPhone ? (
                  <a className="text-orange-600 hover:underline" href={`tel:${listing.businessPhone}`}>
                    {listing.businessPhone}
                  </a>
                ) : null
              }
            />
            <InfoRow
              label="Email"
              value={
                listing.businessEmail ? (
                  <a className="text-orange-600 hover:underline" href={`mailto:${listing.businessEmail}`}>
                    {listing.businessEmail}
                  </a>
                ) : null
              }
            />
            <InfoRow
              label="Website"
              value={
                listing.website ? (
                  <a
                    className="inline-flex items-center gap-1 text-orange-600 hover:underline"
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {listing.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null
              }
            />
            <InfoRow
              label="Legal name"
              value={listing.legalName || null}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Location" icon={<MapPin className="h-4 w-4" />}>
          <dl>
            <InfoRow label="Address" value={listing.location?.addressLine1} />
            <InfoRow label="Address line 2" value={listing.location?.addressLine2} />
            <InfoRow label="City" value={listing.location?.city} />
            <InfoRow label="Postcode" value={listing.location?.postcode} />
            <InfoRow
              label="Publicly visible"
              value={listing.location?.showPublicly ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Delivery radius"
              value={
                listing.location?.deliveryRadiusKm
                  ? `${listing.location.deliveryRadiusKm} km`
                  : null
              }
            />
          </dl>
        </SectionCard>

        <SectionCard title="Categories & profile" icon={<Tag className="h-4 w-4" />}>
          <dl>
            <InfoRow label="Sector" value={listing.sector?.name || null} />
            <InfoRow
              label="Category"
              value={listing.centralCategory || listing.category?.name || null}
            />
            <InfoRow
              label="Sub-category"
              value={listing.centralSubCategory || listing.subCategory?.name || null}
            />
            <InfoRow label="Business type" value={listing.businessType || null} />
            <InfoRow label="Industry" value={listing.industry || null} />
            <InfoRow
              label="Last Central sync"
              value={formatDate(listing.centralProfileSyncedAt)}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Opening hours" icon={<Clock className="h-4 w-4" />}>
          {hours.length > 0 ? (
            <dl>
              {hours.map(hour => (
                <div
                  key={hour.id || hour.dayOfWeek}
                  className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0"
                >
                  <dt className="font-semibold capitalize text-gray-600">
                    {hour.dayOfWeek.toLowerCase()}
                  </dt>
                  <dd className="text-gray-500">
                    {hour.is24h ? 'Open 24 hours' : `${hour.openTime} – ${hour.closeTime}`}
                  </dd>
                </div>
              ))}
            </dl>
          ) : listing.openingHours ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
              {listing.openingHours}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Opening hours have not been synced from MCOM Central yet.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Catalog & channels" icon={<Package className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Package className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Products</span>
              </div>
              <p className="mt-1 text-2xl font-black text-gray-900">{products.length}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Wrench className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Services</span>
              </div>
              <p className="mt-1 text-2xl font-black text-gray-900">{services.length}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${listing.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {listing.isVerified ? 'Business verified' : 'Verification pending'}
            </span>
            <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${listing.isGoogleVerified ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {listing.isGoogleVerified ? 'Google verified' : 'Google not linked'}
            </span>
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
              {listing.isClaimed ? 'Claimed profile' : 'Unclaimed profile'}
            </span>
          </div>
        </SectionCard>
      </div>

      {/* Reviews collected on McomMall */}
      <section
        id="reviews"
        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-900">Customer reviews</h2>
              <p className="text-xs text-gray-500">
                Reviews are submitted and displayed directly on McomMall — not MCOM Central.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2">
            <span className="text-2xl font-black text-gray-900">
              {averageRating ? averageRating.toFixed(1) : '0.0'}
            </span>
            <div>
              <StarRating rating={averageRating} />
              <p className="text-[11px] font-semibold text-gray-400">
                {publishedReviews.length} published review
                {publishedReviews.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        {isLoadingReviews ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map(item => (
              <div key={item} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <MessageSquare className="h-9 w-9 text-gray-200" />
            <p className="text-sm font-semibold text-gray-600">No reviews yet</p>
            <p className="max-w-md text-xs text-gray-500">
              Customer reviews left on your McomMall public profile will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map(review => (
              <article key={review.id} className="py-5 first:pt-4 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">
                    {getReviewAuthor(review).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">
                          {getReviewAuthor(review)}
                        </p>
                        {review.status === 'pending' && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            Awaiting moderation
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-[11px] text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default function MyBusinessPage() {
  const { data: listingsData, isLoading } = useGetUserListings(1, 1);
  const listing = pickCentralBusiness(listingsData?.data);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
        <p className="text-sm text-gray-500">
          Loading your business from MCOM Central...
        </p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-orange-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-black text-gray-900">
            No business profile found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your business listing is managed in MCOM Central Hub. Create or
            update it there, then sign back in to see it here.
          </p>
          <a
            href={CENTRAL_BUSINESS_ONBOARDING_URL}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Open MCOM Central
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return <BusinessOverview listing={listing} />;
}
