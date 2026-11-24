'use client';

import { BadgePercent, ExternalLink } from 'lucide-react';
import { useGetPublicPromotionalOffers } from '@/service/promotional-offers/hook';
import { PromotionalOfferingType } from '@/service/promotional-offers/types';
import ExternalOfferCard from './ExternalOfferCard';

interface PromotionalOffersSectionProps {
  businessId: string;
  offeringType: PromotionalOfferingType;
  title: string;
  description?: string;
}

export default function PromotionalOffersSection({
  businessId,
  offeringType,
  title,
  description,
}: PromotionalOffersSectionProps) {
  const { data, isLoading, isError } = useGetPublicPromotionalOffers(
    { businessId, offeringType, limit: 24 },
    { enabled: !!businessId },
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-2xl bg-sky-50"
          />
        ))}
      </div>
    );
  }

  if (isError || !data?.data?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-black text-gray-900">
            <BadgePercent className="text-sky-600" />
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-medium text-gray-500">
            {description ||
              'External offers selected by this business. Purchases are completed securely on the advertiser\u2019s website.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
          <ExternalLink className="h-3.5 w-3.5" />
          External advertiser offers
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.data.map((offer) => (
          <ExternalOfferCard
            key={offer.id}
            offer={offer}
            businessId={businessId}
            source="storefront"
          />
        ))}
      </div>
    </div>
  );
}
