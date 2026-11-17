'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import {
  Star,
  Coins,
  ShoppingBag,
  TrendingUp,
  Plus,
  PauseCircle,
  PlayCircle,
  Gift,
  Users,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import {
  useLoyaltyStats,
  useLoyaltyMembers,
  useLoyaltyTransactions,
} from '@/service/loyalty/hook';
import { useGetOffers, useUpdateOffer } from '@/service/offers/hook';
import { CURRENCY } from '@/lib/utils';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-GB', { notation: 'compact' }).format(value ?? 0);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';

export default function LoyaltyDashboardPage() {
  const { businessId, isLoading: businessLoading } = useBusinessId();
  const statsQuery = useLoyaltyStats(businessId);
  const membersQuery = useLoyaltyMembers(businessId, { limit: 5 });
  const transactionsQuery = useLoyaltyTransactions(businessId, { limit: 6 });
  const offersQuery = useGetOffers();
  const updateOffer = useUpdateOffer();

  const stats = statsQuery.data;
  const isLoading =
    businessLoading || statsQuery.isLoading || offersQuery.isLoading;

  const offers = (offersQuery.data ?? [])
    .filter((offer) => !offer.isTimeBonus)
    .slice(0, 6);

  const handleToggleOffer = async (offerId: string, isActive: boolean) => {
    try {
      await updateOffer.mutateAsync({ id: offerId, isActive: !isActive } as any);
      toast.success(isActive ? 'Offer paused' : 'Offer resumed');
    } catch {
      toast.error('Could not update the offer.');
    }
  };

  const statCards = [
    {
      title: 'Active Rewards',
      value: formatNumber(stats?.activeRewards ?? 0),
      icon: Star,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Points Issued',
      value: formatNumber(stats?.pointsIssued ?? 0),
      icon: Coins,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Redemption Rate',
      value: `${stats?.redemptionRate ?? 0}%`,
      icon: ShoppingBag,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Loyalty Members',
      value: formatNumber(stats?.memberCount ?? 0),
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loyalty & Rewards</h1>
            <p className="text-sm text-gray-500">
              Live performance of your rewards programme.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/loyalty/offers/new"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" /> New Offer
            </Link>
            <Link
              href="/dashboard/loyalty/time-bonus/new"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Star className="h-4 w-4" /> New Time Bonus
            </Link>
            <Link
              href="/dashboard/loyalty/earning"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Coins className="h-4 w-4" /> Earning Rules
            </Link>
            <Link
              href="/dashboard/loyalty/points/allocate"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <UserPlus className="h-4 w-4" /> Allocate Points
            </Link>
          </div>
        </header>

        {!businessId && !businessLoading ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Create a business profile before configuring loyalty rewards.
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ title, value, icon: Icon, iconBg, iconColor }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <p className="text-xs font-semibold text-gray-400">{title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {isLoading ? '—' : value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Active Offers</h2>
                <Link
                  href="/dashboard/loyalty/offers"
                  className="text-sm font-semibold text-orange-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {offersQuery.isLoading ? (
                <p className="py-6 text-center text-sm text-gray-400">Loading offers…</p>
              ) : offers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                  <Gift className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">No offers yet.</p>
                  <Link
                    href="/dashboard/loyalty/offers/new"
                    className="mt-2 inline-block text-sm font-semibold text-orange-600"
                  >
                    Create your first offer
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {offer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {offer.points} points
                          {offer.discountPercentage
                            ? ` · ${offer.discountPercentage}% off`
                            : offer.discountAmount
                              ? ` · ${CURRENCY}${offer.discountAmount} off`
                              : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            offer.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Paused'}
                        </span>
                        <Link
                          href={`/dashboard/loyalty/offers/edit/${offer.id}`}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleOffer(offer.id, offer.isActive)}
                          className="text-gray-400 hover:text-orange-600"
                          aria-label={offer.isActive ? 'Pause offer' : 'Resume offer'}
                        >
                          {offer.isActive ? (
                            <PauseCircle className="h-5 w-5" />
                          ) : (
                            <PlayCircle className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                <Link
                  href="/dashboard/loyalty/members"
                  className="text-sm font-semibold text-orange-600 hover:underline"
                >
                  Members
                </Link>
              </div>
              {transactionsQuery.isLoading ? (
                <p className="py-6 text-center text-sm text-gray-400">Loading activity…</p>
              ) : (transactionsQuery.data?.data ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No points activity recorded yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {(transactionsQuery.data?.data ?? []).map((transaction) => {
                    const user = transaction.user;
                    const name =
                      user?.fullName ||
                      `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
                      user?.email ||
                      'Customer';
                    const positive = transaction.type === 'EARNED';
                    return (
                      <li key={transaction.id} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            positive ? 'bg-emerald-50' : 'bg-blue-50'
                          }`}
                        >
                          {positive ? (
                            <Coins className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.reason || transaction.offer?.name || (positive ? 'Points earned' : 'Points redeemed')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              positive ? 'text-emerald-600' : 'text-blue-600'
                            }`}
                          >
                            {positive ? '+' : ''}
                            {transaction.points}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Members', href: '/dashboard/loyalty/members', icon: Users },
                  { label: 'Offers', href: '/dashboard/loyalty/offers', icon: Gift },
                  { label: 'Time Bonus', href: '/dashboard/loyalty/time-bonus', icon: Star },
                  { label: 'Earning Rules', href: '/dashboard/loyalty/earning', icon: Coins },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400" /> {label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Expiring Points</h2>
              <p className="text-3xl font-bold text-orange-600">
                {formatNumber(membersQuery.data?.expiringPoints ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Expiring in the next 30 days
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
