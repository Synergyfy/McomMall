'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Search, UserPlus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetTakeadsMerchants,
  useReviewTakeadsMerchant,
} from '@/service/takeads/hook';
import {
  TakeadsMerchantFilters,
  TakeadsMerchantStatus,
} from '@/service/takeads/types';

const statusStyles: Record<TakeadsMerchantStatus, string> = {
  not_reviewed: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  inactive: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function TakeadsMerchantsPage() {
  const [view, setView] = useState<'accepted' | 'review'>('accepted');
  const [filters, setFilters] = useState<TakeadsMerchantFilters>({
    page: 1,
    limit: 20,
    status: 'accepted',
  });
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useGetTakeadsMerchants(filters);
  const review = useReviewTakeadsMerchant();

  const switchView = (next: 'accepted' | 'review') => {
    setView(next);
    setFilters((current) => ({
      ...current,
      status: next === 'accepted' ? 'accepted' : 'not_reviewed',
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {view === 'accepted'
              ? 'Accepted Merchants'
              : 'Merchants to Approve'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {view === 'accepted'
              ? 'Merchants you have accepted for MCOM. Accepting does not publish offers.'
              : 'Imported merchants waiting for your review. Accepting moves them to the accepted list.'}
          </p>
        </div>
        {view === 'accepted' ? (
          <Button variant="outline" onClick={() => switchView('review')}>
            <UserPlus className="mr-1 h-4 w-4" />
            Find merchants to approve
          </Button>
        ) : (
          <Button variant="outline" onClick={() => switchView('accepted')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to accepted merchants
          </Button>
        )}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setFilters((current) => ({
                    ...current,
                    search: search || undefined,
                    page: 1,
                  }));
                }
              }}
              placeholder="Search merchant, domain or ID"
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                search: search || undefined,
                page: 1,
              }))
            }
          >
            Apply
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading merchants…
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-red-600">
              Could not load TakeAds merchants.
            </p>
          ) : !data?.data.length ? (
            <div className="py-16 text-center text-sm text-slate-500">
              {view === 'accepted'
                ? 'No accepted merchants yet. Use “Find merchants to approve” to review imported merchants.'
                : 'No merchants waiting for approval. Run a merchant sync from the overview.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Upstream</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Last synced</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {merchant.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={merchant.imageUrl}
                            alt=""
                            className="h-9 w-9 rounded-lg border border-slate-200 object-contain"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                            {merchant.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/admin/takeads/merchants/${merchant.id}`}
                            className="font-semibold text-slate-900 hover:text-sky-700 hover:underline"
                          >
                            {merchant.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {merchant.defaultDomain || merchant.externalMerchantId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {merchant.countryCodes?.join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          merchant.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }
                      >
                        {merchant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[merchant.mcomStatus]}
                      >
                        {merchant.mcomStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {merchant.lastSyncedAt
                        ? new Date(merchant.lastSyncedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {view === 'review' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate(
                                  {
                                    id: merchant.id,
                                    payload: { status: 'accepted' },
                                  },
                                  {
                                    onSuccess: () => switchView('accepted'),
                                  },
                                )
                              }
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate({
                                  id: merchant.id,
                                  payload: { status: 'rejected' },
                                })
                              }
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link
                            href={`/admin/takeads/merchants/${merchant.id}`}
                          >
                            Review
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link
                            href={`/admin/takeads/offers?merchantId=${merchant.externalMerchantId}`}
                          >
                            Offers
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {data.page} of {data.totalPages} · {data.total} merchants
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(1, (current.page ?? 1) - 1),
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: (current.page ?? 1) + 1,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
