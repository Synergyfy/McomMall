'use client';

import Link from 'next/link';
import { ArrowUpRight, Handshake, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGetBusinessPartnerOffers } from '@/service/partnerships/hooks';

interface PartnerPromotionsSectionProps {
  businessId: string;
}

export default function PartnerPromotionsSection({
  businessId,
}: PartnerPromotionsSectionProps) {
  const { data, isLoading } = useGetBusinessPartnerOffers(businessId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-2xl bg-emerald-50"
          />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) return null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-2xl font-black text-gray-900">
          <Handshake className="text-emerald-600" />
          Partner Promotions
        </h3>
        <p className="mt-1 max-w-2xl text-sm font-medium text-gray-500">
          Products and services from approved partner businesses. Each item is
          owned and fulfilled by the original business.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.data.map((offer) => (
          <Link
            key={`${offer.type}-${offer.id}`}
            href={offer.url}
            className="group flex flex-col overflow-hidden rounded-2xl border border-dashed border-emerald-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
              {offer.image ? (
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-emerald-300">
                  <Store className="h-10 w-10" />
                </div>
              )}
              <Badge className="absolute left-3 top-3 border-0 bg-emerald-600 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-emerald-600">
                Partner offer
              </Badge>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                {offer.businessName}
              </p>
              <h4 className="mt-1 line-clamp-2 font-bold text-gray-900">
                {offer.title}
              </h4>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-lg font-black text-gray-900">
                  {offer.price ? `£${Number(offer.price).toFixed(2)}` : 'View'}
                </span>
                <ArrowUpRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-emerald-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
