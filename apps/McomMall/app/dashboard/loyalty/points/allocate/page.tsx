'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Coins, Search, Users } from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCustomerDirectory } from '@/service/customers/hook';
import {
  useAllocatePoints,
  useLoyaltyTransactions,
} from '@/service/loyalty/hook';

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export default function AllocatePointsPage() {
  const { businessId } = useBusinessId();
  const directory = useCustomerDirectory(businessId, { limit: 100 });
  const transactions = useLoyaltyTransactions(businessId, { limit: 15 });
  const allocate = useAllocatePoints();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [points, setPoints] = useState('100');
  const [reason, setReason] = useState('Loyalty bonus');

  const customers = useMemo(
    () =>
      (directory.data?.customers ?? []).filter((customer) =>
        `${customer.name} ${customer.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [directory.data, search]
  );

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  const handleSubmit = async () => {
    if (!businessId) {
      toast.error('No business profile found.');
      return;
    }
    const value = Number(points);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a positive points amount.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Select at least one customer.');
      return;
    }
    try {
      await allocate.mutateAsync({
        businessId,
        customerIds: selected,
        points: value,
        reason: reason || undefined,
      });
      toast.success(`Allocated ${value} points to ${selected.length} customer(s).`);
      setSelected([]);
      transactions.refetch();
    } catch {
      toast.error('Could not allocate points.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/loyalty"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Allocate Points</h1>
            <p className="text-sm text-gray-500">
              Award loyalty points to one or many customers.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers…"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm"
                />
              </div>

              <div className="mt-4 max-h-80 divide-y divide-gray-50 overflow-y-auto">
                {directory.isLoading ? (
                  <p className="py-8 text-center text-sm text-gray-400">Loading customers…</p>
                ) : customers.length === 0 ? (
                  <div className="py-10 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No engaged customers yet.</p>
                  </div>
                ) : (
                  customers.map((customer) => (
                    <label
                      key={customer.id}
                      className="flex cursor-pointer items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(customer.id)}
                          onChange={() => toggle(customer.id)}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {customer.points} pts
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-gray-900">Recent Allocations</h2>
              {transactions.isLoading ? (
                <p className="py-6 text-center text-sm text-gray-400">Loading history…</p>
              ) : (transactions.data?.data ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No point transactions yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {(transactions.data?.data ?? []).map((transaction) => {
                    const user = transaction.user;
                    const name =
                      user?.fullName ||
                      `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
                      user?.email ||
                      'Customer';
                    return (
                      <li
                        key={transaction.id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{name}</p>
                          <p className="text-xs text-gray-400">
                            {transaction.reason || transaction.type} ·{' '}
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <span
                          className={`font-bold ${
                            transaction.type === 'EARNED'
                              ? 'text-emerald-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {transaction.type === 'EARNED' ? '+' : ''}
                          {transaction.points}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Coins className="h-5 w-5 text-orange-600" /> Allocation
            </h2>
            <label className="text-xs font-semibold text-gray-500">Points</label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <label className="mt-4 block text-xs font-semibold text-gray-500">
              Reason
            </label>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <p className="mt-4 text-xs text-gray-500">
              {selected.length} customer{selected.length === 1 ? '' : 's'} selected
            </p>
            <button
              onClick={handleSubmit}
              disabled={allocate.isPending || selected.length === 0}
              className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {allocate.isPending ? 'Allocating…' : 'Allocate points'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
