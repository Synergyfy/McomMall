'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgePercent,
  Edit,
  ExternalLink,
  Loader2,
  Package,
  Plus,
  Power,
  Search,
  Sparkles,
  Store,
  Trash2,
  Users,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDeletePromotionalOffer,
  useGetPromotionalOfferStats,
  useGetPromotionalOffers,
  useUpdatePromotionalOffer,
} from '@/service/promotional-offers/hook';
import {
  AdminPromotionalOffer,
  PromotionalOfferFilters,
  PromotionalOfferingType,
  PromotionalOfferStatus,
} from '@/service/promotional-offers/types';

const statusStyles: Record<PromotionalOfferStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'orange',
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'orange' | 'sky' | 'emerald' | 'slate';
}) {
  const tones = {
    orange: 'bg-orange-100 text-orange-600',
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PromotionalOffersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PromotionalOfferFilters>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const [offerToArchive, setOfferToArchive] =
    useState<AdminPromotionalOffer | null>(null);

  const { data: stats } = useGetPromotionalOfferStats();
  const { data, isLoading, isError, error } = useGetPromotionalOffers(filters);
  const archiveOffer = useDeletePromotionalOffer();
  const updateOffer = useUpdatePromotionalOffer();

  const applySearch = () => {
    setFilters((current) => ({ ...current, search, page: 1 }));
  };

  const handleArchive = () => {
    if (!offerToArchive) return;
    archiveOffer.mutate(offerToArchive.id, {
      onSuccess: () => setOfferToArchive(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Promotional Products &amp; Services
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            External advertiser offers that MCOM can make available to selected
            businesses. These are separate from merchant-owned catalogue items.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/admin/promotional-offers/new/product">
              <Plus className="mr-2 h-4 w-4" />
              New promotional product
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/promotional-offers/new/service">
              <Plus className="mr-2 h-4 w-4" />
              New promotional service
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/affiliate">
              <BadgePercent className="mr-2 h-4 w-4" />
              Affiliate reporting
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total offers"
          value={stats?.total ?? 0}
          icon={BadgePercent}
        />
        <StatCard
          label="Live offers"
          value={stats?.active ?? 0}
          icon={Sparkles}
          tone="emerald"
        />
        <StatCard
          label="Storefront imports"
          value={stats?.imported ?? 0}
          icon={Store}
          tone="sky"
        />
        <StatCard
          label="Affiliate clicks"
          value={stats?.clicks ?? 0}
          icon={Users}
          tone="slate"
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applySearch();
                }}
                placeholder="Search by offer, advertiser or category…"
                className="pl-9"
              />
            </div>
            <Select
              value={filters.offeringType ?? 'all'}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  offeringType:
                    value === 'all'
                      ? undefined
                      : (value as PromotionalOfferingType),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-full lg:w-[170px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="offer">Offers</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status:
                    value === 'all'
                      ? undefined
                      : (value as PromotionalOfferStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-full lg:w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applySearch} variant="secondary">
              Search
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Imports</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-orange-500" />
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-red-600"
                    >
                      {error instanceof Error
                        ? error.message
                        : 'Could not load promotional offers.'}
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length ? (
                  data.data.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 overflow-hidden rounded-lg border bg-slate-100">
                            {offer.images?.[0] ? (
                              <img
                                src={offer.images[0]}
                                alt={offer.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-300">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {offer.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {offer.category || 'Uncategorised'}
                              {offer.sector ? ` · ${offer.sector}` : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {offer.offeringType}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-700">
                          {offer.advertiserName || '—'}
                        </p>
                        {offer.advertiserId ? (
                          <p className="text-xs text-slate-400">
                            ID {offer.advertiserId}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {offer.price !== null && offer.price !== undefined
                          ? `£${Number(offer.salePrice ?? offer.price).toFixed(2)}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {offer.availability === 'all'
                            ? 'All businesses'
                            : `${offer.selectedBusinesses?.length ?? 0} selected`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900">
                          {offer.importedCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[offer.status]}
                        >
                          {offer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Preview advertiser page"
                            asChild
                          >
                            <a
                              href={offer.destinationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              offer.status === 'active'
                                ? 'Deactivate offer'
                                : 'Activate offer'
                            }
                            onClick={() =>
                              updateOffer.mutate({
                                id: offer.id,
                                payload: {
                                  status:
                                    offer.status === 'active'
                                      ? 'inactive'
                                      : 'active',
                                },
                              })
                            }
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            onClick={() =>
                              router.push(
                                `/admin/promotional-offers/${offer.id}/edit`,
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Archive"
                            className="text-red-600"
                            onClick={() => setOfferToArchive(offer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <BadgePercent className="h-8 w-8 text-slate-300" />
                        <p className="font-semibold">
                          No promotional offers yet
                        </p>
                        <p className="text-sm">
                          Create an external product or service to make it
                          available to businesses.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
        </CardContent>
      </Card>

      <AlertDialog
        open={!!offerToArchive}
        onOpenChange={(open) => !open && setOfferToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this promotional offer?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from the marketplace and from any business
              storefronts that imported it. Existing click and transaction
              history is retained.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={archiveOffer.isPending}
            >
              {archiveOffer.isPending ? 'Archiving…' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
