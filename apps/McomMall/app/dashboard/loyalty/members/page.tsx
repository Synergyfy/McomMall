'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Search, Users, Gift, Clock, Coins, ArrowLeft } from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import {
  useLoyaltyMembers,
  useAllocatePoints,
} from '@/service/loyalty/hook';

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export default function LoyaltyMembersPage() {
  const { businessId, isLoading: businessLoading } = useBusinessId();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [points, setPoints] = useState('100');
  const [reason, setReason] = useState('Loyalty bonus');
  const membersQuery = useLoyaltyMembers(businessId, { search, limit: 100 });
  const allocate = useAllocatePoints();

  const members = membersQuery.data?.members ?? [];
  const tierCounts = membersQuery.data?.tierCounts ?? [];

  const totalMembers = membersQuery.data?.total ?? 0;
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
    } catch {
      toast.error('Could not allocate points.');
    }
  };

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
                {totalMembers} member{totalMembers === 1 ? '' : 's'} with points activity.
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
            <div key={tier.name} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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
                  {allocate.isPending ? 'Allocating…' : `Allocate to ${selected.length}`}
                </button>
              </div>
            )}
          </div>

          {membersQuery.isLoading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading members…</p>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">No loyalty members yet</p>
              <p className="text-xs text-gray-400">
                Members appear once they earn or redeem points.
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
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {member.tier ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                            style={{ backgroundColor: member.tierColor || '#ea580c' }}
                          >
                            {member.tier}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{member.points}</td>
                      <td className="px-4 py-3 text-emerald-600">{member.pointsEarned}</td>
                      <td className="px-4 py-3 text-blue-600">{member.pointsRedeemed}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="h-3.5 w-3.5" /> {formatDate(member.lastActivity)}
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
      </div>
    </div>
  );
}
