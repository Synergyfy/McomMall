'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Plus, Search, Ticket, X } from 'lucide-react';
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
  useGetTakeadsCoupons,
  useReviewTakeadsCoupon,
} from '@/service/takeads/hook';
import { TakeadsCouponFilters } from '@/service/takeads/types';

const approvalStyles: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
};

export default function TakeadsCouponsPage() {
  const [view, setView] = useState<'approved' | 'review'>('approved');
  const [filters, setFilters] = useState<TakeadsCouponFilters>({
    page: 1,
    limit: 20,
    approvalStatus: 'approved',
  });
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useGetTakeadsCoupons(filters);
  const review = useReviewTakeadsCoupon();

  const switchView = (next: 'approved' | 'review') => {
    setView(next);
    setFilters((current) => ({
      ...current,
      approvalStatus: next === 'approved' ? 'approved' : 'pending',
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {view === 'approved' ? 'Approved Coupons' : 'Coupons to Approve'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {view === 'approved'
              ? 'Coupon candidates you approved. Create an MCOM offer from one — offers are what gets published publicly.'
              : 'Imported coupons waiting for review. Approving moves them to the approved list.'}
          </p>
        </div>
        {view === 'approved' ? (
          <Button variant="outline" onClick={() => switchView('review')}>
            <Ticket className="mr-1 h-4 w-4" />
            Find coupons to approve
          </Button>
        ) : (
          <Button variant="outline" onClick={() => switchView('approved')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to approved coupons
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
              placeholder="Search coupon, code or ID"
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
              Loading coupons…
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-red-600">
              Could not load TakeAds coupons.
            </p>
          ) : !data?.data.length ? (
            <div className="py-16 text-center text-sm text-slate-500">
              {view === 'approved'
                ? 'No approved coupons yet. Use “Find coupons to approve” to review imported coupons.'
                : 'No coupons waiting for approval. Run a coupon sync from the overview.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon</TableHead>
                  <TableHead>Merchant ID</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Upstream</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900">
                        {coupon.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {coupon.code
                          ? `Code: ${coupon.code}`
                          : coupon.externalCouponId}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {coupon.externalMerchantId || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {coupon.startDate
                        ? new Date(coupon.startDate).toLocaleDateString()
                        : '—'}{' '}
                      →{' '}
                      {coupon.endDate
                        ? new Date(coupon.endDate).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          coupon.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={approvalStyles[coupon.approvalStatus]}
                      >
                        {coupon.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {view === 'review' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate(
                                  {
                                    id: coupon.id,
                                    payload: { approvalStatus: 'approved' },
                                  },
                                  {
                                    onSuccess: () => switchView('approved'),
                                  },
                                )
                              }
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate({
                                  id: coupon.id,
                                  payload: { approvalStatus: 'rejected' },
                                })
                              }
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/admin/takeads/offers/new?coupon=${encodeURIComponent(
                                coupon.externalCouponId,
                              )}`}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Create offer
                            </Link>
                          </Button>
                        )}
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
            Page {data.page} of {data.totalPages} · {data.total} coupons
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
