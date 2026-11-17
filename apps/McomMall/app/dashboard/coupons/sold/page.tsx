'use client';

import Link from 'next/link';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useGetSoldCoupons } from '@/service/coupons/hook';
import { CURRENCY } from '@/lib/utils';

export default function SoldCouponsPage() {
  const { soldCoupons, isLoading, isError } = useGetSoldCoupons();

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/coupons"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redemption Log</h1>
            <p className="text-sm text-gray-500">
              Every coupon redeemed at your business.
            </p>
          </div>
        </header>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <p className="py-16 text-center text-sm text-gray-400">Loading redemptions…</p>
          ) : isError ? (
            <p className="p-6 text-sm text-red-600">Could not load redemptions.</p>
          ) : soldCoupons.length === 0 ? (
            <div className="py-16 text-center">
              <Ticket className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">
                No coupons redeemed yet
              </p>
              <p className="text-xs text-gray-400">
                Redemptions appear here when customers use your coupons.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3">Coupon</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {soldCoupons.map((log: any) => (
                    <tr key={log.id} className="border-b border-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {log.title || log.coupon?.title || 'Coupon'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {log.code || log.coupon?.code}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.customerName ||
                          log.user?.fullName ||
                          log.user?.email ||
                          '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {CURRENCY}
                        {Number(log.amount ?? log.discountValue ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {log.timestamp || log.createdAt
                          ? new Date(log.timestamp || log.createdAt).toLocaleString('en-GB')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
