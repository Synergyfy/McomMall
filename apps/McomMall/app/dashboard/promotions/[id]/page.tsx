'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Coins, Megaphone, Users, TrendingUp, Pencil } from 'lucide-react';
import { useGetPromotionById } from '@/service/promotions/hook';
import {
  useGetPromotionSummaryStatistics,
  useGetPromotionTransactionHistory,
} from '@/service/admin';
import { CURRENCY } from '@/lib/utils';

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB') : '—';

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const promotionQuery = useGetPromotionById(id);
  const statsQuery = useGetPromotionSummaryStatistics(id);
  const historyQuery = useGetPromotionTransactionHistory(id, {
    page: 1,
    limit: 10,
  });

  const promotion = promotionQuery.data;
  const stats = statsQuery.data as
    | {
        totalPointsEarned?: number;
        totalPointsRedeemed?: number;
        totalParticipants?: number;
      }
    | undefined;

  if (promotionQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-gray-400">
        Loading promotion…
      </div>
    );
  }

  if (promotionQuery.isError || !promotion) {
    return (
      <div className="p-8">
        <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Promotion not found or you do not have access to it.
        </p>
        <button
          onClick={() => router.push('/dashboard/promotions')}
          className="mt-4 text-sm font-semibold text-orange-600"
        >
          Back to promotions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/promotions"
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{promotion.name}</h1>
              <p className="text-sm text-gray-500">
                {formatDate(promotion.beginDate)} → {formatDate(promotion.endDate)}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/promotions/edit/${promotion.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Participants',
              value: stats?.totalParticipants ?? 0,
              icon: Users,
            },
            {
              label: 'Points earned',
              value: stats?.totalPointsEarned ?? 0,
              icon: Coins,
            },
            {
              label: 'Points redeemed',
              value: stats?.totalPointsRedeemed ?? 0,
              icon: TrendingUp,
            },
            {
              label: 'Reward',
              value:
                promotion.promotionType === 'MULTIPLIER'
                  ? `${promotion.multiplier ?? 1}x`
                  : `+${promotion.bonusPoints ?? 0} pts`,
              icon: Megaphone,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <Icon className="mb-3 h-5 w-5 text-orange-500" />
              <p className="text-xs font-semibold text-gray-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-gray-900">Campaign details</h2>
          <p className="text-sm text-gray-600">
            {promotion.description || 'No description provided.'}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold text-gray-400">Type</dt>
              <dd className="text-gray-800">
                {promotion.promoType?.replaceAll('_', ' ') || promotion.promotionType}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-400">Target</dt>
              <dd className="text-gray-800">{promotion.targetSegment || 'All customers'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-400">Minimum spend</dt>
              <dd className="text-gray-800">
                {CURRENCY}
                {Number(promotion.minimumSpend ?? 0).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Recent transactions</h2>
          {historyQuery.isLoading ? (
            <p className="py-6 text-center text-sm text-gray-400">Loading…</p>
          ) : (historyQuery.data?.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No transactions for this promotion yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {(historyQuery.data?.data ?? []).map((transaction: any) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-gray-600">
                    {transaction.type} ·{' '}
                    {formatDate(transaction.createdAt ?? transaction.created_at)}
                  </span>
                  <span className="font-bold text-gray-900">{transaction.points}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
