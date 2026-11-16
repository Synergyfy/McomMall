'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, Gift, Search, Star } from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCustomerDirectory } from '@/service/customers/hook';
import { useLoyaltyCustomer } from '@/service/loyalty/hook';

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB') : '—';

export default function LoyaltyCustomerPage() {
  const { businessId } = useBusinessId();
  const directory = useCustomerDirectory(businessId, { limit: 100 });
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const loyalty = useLoyaltyCustomer(businessId, customerId);

  const customers = useMemo(
    () =>
      (directory.data?.customers ?? []).filter((customer) =>
        `${customer.name} ${customer.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [directory.data, search]
  );

  if (!customerId) {
    return (
      <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            href="/dashboard/loyalty"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to loyalty
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Customer Loyalty View</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
            {directory.isLoading ? (
              <p className="p-6 text-center text-sm text-gray-400">Loading customers…</p>
            ) : customers.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">
                No engaged customers found. Customers appear here once they book,
                review or join a promotion.
              </p>
            ) : (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setCustomerId(customer.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-orange-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {customer.points} pts
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <button
          onClick={() => setCustomerId(undefined)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> All customers
        </button>

        {loyalty.isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading loyalty profile…</p>
        ) : loyalty.isError || !loyalty.data ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load this customer&apos;s loyalty profile.
          </p>
        ) : (
          <>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700">
                    {loyalty.data.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{loyalty.data.name}</h1>
                    <p className="text-sm text-gray-500">{loyalty.data.email}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Points</p>
                    <p className="text-2xl font-bold text-gray-900">{loyalty.data.points}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Tier</p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: loyalty.data.tierColor || '#ea580c' }}
                    >
                      {loyalty.data.tier ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Coins className="h-5 w-5 text-orange-600" /> Points History
                </h2>
                {loyalty.data.pointTransactions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">No points activity yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {loyalty.data.pointTransactions.map((transaction) => (
                      <li
                        key={transaction.id}
                        className="flex items-center justify-between border-b border-gray-50 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {transaction.reason || transaction.promotion?.name || transaction.offer?.name || transaction.type}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(transaction.created_at)}</p>
                        </div>
                        <span
                          className={`font-bold ${
                            transaction.type === 'EARNED' ? 'text-emerald-600' : 'text-blue-600'
                          }`}
                        >
                          {transaction.type === 'EARNED' ? '+' : ''}
                          {transaction.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Gift className="h-5 w-5 text-orange-600" /> Claimable Rewards
                </h2>
                {loyalty.data.claimableRewards.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">No rewards configured.</p>
                ) : (
                  <ul className="space-y-2">
                    {loyalty.data.claimableRewards.map((reward) => (
                      <li
                        key={reward.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{reward.title}</p>
                          <p className="text-xs text-gray-500">
                            {reward.description || `${reward.points} points`}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          {reward.points} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Star className="h-5 w-5 text-orange-600" /> Earning Rules
                </h2>
                {loyalty.data.earnOffers.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No active rules.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {loyalty.data.earnOffers.map((rule) => (
                      <div key={rule.id} className="rounded-lg border border-gray-100 p-3">
                        <p className="font-semibold text-gray-800">{rule.title}</p>
                        <p className="text-xs text-gray-500">{rule.description || rule.ruleType}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
