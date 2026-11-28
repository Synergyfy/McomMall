'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ExternalLink,
  Loader2,
  Pause,
  Plus,
  Rocket,
  Search,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetTakeadsOffers,
  useTakeadsOfferAction,
} from '@/service/takeads/hook';
import {
  TakeadsApprovalStatus,
  TakeadsOfferFilters,
  TakeadsPublicationStatus,
  TakeadsVisibility,
} from '@/service/takeads/types';

const approvalStyles: Record<TakeadsApprovalStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
};

const publicationStyles: Record<TakeadsPublicationStatus, string> = {
  unpublished: 'border-slate-200 bg-slate-50 text-slate-600',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  paused: 'border-amber-200 bg-amber-50 text-amber-700',
  expired: 'border-red-200 bg-red-50 text-red-700',
  withdrawn: 'border-slate-200 bg-slate-100 text-slate-500',
};

export default function TakeadsOffersPage() {
  const [filters, setFilters] = useState<TakeadsOfferFilters>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useGetTakeadsOffers(filters);
  const action = useTakeadsOfferAction();

  useEffect(() => {
    const merchantId = new URLSearchParams(window.location.search).get(
      'merchantId',
    );
    if (merchantId) {
      setFilters((current) => ({ ...current, merchantId, page: 1 }));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">TakeAds Offers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prepare the MCOM presentation, resolve the affiliate link, then
            approve and publish.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/takeads/offers/new">
            <Plus className="mr-2 h-4 w-4" />
            New offer
          </Link>
        </Button>
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
              placeholder="Search title, merchant or campaign"
              className="pl-9"
            />
          </div>
          <Select
            value={filters.approvalStatus ?? 'all'}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                approvalStatus:
                  value === 'all'
                    ? undefined
                    : (value as TakeadsApprovalStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All approvals</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.publicationStatus ?? 'all'}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                publicationStatus:
                  value === 'all'
                    ? undefined
                    : (value as TakeadsPublicationStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Publication" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All publication</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.visibility ?? 'all'}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                visibility:
                  value === 'all' ? undefined : (value as TakeadsVisibility),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="plan_only">Plan-only</SelectItem>
            </SelectContent>
          </Select>
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
              Loading offers…
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-red-600">
              Could not load TakeAds offers.
            </p>
          ) : !data?.data.length ? (
            <div className="py-16 text-center text-sm text-slate-500">
              No offers yet. Create one from a coupon or a destination URL.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Publication</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <Link
                        href={`/admin/takeads/offers/${offer.id}`}
                        className="font-semibold text-slate-900 hover:text-sky-700"
                      >
                        {offer.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {offer.merchantName || offer.externalMerchantId || '—'}
                        {offer.campaignLabel ? ` · ${offer.campaignLabel}` : ''}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                        {offer.offerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          offer.visibility === 'plan_only'
                            ? 'border-violet-200 bg-violet-50 text-violet-700'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }
                      >
                        {offer.visibility === 'plan_only'
                          ? `Plan-only · ${offer.allowedPlanVariantIds?.length ?? 0}`
                          : 'Public'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer.resolvedTrackingUrl ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                          Not resolved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={approvalStyles[offer.approvalStatus]}
                      >
                        {offer.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={publicationStyles[offer.publicationStatus]}
                      >
                        {offer.publicationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {offer.approvalStatus === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={action.isPending}
                            onClick={() =>
                              action.mutate({ id: offer.id, action: 'approve' })
                            }
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                        )}
                        {offer.approvalStatus === 'approved' &&
                          offer.publicationStatus !== 'published' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={action.isPending}
                              onClick={() =>
                                action.mutate({
                                  id: offer.id,
                                  action: 'publish',
                                })
                              }
                            >
                              <Rocket className="mr-1 h-3.5 w-3.5" />
                              Publish
                            </Button>
                          )}
                        {offer.publicationStatus === 'published' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={action.isPending}
                            onClick={() =>
                              action.mutate({ id: offer.id, action: 'pause' })
                            }
                          >
                            <Pause className="mr-1 h-3.5 w-3.5" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/takeads/offers/${offer.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
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
            Page {data.page} of {data.totalPages} · {data.total} offers
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
