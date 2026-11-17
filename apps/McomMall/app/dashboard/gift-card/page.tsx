'use client';

import Link from 'next/link';
import {
  Gift,
  Wallet,
  TrendingDown,
  CreditCard,
  BarChart2,
  Palette,
  Image as ImageIcon,
  Search,
  Settings,
  ArrowRight,
} from 'lucide-react';
import {
  useGetGiftCardStats,
  useGetSummaryStatistics,
} from '@/service/gift-card/hook';
import { useGetMerchantGiftCards } from '@/service/merchant/gift-card';
import { CURRENCY } from '@/lib/utils';

const money = (value: number | string | undefined) =>
  `${CURRENCY}${Number(value ?? 0).toFixed(2)}`;

export default function GiftCardPage() {
  const stats = useGetGiftCardStats();
  const summary = useGetSummaryStatistics();
  const cards = useGetMerchantGiftCards({ page: 1, limit: 5 });

  const loading = stats.isLoading || summary.isLoading;

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gift Cards</h1>
            <p className="text-sm text-gray-500">
              Track sales, balances and templates.
            </p>
          </div>
          <Link
            href="/dashboard/gift-card/templates"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            <Gift className="h-4 w-4" /> Manage templates
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Active cards',
              value: stats.data?.activeCards ?? 0,
              icon: CreditCard,
            },
            {
              label: 'Total sold',
              value: money(stats.data?.totalSold),
              icon: Wallet,
            },
            {
              label: 'Total redeemed',
              value: money(stats.data?.totalRedeemed),
              icon: TrendingDown,
            },
            {
              label: 'Outstanding',
              value: money(stats.data?.outstandingLiability),
              icon: Gift,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <Icon className="mb-3 h-5 w-5 text-orange-500" />
              <p className="text-xs font-semibold text-gray-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent gift cards</h2>
              <Link
                href="/dashboard/gift-card/analytics"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                View analytics
              </Link>
            </div>

            {cards.isLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">Loading cards…</p>
            ) : (cards.data?.data ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center">
                <Gift className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No gift cards issued yet.</p>
                <p className="text-xs text-gray-400">
                  Create a template and issue cards from analytics.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                      <th className="py-2 pr-4">Code</th>
                      <th className="py-2 pr-4">Balance</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cards.data?.data ?? []).map((card: any) => (
                      <tr key={card.id} className="border-b border-gray-50">
                        <td className="py-2 pr-4 font-mono text-xs">{card.code}</td>
                        <td className="py-2 pr-4 font-semibold">
                          {money(card.currentBalance ?? card.balance)}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              card.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {card.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-gray-500">
                          {card.expiryDate
                            ? new Date(card.expiryDate).toLocaleDateString('en-GB')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Quick actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Analytics', href: '/dashboard/gift-card/analytics', icon: BarChart2 },
                  { label: 'Templates', href: '/dashboard/gift-card/templates', icon: Palette },
                  { label: 'Assets', href: '/dashboard/gift-card/assets', icon: ImageIcon },
                  { label: 'Check balance', href: '/dashboard/gift-card/check-balance', icon: Search },
                  { label: 'Settings', href: '/dashboard/gift-card/settings', icon: Settings },
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
              <h2 className="mb-2 text-sm font-bold text-gray-900">
                Monthly sales
              </h2>
              {(summary.data?.chartData?.data ?? []).length === 0 ? (
                <p className="text-xs text-gray-500">No sales recorded yet.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {(summary.data?.chartData?.data ?? []).slice(-5).map((item) => (
                    <li key={item.month} className="flex justify-between">
                      <span className="text-gray-500">{item.month}</span>
                      <span className="font-semibold text-gray-900">
                        {item.sales}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
