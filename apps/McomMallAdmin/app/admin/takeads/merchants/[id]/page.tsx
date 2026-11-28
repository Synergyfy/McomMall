'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  PackagePlus,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  useGetTakeadsMerchant,
  useReviewTakeadsMerchant,
} from '@/service/takeads/hook';
import { TakeadsMerchantStatus } from '@/service/takeads/types';

const statusStyles: Record<TakeadsMerchantStatus, string> = {
  not_reviewed: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  inactive: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function TakeadsMerchantDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: merchant, isLoading } = useGetTakeadsMerchant(id);
  const review = useReviewTakeadsMerchant();

  const [sectorId, setSectorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (!merchant) return;
    setSectorId(merchant.mcomSectorId ?? '');
    setCategoryId(merchant.mcomCategoryId ?? '');
    setSubCategoryId(merchant.mcomSubCategoryId ?? '');
    setReviewNote(merchant.reviewNote ?? '');
  }, [merchant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading merchant…
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        TakeAds merchant not found.
      </div>
    );
  }

  const reviewAs = (status: TakeadsMerchantStatus) =>
    review.mutate({
      id: merchant.id,
      payload: {
        status,
        mcomSectorId: sectorId || undefined,
        mcomCategoryId: categoryId || undefined,
        mcomSubCategoryId: subCategoryId || undefined,
        reviewNote: reviewNote || undefined,
      },
    });

  const commission = (() => {
    if (!merchant.commissionMetadata) return '—';
    try {
      return JSON.stringify(merchant.commissionMetadata, null, 2);
    } catch {
      return String(merchant.commissionMetadata);
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {merchant.name}
              </h1>
              <Badge
                variant="outline"
                className={statusStyles[merchant.mcomStatus]}
              >
                {merchant.mcomStatus.replace('_', ' ')}
              </Badge>
              <Badge
                variant="outline"
                className={
                  merchant.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }
              >
                {merchant.isActive ? 'Active upstream' : 'Inactive upstream'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {merchant.defaultDomain || merchant.externalMerchantId}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {merchant.mcomStatus === 'accepted' ? (
            <Button asChild>
              <Link
                href={`/admin/takeads/offers/new?merchantId=${encodeURIComponent(
                  merchant.externalMerchantId,
                )}`}
              >
                <PackagePlus className="mr-2 h-4 w-4" />
                Add affiliate product
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() => reviewAs('accepted')}
              disabled={review.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept merchant
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => reviewAs('rejected')}
            disabled={review.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/takeads/merchants">Back to list</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Programme review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    TakeAds merchant ID
                  </p>
                  <p className="font-mono text-xs text-slate-700">
                    {merchant.externalMerchantId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Market
                  </p>
                  <p className="text-sm text-slate-700">
                    {merchant.countryCodes?.join(', ') || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Currency
                  </p>
                  <p className="text-sm text-slate-700">
                    {merchant.currencyCode || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Deeplinks
                  </p>
                  <p className="text-sm text-slate-700">
                    {merchant.deeplinkAllowed ? 'Allowed' : 'Not allowed'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Description
                </p>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {merchant.description || 'No description supplied by TakeAds.'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Domains
                </p>
                <p className="text-sm text-slate-700">
                  {merchant.domains?.join(', ') || merchant.defaultDomain || '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Commission metadata
                </p>
                <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  {commission}
                </pre>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Upstream tracking link
                </p>
                {merchant.trackingLink ? (
                  <a
                    href={merchant.trackingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"
                  >
                    Open source link
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">Not supplied</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">MCOM categorisation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Sector ID</Label>
                <Input
                  value={sectorId}
                  onChange={(event) => setSectorId(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category ID</Label>
                <Input
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subcategory ID</Label>
                <Input
                  value={subCategoryId}
                  onChange={(event) => setSubCategoryId(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-3">
                <Label>Review note</Label>
                <Textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Why this merchant was accepted or rejected"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-3">
                <Button
                  onClick={() => reviewAs('accepted')}
                  disabled={review.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Save & accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reviewAs('rejected')}
                  disabled={review.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Save & reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Review status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Last synced</span>
                <span className="text-slate-700">
                  {merchant.lastSyncedAt
                    ? new Date(merchant.lastSyncedAt).toLocaleString()
                    : '—'}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Reviewed at</span>
                <span className="text-slate-700">
                  {merchant.reviewedAt
                    ? new Date(merchant.reviewedAt).toLocaleString()
                    : '—'}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-500">Reviewed by</span>
                <span className="font-mono text-xs text-slate-700">
                  {merchant.reviewedBy || '—'}
                </span>
              </p>
              {merchant.mcomStatus === 'accepted' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  Products can now be created from this merchant. Each product
                  still needs its own approval and publication.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Imported offers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!merchant.offers.length ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No offers yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchant.offers.slice(0, 10).map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <Link
                            href={`/admin/takeads/offers/${offer.id}`}
                            className="line-clamp-1 text-sm font-medium text-sky-700 hover:underline"
                          >
                            {offer.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {offer.approvalStatus} / {offer.publicationStatus}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
