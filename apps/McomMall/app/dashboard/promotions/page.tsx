'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgePercent,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Gift,
  Handshake,
  Info,
  Loader2,
  Megaphone,
  Plus,
  Store,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PromotionalCatalogPanel from '@/components/promotional/PromotionalCatalogPanel';
import {
  useGetMyCampaigns,
  useRespondToCampaign,
} from '@/service/promotional-campaigns/hook';
import {
  CampaignParticipationStatus,
  PromotionalCampaign,
} from '@/service/promotional-campaigns/types';
import {
  useGetMyPartners,
  useGetPartnershipAnalytics,
  useGetReceivedUserRequests,
} from '@/service/partnerships/hooks';

type Tab = 'campaigns' | 'affiliate' | 'partnerships';

const TAB_ITEMS: Array<{
  key: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'campaigns', label: 'Available Promotions', icon: Megaphone },
  { key: 'affiliate', label: 'Affiliate Offers', icon: BadgePercent },
  { key: 'partnerships', label: 'Business Partnerships', icon: Handshake },
];

const participationBadge = (status?: CampaignParticipationStatus) => {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Accepted
        </Badge>
      );
    case 'declined':
      return (
        <Badge className="border-red-200 bg-red-100 text-red-700 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" /> Declined
        </Badge>
      );
    case 'withdrawn':
      return <Badge variant="outline">Withdrawn</Badge>;
    default:
      return (
        <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
          Invitation pending
        </Badge>
      );
  }
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Open';

