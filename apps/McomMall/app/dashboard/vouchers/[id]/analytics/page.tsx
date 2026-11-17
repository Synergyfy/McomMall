'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Ticket, TrendingUp, Wallet, Percent } from 'lucide-react';
import { useVoucherProductAnalytics } from '@/service/hooks/useVoucherService';
import { CURRENCY } from '@/lib/utils';

const money = (value: number | string | undefined) =>
  `${CURRENCY}${Number(value ?? 0).toFixed(2)}`;

export default function VoucherProductAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useVoucherProductAnalytics(id);

  const metrics = data?.metrics ?? {};
  const product = data?.product ?? {};

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/vouchers"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {product.name || 'Voucher Analytics'}
            </h1>
            <p className="text-sm text-gray-500">
              Sales, redemptions and outstanding liability.
            </p>
          </div>
        </header>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading analytics…</p>
        ) : isError || !data ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load analytics for this voucher campaign.
          </p>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Vouchers sold', value: metrics.totalSold ?? 0, icon: Ticket },
                { label: 'Redeemed', value: metrics.totalRedeemed ?? 0, icon: TrendingUp },
                {
                  label: 'Redemption rate',
                  value: `${metrics.redemptionRate ?? 0}%`,
                  icon: Percent,
                },
                {
                  label: 'Outstanding',
                  value: money(metrics.outstandingValue),
                  icon: Wallet,
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
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400">Total value</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {money(metrics.totalValue)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400">Redeemed value</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {money(metrics.redeemedValue)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400">Reward</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {product.valueType === 'percentage'
                    ? `${product.value}%`
                    : money(product.value)}
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                Recent vouchers
              </h2>
              {(data.recentTransactions ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No vouchers issued yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                        <th className="py-2 pr-4">Code</th>
                        <th className="py-2 pr-4">Initial</th>
                        <th className="py-2 pr-4">Balance</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.map((voucher: any) => (
                        <tr key={voucher.id} className="border-b border-gray-50">
                          <td className="py-2 pr-4 font-mono text-xs">
                            {voucher.code}
                          </td>
                          <td className="py-2 pr-4">{money(voucher.initialValue)}</td>
                          <td className="py-2 pr-4">{money(voucher.balance)}</td>
                          <td className="py-2">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                              {voucher.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
