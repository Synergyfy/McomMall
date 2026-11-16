'use client';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus,
  Megaphone,
  MoreVertical,
  Pause,
  Play,
  Pencil,
  Trash2,
  Users,
  TrendingUp,
  Coins,
  Calendar,
  Search,
} from 'lucide-react';
import type { RootState } from '@/service/store/store';
import {
  useDeletePromotion,
  useGetPromotionStats,
  useGetPromotions,
  useUpdatePromotion,
} from '@/service/promotions/hook';
import type { Promotion, PromotionStats } from '@/service/promotions/types';
import { CURRENCY } from '@/lib/utils';

type Row = Omit<Promotion, 'description'> & {
  description?: string | null;
} & Partial<PromotionStats>;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const isLive = (promotion: Row) => {
  if (!promotion.isActive) return false;
  const now = Date.now();
  if (promotion.beginDate && new Date(promotion.beginDate).getTime() > now)
    return false;
  if (promotion.endDate && new Date(promotion.endDate).getTime() < now)
    return false;
  return true;
};

export function PromotionsManager() {
  const router = useRouter();
  const { userRole } = useSelector((state: RootState) => state.auth);
  const promotionsQuery = useGetPromotions();
  const statsQuery = useGetPromotionStats();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const statsById = new Map(
      (statsQuery.data ?? []).map((stat) => [stat.id, stat])
    );
    return (promotionsQuery.data ?? [])
      .map((promotion) => ({ ...promotion, ...(statsById.get(promotion.id) ?? {}) }) as Row)
      .filter((promotion) =>
        `${promotion.name} ${promotion.description ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
  }, [promotionsQuery.data, statsQuery.data, query]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          live: acc.live + (isLive(row) ? 1 : 0),
          participants: acc.participants + (row.participants ?? 0),
          pointsIssued: acc.pointsIssued + (row.pointsIssued ?? 0),
          redemptions: acc.redemptions + (row.redemptions ?? 0),
        }),
        { live: 0, participants: 0, pointsIssued: 0, redemptions: 0 }
      ),
    [rows]
  );

  const handleToggle = async (promotion: Row) => {
    try {
      await updatePromotion.mutateAsync({
        id: promotion.id,
        isActive: !promotion.isActive,
      } as any);
      toast.success(promotion.isActive ? 'Promotion paused.' : 'Promotion resumed.');
      setMenuOpen(null);
    } catch {
      toast.error('Could not update the promotion.');
    }
  };

  const handleDelete = async (promotion: Row) => {
    if (!window.confirm(`Delete "${promotion.name}"? This cannot be undone.`)) return;
    try {
      await deletePromotion.mutateAsync(promotion.id);
      toast.success('Promotion deleted.');
      setMenuOpen(null);
    } catch {
      toast.error('Could not delete the promotion.');
    }
  };

  const isLoading = promotionsQuery.isLoading || statsQuery.isLoading;

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
            <p className="text-sm text-gray-500">
              {userRole === 'owner' ? 'Run loyalty campaigns across your business.' : 'Your promotions'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/promotions/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" /> New Promotion
          </button>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Live campaigns', value: totals.live, icon: Megaphone },
            { label: 'Participants', value: totals.participants, icon: Users },
            { label: 'Points issued', value: totals.pointsIssued, icon: Coins },
            { label: 'Redemptions', value: totals.redemptions, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <Icon className="mb-3 h-5 w-5 text-orange-500" />
              <p className="text-xs font-semibold text-gray-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {isLoading ? '—' : value}
              </p>
            </div>
          ))}
        </section>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search promotions…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading promotions…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No promotions yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Create your first campaign to start awarding loyalty points.
            </p>
            <button
              onClick={() => router.push('/dashboard/promotions/new')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> New Promotion
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((promotion) => {
              const live = isLive(promotion);
              return (
                <article
                  key={promotion.id}
                  className="relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          live
                            ? 'bg-emerald-50 text-emerald-700'
                            : promotion.isActive
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {live ? 'Live' : promotion.isActive ? 'Scheduled' : 'Paused'}
                      </span>
                      <h2 className="mt-2 truncate text-lg font-bold text-gray-900">
                        {promotion.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {promotion.description || 'No description'}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpen((prev) =>
                            prev === promotion.id ? null : promotion.id
                          )
                        }
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
                        aria-label="Promotion actions"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {menuOpen === promotion.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                          <button
                            onClick={() => router.push(`/dashboard/promotions/edit/${promotion.id}`)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleToggle(promotion)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {promotion.isActive ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            {promotion.isActive ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => handleDelete(promotion)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-gray-400">Participants</p>
                      <p className="font-bold text-gray-900">
                        {promotion.participants ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-gray-400">Points issued</p>
                      <p className="font-bold text-gray-900">
                        {promotion.pointsIssued ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-gray-400">Redemptions</p>
                      <p className="font-bold text-gray-900">
                        {promotion.redemptions ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-gray-400">Reward</p>
                      <p className="font-bold text-gray-900">
                        {promotion.promotionType === 'MULTIPLIER'
                          ? `${promotion.multiplier ?? 1}x points`
                          : `+${promotion.bonusPoints ?? 0} pts`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(promotion.beginDate)} → {formatDate(promotion.endDate)}
                    </span>
                    <span>
                      Min. {CURRENCY}
                      {Number(promotion.minimumSpend ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard/promotions/edit/${promotion.id}`)}
                    className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Manage campaign
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