export default function PromotionsHubPage() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('tab');
    if (requested === 'affiliate' || requested === 'partnerships') {
      setTab(requested);
    }
  }, []);

  const { data, isLoading, isError, error } = useGetMyCampaigns();
  const respond = useRespondToCampaign();

  const { data: partners } = useGetMyPartners();
  const { data: analytics } = useGetPartnershipAnalytics();
  const { data: receivedRequests } = useGetReceivedUserRequests();

  const campaigns = data?.data ?? [];
  const summary = useMemo(() => {
    return {
      total: campaigns.length,
      invited: campaigns.filter(
        (campaign) => campaign.participationStatus === 'invited',
      ).length,
      accepted: campaigns.filter(
        (campaign) => campaign.participationStatus === 'accepted',
      ).length,
      declined: campaigns.filter(
        (campaign) => campaign.participationStatus === 'declined',
      ).length,
    };
  }, [campaigns]);

  const handleRespond = (
    campaign: PromotionalCampaign,
    status: CampaignParticipationStatus,
  ) => {
    respond.mutate(
      { id: campaign.id, status },
      {
        onSuccess: () =>
          toast.success(
            status === 'accepted'
              ? `You joined “${campaign.name}”.`
              : status === 'declined'
                ? `You declined “${campaign.name}”.`
                : `You withdrew from “${campaign.name}”.`,
          ),
        onError: (mutationError: any) =>
          toast.error(
            mutationError?.response?.data?.message ||
              mutationError?.message ||
              'Could not update campaign participation.',
          ),
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Promotions &amp; Partnerships
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join MCOM campaigns, promote approved external offers, and grow
            through partnerships with other businesses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  tab === item.key
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === 'campaigns' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Available', value: summary.total, icon: Megaphone },
                { label: 'Invitations', value: summary.invited, icon: Info },
                { label: 'Accepted', value: summary.accepted, icon: CheckCircle2 },
                { label: 'Declined', value: summary.declined, icon: XCircle },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-2 text-gray-500">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase">
                        {stat.label}
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-black text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading campaigns…
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error instanceof Error
                  ? error.message
                  : 'Could not load campaigns.'}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 font-semibold text-gray-800">
                  No campaigns available yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Campaigns published by MCOM and made available to your business
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const expanded = expandedId === campaign.id;
                  const image =
                    campaign.promotionalMaterials?.find(
                      (material) => material.type === 'image',
                    )?.url || campaign.items?.[0]?.imageUrl;
                  const isPending =
                    respond.isPending && respond.variables?.id === campaign.id;

                  return (
                    <div
                      key={campaign.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row">
                        <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 sm:w-48">
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
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {campaign.name}
                                </h3>
                                {participationBadge(
                                  campaign.participationStatus,
                                )}
                                {campaign.isFeatured ? (
                                  <Badge className="border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100">
                                    Featured
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {campaign.description ||
                                  'MCOM promotional campaign'}
                              </p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <p className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(campaign.startDate)} →{' '}
                                {formatDate(campaign.endDate)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                              <Gift className="h-3.5 w-3.5 text-orange-500" />
                              {campaign.rewardTitle ||
                                `${campaign.rewardType} reward`}
                              {campaign.rewardValue
                                ? ` · £${Number(campaign.rewardValue).toFixed(2)}`
                                : ''}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                              <Store className="h-3.5 w-3.5" />
                              {campaign.items?.length ?? 0} item
                              {(campaign.items?.length ?? 0) === 1 ? '' : 's'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                              <Users className="h-3.5 w-3.5" />
                              {campaign.acceptedCount ?? 0} participating
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {campaign.participationStatus === 'invited' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleRespond(campaign, 'accepted')
                                  }
                                >
                                  {isPending ? (
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                  )}
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleRespond(campaign, 'declined')
                                  }
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {campaign.participationStatus === 'withdrawn' && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={isPending}
                                onClick={() =>
                                  handleRespond(campaign, 'accepted')
                                }
                              >
                                Rejoin campaign
                              </Button>
                            )}
                            {campaign.participationStatus === 'accepted' && (
                              <>
                                <Button asChild size="sm" variant="outline">
                                  <Link
                                    href={`/listings/${data?.businessId}?source=in-house&activeSection=promotions`}
                                    target="_blank"
                                  >
                                    <ExternalLink className="mr-1.5 h-4 w-4" />
                                    View on storefront
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-gray-600"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleRespond(campaign, 'withdrawn')
                                  }
                                >
                                  Withdraw
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setExpandedId(expanded ? null : campaign.id)
                              }
                            >
                              <ChevronDown
                                className={cn(
                                  'mr-1 h-4 w-4 transition-transform',
                                  expanded && 'rotate-180',
                                )}
                              />
                              {expanded ? 'Hide details' : 'View details'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {expanded && (
                        <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                          <div className="grid gap-5 lg:grid-cols-2">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                Included products &amp; offers
                              </h4>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                {campaign.items?.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 rounded-lg border bg-white p-2"
                                  >
                                    <div className="h-10 w-10 overflow-hidden rounded bg-gray-100">
                                      {item.imageUrl ? (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.title}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : null}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-semibold text-gray-800">
                                        {item.title}
                                      </p>
                                      <p className="text-[10px] uppercase text-gray-400">
                                        {item.itemType === 'promotional_offer'
                                          ? 'MCOM offer'
                                          : item.itemType}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">
                                  Reward
                                </h4>
                                <p className="mt-1 text-sm text-gray-600">
                                  {campaign.rewardDescription ||
                                    campaign.rewardTitle ||
                                    'See campaign conditions.'}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">
                                  Conditions
                                </h4>
                                <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                                  {campaign.termsAndConditions ||
                                    'No additional conditions provided.'}
                                </p>
                              </div>
                              {campaign.participants?.length ? (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900">
                                    Participating businesses
                                  </h4>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {campaign.participants
                                      .filter(
                                        (participant) =>
                                          participant.status === 'accepted',
                                      )
                                      .map((participant) => (
                                        <Badge
                                          key={participant.id}
                                          variant="outline"
                                        >
                                          {participant.businessName}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              ) : null}
                              {campaign.promotionalMaterials?.length ? (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900">
                                    Approved materials
                                  </h4>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {campaign.promotionalMaterials.map(
                                      (material, index) =>
                                        material.type === 'link' ? (
                                          <a
                                            key={`${material.url}-${index}`}
                                            href={material.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-orange-600 underline"
                                          >
                                            {material.label ||
                                              'Campaign material'}
                                          </a>
                                        ) : (
                                          <img
                                            key={`${material.url}-${index}`}
                                            src={material.url}
                                            alt="Campaign material"
                                            className="h-16 w-16 rounded-lg object-cover"
                                          />
                                        ),
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'affiliate' && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <p className="font-semibold">Approved external offers</p>
              <p className="mt-1">
                Add MCOM-managed products and services to your storefront. You
                can remove them at any time, but you cannot edit them.
              </p>
            </div>
            <PromotionalCatalogPanel offeringType="product" />
            <PromotionalCatalogPanel offeringType="service" />
          </div>
        )}

        {tab === 'partnerships' && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Active partners
                </p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  {analytics?.totalPartners ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Pending partner requests
                </p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  {analytics?.pendingUserRequests ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Pending item offers
                </p>
                <p className="mt-1 text-2xl font-black text-gray-900">
                  {analytics?.pendingItemRequests ?? 0}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/dashboard/marketing/my-partners">
                  <Plus className="mr-2 h-4 w-4" />
                  Discover &amp; manage partners
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/marketing/partnership-requests">
                  Partnership requests
                  {receivedRequests?.length ? ` (${receivedRequests.length})` : ''}
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900">My partners</h3>
              <p className="mt-1 text-sm text-gray-500">
                Partners can promote selected products and services for each
                other. Each business keeps ownership of its own catalogue.
              </p>

              {partners?.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {partners.map((partner) => (
                    <div
                      key={partner.partnershipId}
                      className="rounded-xl border border-gray-200 p-3"
                    >
                      <p className="font-semibold text-gray-900">
                        {partner.partnerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {partner.partnerEmail}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {partner.partnerBusinessId ? (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/listings/${partner.partnerBusinessId}?source=in-house`}
                              target="_blank"
                            >
                              <ExternalLink className="mr-1 h-3.5 w-3.5" />
                              View listing
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="ghost">
                          <Link href="/dashboard/marketing/my-partners">
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <Handshake className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 font-semibold text-gray-800">
                    No business partners yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Find another MCOM business, send a request, and start
                    promoting each other&apos;s offerings.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
