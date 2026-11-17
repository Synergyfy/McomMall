'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Search,
  Users,
  Gift,
  Clock,
  Coins,
  ArrowLeft,
  BarChart3,
  History,
  TrendingUp,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import {
  useLoyaltyMembers,
  useAllocatePoints,
  useLoyaltyStats,
  useLoyaltyTransactions,
} from '@/service/loyalty/hook';

type MembersTab = 'members' | 'analytics' | 'history';

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-GB', { notation: 'compact' }).format(value ?? 0);

export default function LoyaltyMembersPage() {
  const { businessId, isLoading: businessLoading } = useBusinessId();
  const [tab, setTab] = useState<MembersTab>('members');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [points, setPoints] = useState('100');
  const [reason, setReason] = useState('Loyalty bonus');
  const [historyPage, setHistoryPage] = useState(1);

  const membersQuery = useLoyaltyMembers(businessId, { search, limit: 100 });
  const statsQuery = useLoyaltyStats(businessId);
  const historyQuery = useLoyaltyTransactions(businessId, {
    page: historyPage,
    limit: 20,
  });
  const allocate = useAllocatePoints();

  const members = membersQuery.data?.members ?? [];
  const tierCounts = membersQuery.data?.tierCounts ?? [];
  const stats = statsQuery.data;
  const totalMembers = membersQuery.data?.total ?? 0;
  const transactions = historyQuery.data?.data ?? [];

  const allSelected = useMemo(
    () => members.length > 0 && members.every((member) => selected.includes(member.id)),
    [members, selected]
  );

  const toggleAll = () => {
    setSelected(allSelected ? [] : members.map((member) => member.id));
  };

  const handleAllocate = async () => {
    if (!businessId) {
      toast.error('No business profile found.');
      return;
    }
    const value = Number(points);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a positive number of points.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Select at least one member.');
      return;
    }

    try {
      await allocate.mutateAsync({
        businessId,
        customerIds: selected,
        points: value,
        reason: reason || undefined,
      });
      toast.success(`Allocated ${value} points to ${selected.length} member(s).`);
      setSelected([]);
      membersQuery.refetch();
      statsQuery.refetch();
      historyQuery.refetch();
    } catch {
      toast.error('Could not allocate points.');
    }
  };

  const tabs: { id: MembersTab; label: string; icon: React.ElementType }[] = [
    { id: 'members', label: 'Members', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Point History', icon: History },
  ];

  const statCards = [
    {
      label: 'Total members',
      value: formatNumber(stats?.memberCount ?? totalMembers),
      icon: Users,
      tone: 'text-gray-900',
    },
    {
      label: 'Points issued',
      value: formatNumber(stats?.pointsIssued ?? 0),
      icon: Coins,
      tone: 'text-emerald-600',
    },
    {
      label: 'Points redeemed',
      value: formatNumber(stats?.pointsRedeemed ?? 0),
      icon: ShoppingBag,
      tone: 'text-blue-600',
    },
    {
      label: 'Redemption rate',
      value: `${stats?.redemptionRate ?? 0}%`,
      icon: TrendingUp,
      tone: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/loyalty"
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loyalty Members</h1>
              <p className="text-sm text-gray-500">
                {totalMembers} member{totalMembers === 1 ? '' : 's'} · analytics and
                point history for your programme.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/loyalty/points/allocate"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Coins className="h-4 w-4" /> Bulk allocate
            </Link>
            <Link
              href="/dashboard/loyalty/offers/new"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Gift className="h-4 w-4" /> Send offer
            </Link>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === id
                  ? 'bg-orange-50 text-[#a14000]'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon, tone }) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
                    <Icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400">{label}</p>
                  <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  Members by tier
                </h2>
                <div className="space-y-3">
                  {tierCounts.map((tier) => {
                    const percent =
                      totalMembers > 0
                        ? Math.round((tier.count / totalMembers) * 100)
                        : 0;
                    return (
                      <div key={tier.name}>
                        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-gray-700">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: tier.color || '#ea580c' }}
                            />
                            {tier.name}
                          </span>
                          <span className="text-gray-500">
                            {tier.count} · {percent}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: tier.color || '#ea580c',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  Programme performance
                </h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Active rewards</span>
                    <span className="font-bold text-gray-900">
                      {stats?.activeRewards ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Completed bookings</span>
                    <span className="font-bold text-gray-900">
                      {stats?.completedBookings ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Expiring points (30 days)</span>
                    <span className="font-bold text-orange-600">
                      {membersQuery.data?.expiringPoints ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500">Members with activity</span>
                    <span className="font-bold text-gray-900">
                      {stats?.programGrowth ?? totalMembers}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="text-lg font-bold text-gray-900">Point History</h2>
              <span className="text-xs font-semibold text-gray-400">
                Page {historyPage}
              </span>
            </div>
            {historyQuery.isLoading ? (
              <p className="py-12 text-center text-sm text-gray-400">Loading history…</p>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center">
                <History className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">
                  No points activity yet
                </p>
                <p className="text-xs text-gray-400">
                  Activity appears once members earn or redeem points.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Points</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => {
                        const user = transaction.user;
                        const name =
                          user?.fullName ||
                          `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
                          user?.email ||
                          'Customer';
                        const positive = transaction.points >= 0;
                        return (
                          <tr key={transaction.id} className="border-b border-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">{name}</p>
                              <p className="text-xs text-gray-500">{user?.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                  positive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {positive ? 'Earned' : 'Redeemed'}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-3 font-bold ${
                                positive ? 'text-emerald-600' : 'text-blue-600'
                              }`}
                            >
                              {positive ? '+' : ''}
                              {transaction.points}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {transaction.reason ||
                                transaction.offer?.name ||
                                (positive ? 'Points earned' : 'Points redeemed')}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {formatDate(transaction.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-100 p-4">
                  <button
                    type="button"
                    onClick={() => setHistoryPage((page) => Math.max(page - 1, 1))}
                    disabled={historyPage === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryPage((page) => page + 1)}
                    disabled={
                      !historyQuery.data?.meta ||
                      historyPage >= (historyQuery.data.meta.totalPages ?? 1)
                    }
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'members' && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-400">Total Members</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalMembers}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-400">Expiring Points</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {membersQuery.data?.expiringPoints ?? 0}
                </p>
              </div>
              {tierCounts.slice(0, 2).map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-gray-400">{tier.name}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{tier.count}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or email…"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none"
                  />
                </div>

                {selected.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={points}
                      onChange={(event) => setPoints(event.target.value)}
                      className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Points"
                    />
                    <input
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="w-44 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Reason"
                    />
                    <button
                      onClick={handleAllocate}
                      disabled={allocate.isPending}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                      {allocate.isPending
                        ? 'Allocating…'
                        : `Allocate to ${selected.length}`}
                    </button>
                  </div>
                )}
              </div>

              {businessLoading || membersQuery.isLoading ? (
                <p className="py-12 text-center text-sm text-gray-400">Loading members…</p>
              ) : members.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-600">No loyalty members yet</p>
                  <p className="text-xs text-gray-400">
                    Members appear once they join your loyalty programme or earn points.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            aria-label="Select all members"
                          />
                        </th>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Tier</th>
                        <th className="px-4 py-3">Points</th>
                        <th className="px-4 py-3">Earned</th>
                        <th className="px-4 py-3">Redeemed</th>
                        <th className="px-4 py-3">Last activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.includes(member.id)}
                              onChange={(event) =>
                                setSelected((prev) =>
                                  event.target.checked
                                    ? [...prev, member.id]
                                    : prev.filter((id) => id !== member.id)
                                )
                              }
                              aria-label={`Select ${member.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                                {member.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {member.name}
                                </p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {member.tier ? (
                              <span
                                className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                                style={{
                                  backgroundColor: member.tierColor || '#ea580c',
                                }}
                              >
                                {member.tier}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {member.points}
                          </td>
                          <td className="px-4 py-3 text-emerald-600">
                            {member.pointsEarned}
                          </td>
                          <td className="px-4 py-3 text-blue-600">
                            {member.pointsRedeemed}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            <span className="flex items-center gap-1 text-xs">
                              <Clock className="h-3.5 w-3.5" />{' '}
                              {formatDate(member.lastActivity)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {tierCounts.map((tier) => (
                <span
                  key={tier.name}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tier.color || '#ea580c' }}
                  />
                  {tier.name} · {tier.count} (from {tier.minPoints} pts)
                </span>
              ))}
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 text-xs text-[#8a3700]">
              <Star className="mr-1 inline h-3.5 w-3.5" />
              Tip: members only earn points while they are joined to the loyalty
              programme. Share your public listing page so customers can join.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
