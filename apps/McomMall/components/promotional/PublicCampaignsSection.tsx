'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  Gift,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGetPublicCampaigns } from '@/service/promotional-campaigns/hook';
import { getPromotionalClickUrl } from '@/service/promotional-offers/hook';

interface PublicCampaignsSectionProps {
  businessId: string;
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : 'Open';

export default function PublicCampaignsSection({
  businessId,
}: PublicCampaignsSectionProps) {
  const { data, isLoading } = useGetPublicCampaigns(businessId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl bg-orange-50"
          />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-2xl font-black text-gray-900">
          <Megaphone className="text-orange-500" />
          Special Campaigns &amp; Rewards
        </h3>
        <p className="mt-1 max-w-2xl text-sm font-medium text-gray-500">
          MCOM campaigns this business has joined. Campaign items are provided
          by the original businesses or approved external advertisers.
        </p>
      </div>

      <div className="space-y-5">
        {data.data.map((campaign) => {
          const image =
            campaign.promotionalMaterials?.find(
              (material) => material.type === 'image',
            )?.url || campaign.items?.[0]?.imageUrl;

          return (
            <div
              key={campaign.id}
              className="overflow-hidden rounded-[2rem] border border-orange-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 bg-gradient-to-r from-orange-50 to-amber-50 p-5 sm:flex-row">
                <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-orange-100 sm:w-56">
                  {image ? (
                    <img
                      src={image}
                      alt={campaign.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-orange-300">
                      <Megaphone className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-orange-600 text-white hover:bg-orange-600">
                      MCOM Campaign
                    </Badge>
                    {campaign.isFeatured ? (
                      <Badge
                        variant="outline"
                        className="border-orange-200 bg-white text-orange-700"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  <h4 className="mt-2 text-2xl font-black text-gray-900">
                    {campaign.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {campaign.description ||
                      'A special promotion from this business and MCOM.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-semibold text-gray-600 shadow-sm">
                      <Gift className="h-3.5 w-3.5 text-orange-500" />
                      {campaign.rewardTitle ||
                        `${campaign.rewardType} reward`}
                      {campaign.rewardValue
                        ? ` · £${Number(campaign.rewardValue).toFixed(2)}`
                        : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-semibold text-gray-600 shadow-sm">
                      <Calendar className="h-3.5 w-3.5 text-orange-500" />
                      {formatDate(campaign.startDate)} →{' '}
                      {formatDate(campaign.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {campaign.items?.map((item) => {
                    const href =
                      item.itemType === 'promotional_offer' && item.offerId
                        ? getPromotionalClickUrl(item.offerId, {
                            businessId,
                            campaignId: campaign.id,
                            source: 'campaign',
                          })
                        : item.itemType === 'product' && item.productId
                          ? `/products/${item.productId}`
                          : item.itemType === 'service' && item.serviceId
                            ? `/services/${item.serviceId}`
                            : item.destinationUrl || '#';

                    const external =
                      item.itemType === 'promotional_offer' ||
                      item.itemType === 'link';

                    return (
                      <Link
                        key={item.id}
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="group flex items-center gap-3 rounded-xl border border-gray-100 p-2 transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-300">
                              <Gift className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-800 group-hover:text-orange-700">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {item.itemType === 'promotional_offer'
                              ? 'External offer'
                              : item.itemType === 'link'
                                ? 'Campaign link'
                                : `Provided by the ${item.itemType} owner`}
                          </p>
                          {item.price ? (
                            <p className="text-sm font-bold text-gray-900">
                              £{Number(item.price).toFixed(2)}
                            </p>
                          ) : null}
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-orange-500" />
                      </Link>
                    );
                  })}
                </div>

                {campaign.termsAndConditions ? (
                  <p className="mt-4 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    {campaign.termsAndConditions}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
