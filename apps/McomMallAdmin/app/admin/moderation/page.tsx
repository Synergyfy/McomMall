'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Ticket,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useApproveModeration,
  useDelistModeration,
  useModeratedItems,
  useModerationStats,
  useRejectModeration,
  useRepublishModeration,
} from '@/service/moderation/hook';
import {
  ApprovalStatus,
  ModeratedItem,
  ModeratedResource,
} from '@/service/moderation/types';
import { moderationApi } from '@/service/moderation/api';
import { cn } from '@/lib/utils';

const RESOURCES: { value: ModeratedResource; label: string; icon: typeof Ticket }[] = [
  { value: 'products', label: 'Products', icon: Package },
  { value: 'gift-card-templates', label: 'Gift cards', icon: Ticket },
  { value: 'voucher-products', label: 'Vouchers', icon: Ticket },
  { value: 'coupon-products', label: 'Coupons', icon: Ticket },
];

const STATUS_FILTERS: { value: ApprovalStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

function statusBadge(item: ModeratedItem) {
  if (item.adminDisabled) {
    return {
      label: 'Delisted',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Archive,
    };
  }
  if (item.approvalStatus === 'pending') {
    return {
      label: 'Pending approval',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock,
    };
  }
  if (item.approvalStatus === 'rejected') {
    return {
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    };
  }
  return {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  };
}

export default function CatalogModerationPage() {
  const queryClient = useQueryClient();
  const [resource, setResource] =
    useState<ModeratedResource>('products');
  const [status, setStatus] = useState<ApprovalStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [review, setReview] = useState<{
    item: ModeratedItem;
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<'selected' | 'all' | null>(null);
  const [bulkPhase, setBulkPhase] = useState<'idle' | 'collecting' | 'approving'>('idle');
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedResource = params.get('resource');
    if (requestedResource && RESOURCES.some((entry) => entry.value === requestedResource)) {
      setResource(requestedResource as ModeratedResource);
    }
    const requestedStatus = params.get('approvalStatus');
    if (requestedStatus && STATUS_FILTERS.some((entry) => entry.value === requestedStatus)) {
      setStatus(requestedStatus as ApprovalStatus | 'all');
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [resource, status, search]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [resource, status, search, page]);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      approvalStatus: status === 'all' ? undefined : status,
      page,
      limit: 20,
    }),
    [search, status, page],
  );

  const { data, isLoading, isError } = useModeratedItems(resource, params);
  const { data: stats } = useModerationStats();

  const approve = useApproveModeration();
  const reject = useRejectModeration();
  const delist = useDelistModeration();
  const republish = useRepublishModeration();

  const activeStats = stats?.resources.find(
    (entry) => entry.resource === resource,
  );
  const pendingOnPage = data?.data.filter((item) => item.approvalStatus === 'pending') ?? [];
  const selectedPendingIds = Array.from(selectedIds).filter((id) =>
    pendingOnPage.some((item) => item.id === id),
  );
  const allPendingSelected =
    pendingOnPage.length > 0 && pendingOnPage.every((item) => selectedIds.has(item.id));
  const somePendingSelected = pendingOnPage.some((item) => selectedIds.has(item.id));
  const bulkRunning = bulkPhase !== 'idle';
  const bulkAllCount = status === 'pending' ? data?.total ?? 0 : activeStats?.pending ?? 0;

  const busy =
    approve.isPending ||
    reject.isPending ||
    delist.isPending ||
    republish.isPending ||
    bulkRunning;

  const resetBulkState = () => {
    setBulkConfirm(null);
    setBulkPhase('idle');
    setBulkProgress(null);
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const item of pendingOnPage) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  };

  const approveIds = async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) {
      toast.info('No pending items to approve.');
      resetBulkState();
      return;
    }

    setBulkPhase('approving');
    setBulkProgress({ done: 0, total: uniqueIds.length });
    let done = 0;
    const concurrency = 8;

    try {
      for (let index = 0; index < uniqueIds.length; index += concurrency) {
        const batch = uniqueIds.slice(index, index + concurrency);
        await Promise.all(batch.map((id) => moderationApi.approve(resource, id)));
        done += batch.length;
        setBulkProgress({ done, total: uniqueIds.length });
      }

      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
      if (resource === 'products') {
        queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_PRODUCTS'] });
        queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_PRODUCT_STATS'] });
      }
      toast.success(`Approved ${done} ${done === 1 ? 'item' : 'items'}.`);
      setSelectedIds(new Set());
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.message || err.message || 'Bulk approval failed.',
      );
    } finally {
      resetBulkState();
    }
  };

  const collectPendingIds = async () => {
    const ids: string[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const result = await moderationApi.list(resource, {
        search: search.trim() || undefined,
        approvalStatus: 'pending',
        page: currentPage,
        limit: 100,
      });
      ids.push(...result.data.map((item) => item.id));
      totalPages = result.totalPages;
      currentPage += 1;
    } while (currentPage <= totalPages);

    return ids;
  };

  const confirmBulkApprove = async () => {
    if (bulkConfirm === 'selected') {
      await approveIds(selectedPendingIds);
      return;
    }

    if (bulkConfirm === 'all') {
      setBulkPhase('collecting');
      try {
        toast.info('Collecting pending items…');
        const ids = await collectPendingIds();
        await approveIds(ids);
      } catch (error) {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        toast.error(
          err.response?.data?.message || err.message || 'Could not collect pending items.',
        );
        resetBulkState();
      }
    }
  };

  const openReview = (
    item: ModeratedItem,
    action: 'approve' | 'reject',
  ) => {
    setReview({ item, action });
    setReviewNote(item.reviewNote ?? '');
  };

  const submitReview = () => {
    if (!review) return;
    const args = {
      resource,
      id: review.item.id,
      reviewNote: reviewNote.trim() || undefined,
    };
    if (review.action === 'approve') {
      approve.mutate(args, {
        onSuccess: () => {
          setReview(null);
          setReviewNote('');
        },
      });
    } else {
      reject.mutate(args, {
        onSuccess: () => {
          setReview(null);
          setReviewNote('');
        },
      });
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Catalog approvals
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review products, gift cards, vouchers and coupons before they appear
              on a business listing.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Pending in this queue
              </p>
              <p className="text-xl font-black text-slate-900">
                {activeStats?.pending ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total', value: activeStats?.total ?? 0 },
            { label: 'Pending', value: activeStats?.pending ?? 0 },
            { label: 'Approved', value: activeStats?.approved ?? 0 },
            { label: 'Rejected', value: activeStats?.rejected ?? 0 },
          ].map((card) => (
            <Card key={card.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs
          value={resource}
          onValueChange={(value) => setResource(value as ModeratedResource)}
        >
          <TabsList className="h-auto flex-wrap gap-1 bg-white p-1 shadow-sm">
            {RESOURCES.map((entry) => {
              const Icon = entry.icon;
              const entryStats = stats?.resources.find(
                (item) => item.resource === entry.value,
              );
              return (
                <TabsTrigger
                  key={entry.value}
                  value={entry.value}
                  className="gap-2 px-4 py-2 text-xs font-bold"
                >
                  <Icon className="h-4 w-4" />
                  {entry.label}
                  {!!entryStats?.pending && (
                    <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                      {entryStats.pending}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-800">
                {data?.total ?? 0} item{(data?.total ?? 0) === 1 ? '' : 's'}
              </CardTitle>
              {selectedPendingIds.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <span>{selectedPendingIds.length} selected</span>
                  <Button
                    size="sm"
                    className="h-7 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setBulkConfirm('selected')}
                    disabled={busy}
                  >
                    {bulkPhase === 'approving' && bulkProgress
                      ? `Approving ${bulkProgress.done}/${bulkProgress.total}`
                      : 'Approve selected'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-emerald-700"
                    onClick={() => setSelectedIds(new Set())}
                    disabled={busy}
                  >
                    Clear
                  </Button>
                </div>
              )}
              {status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setBulkConfirm('all')}
                  disabled={busy || bulkAllCount === 0}
                >
                  {bulkPhase === 'collecting'
                    ? 'Collecting…'
                    : bulkPhase === 'approving' && bulkProgress
                      ? `Approving ${bulkProgress.done}/${bulkProgress.total}`
                      : `Approve all pending (${bulkAllCount})`}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name…"
                  className="w-56 pl-9"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as ApprovalStatus | 'all')
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading
                catalog items…
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-500">
                <AlertCircle className="h-6 w-6 text-rose-500" />
                <p className="font-semibold">Could not load this queue.</p>
                <p className="text-xs">Check that you are signed in as an admin.</p>
              </div>
            ) : data && data.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all pending items on this page"
                        checked={
                          allPendingSelected
                            ? true
                            : somePendingSelected
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={(checked) =>
                          toggleSelectAllOnPage(checked === true)
                        }
                        disabled={busy || pendingOnPage.length === 0}
                      />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Owner / business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item) => {
                    const badge = statusBadge(item);
                    const Icon = badge.icon;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${item.name}`}
                            checked={selectedIds.has(item.id)}
                            onCheckedChange={(checked) =>
                              toggleSelect(item.id, checked === true)
                            }
                            disabled={busy || item.approvalStatus !== 'pending'}
                          />
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <p className="truncate font-bold text-slate-900">
                            {item.name || 'Untitled'}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.description || 'No description'}
                          </p>
                          {item.reviewNote && (
                            <p className="mt-1 truncate text-xs text-amber-700">
                              Review note: {item.reviewNote}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {item.businessName || item.ownerId || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('gap-1 font-medium', badge.className)}
                          >
                            <Icon className="h-3 w-3" />
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-500">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {item.approvalStatus !== 'approved' && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => openReview(item, 'approve')}
                                disabled={busy}
                              >
                                Approve
                              </Button>
                            )}
                            {item.approvalStatus !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                onClick={() => openReview(item, 'reject')}
                                disabled={busy}
                              >
                                Reject
                              </Button>
                            )}
                            {item.adminDisabled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  republish.mutate({
                                    resource,
                                    id: item.id,
                                  })
                                }
                                disabled={busy}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Republish
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  delist.mutate({ resource, id: item.id })
                                }
                                disabled={busy}
                              >
                                <Archive className="mr-1 h-3 w-3" />
                                Delist
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-500">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
                <p className="font-semibold">Nothing in this queue.</p>
                <p className="text-xs">
                  New business catalog items will appear here for review.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {!!data && data.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={data.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) =>
                    Math.min(data.totalPages, current + 1),
                  )
                }
                disabled={data.page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!open) {
            setReview(null);
            setReviewNote('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {review?.action === 'reject' ? 'Reject item' : 'Approve item'}
            </DialogTitle>
            <DialogDescription>
              {review?.item.name} —{' '}
              {review?.action === 'reject'
                ? 'the business will see this note and can fix it before resubmitting.'
                : 'it will appear on the storefront immediately.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-note">Review note (optional)</Label>
            <Textarea
              id="review-note"
              rows={3}
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder={
                review?.action === 'reject'
                  ? 'Explain what needs changing…'
                  : 'Optional internal note…'
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReview(null);
                setReviewNote('');
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={busy}
              className={
                review?.action === 'reject'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {review?.action === 'reject' ? 'Reject item' : 'Approve item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bulkConfirm}
        onOpenChange={(open) => {
          if (!open && !bulkRunning) setBulkConfirm(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkConfirm === 'all'
                ? 'Approve all pending items'
                : 'Approve selected items'}
            </DialogTitle>
            <DialogDescription>
              {bulkConfirm === 'all'
                ? `This will approve ${bulkAllCount} pending ${bulkAllCount === 1 ? 'item' : 'items'} in the current ${RESOURCES.find((entry) => entry.value === resource)?.label ?? resource} queue using the existing single-item approval action. It runs in your browser, so large queues may take a while.`
                : `This will approve ${selectedPendingIds.length} selected ${selectedPendingIds.length === 1 ? 'item' : 'items'} using the existing single-item approval action.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkConfirm(null)}
              disabled={bulkRunning}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={confirmBulkApprove}
              disabled={bulkRunning}
            >
              {bulkRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bulkConfirm === 'all'
                ? `Approve ${bulkAllCount}`
                : `Approve ${selectedPendingIds.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
