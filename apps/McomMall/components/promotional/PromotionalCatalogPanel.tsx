'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  Eye,
  Info,
  Loader2,
  MousePointerClick,
  PackageCheck,
  PoundSterling,
  Search,
  Store,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getPromotionalClickUrl,
  useGetMyAffiliatePerformance,
  useGetMyPromotionalCatalogue,
  useImportPromotionalOffer,
  useRemovePromotionalOffer,
} from '@/service/promotional-offers/hook';
import {
  PromotionalOffer,
  PromotionalOfferingType,
} from '@/service/promotional-offers/types';

interface PromotionalCatalogPanelProps {
  offeringType: PromotionalOfferingType;
}

type Filter = 'all' | 'imported' | 'available';

export default function PromotionalCatalogPanel({
  offeringType,
}: PromotionalCatalogPanelProps) {
  const { data, isLoading, isError, error } =
    useGetMyPromotionalCatalogue(offeringType);
  const { data: performance } = useGetMyAffiliatePerformance();
  const importOffer = useImportPromotionalOffer();
  const removeOffer = useRemovePromotionalOffer();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const offers = useMemo(() => {
    let list = data?.data ?? [];
    if (filter === 'imported') list = list.filter((offer) => offer.imported);
    if (filter === 'available') list = list.filter((offer) => !offer.imported);
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (offer) =>
          offer.name.toLowerCase().includes(term) ||
          offer.advertiserName?.toLowerCase().includes(term) ||
          offer.category?.toLowerCase().includes(term),
      );
    }
    return list;
  }, [data?.data, filter, search]);

  const handleImport = (offer: PromotionalOffer) => {
    importOffer.mutate(offer.id, {
      onSuccess: () =>
        toast.success(`${offer.name} added to your storefront.`),
      onError: (mutationError: any) =>
        toast.error(
          mutationError?.response?.data?.message ||
            mutationError?.message ||
            'Could not add this promotional offer.',
        ),
    });
  };

  const handleRemove = (offer: PromotionalOffer) => {
    removeOffer.mutate(offer.id, {
      onSuccess: () =>
        toast.success(`${offer.name} removed from your storefront.`),
      onError: (mutationError: any) =>
        toast.error(
          mutationError?.response?.data?.message ||
            mutationError?.message ||
            'Could not remove this promotional offer.',
        ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading promotional offers…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error instanceof Error
          ? error.message
          : 'Could not load promotional offers.'}
      </div>
    );
  }

  const importedCount = data?.data?.filter((offer) => offer.imported).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-sky-600 p-2 text-white">
            <BadgePercent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">
              MCOM promotional{' '}
              {offeringType === 'service' ? 'services' : 'products'}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              These offers are managed by MCOM and supplied by external
              advertisers. Add an offer to your storefront to promote it. You
              cannot edit its price, description, images or stock — and you can
              remove it at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <PackageCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Imported</span>
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {importedCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <MousePointerClick className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Clicks</span>
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {performance?.summary.totalClicks ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">
              Approved sales
            </span>
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {performance?.summary.approvedTransactions ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <PoundSterling className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Earnings</span>
          </div>
          <p className="mt-1 text-2xl font-black text-slate-900">
            £{(performance?.summary.businessEarnings ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'All offers' },
              { key: 'available', label: 'Available to add' },
              { key: 'imported', label: 'In my storefront' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                filter === item.key
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {item.label}
              {item.key === 'imported' ? ` (${importedCount})` : ''}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search offers or advertisers…"
            className="pl-9"
          />
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <Store className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">
            No promotional offers here yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            New offers made available to your business will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => {
            const previewUrl = getPromotionalClickUrl(offer.id, {
              businessId: data?.businessId,
              source: 'business-preview',
            });
            const isPending =
              (importOffer.isPending &&
                importOffer.variables === offer.id) ||
              (removeOffer.isPending && removeOffer.variables === offer.id);

            return (
              <div
                key={offer.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative h-44 bg-slate-100">
                  {offer.images?.[0] ? (
                    <img
                      src={offer.images[0]}
                      alt={offer.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <BadgePercent className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <Badge className="border-0 bg-sky-600 text-white hover:bg-sky-600">
                      External offer
                    </Badge>
                    {offer.imported ? (
                      <Badge className="border-0 bg-emerald-600 text-white hover:bg-emerald-600">
                        In storefront
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
                    {offer.advertiserName || 'External advertiser'}
                  </p>
                  <h4 className="mt-1 line-clamp-2 font-bold text-slate-900">
                    {offer.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {offer.shortDescription || offer.description || ''}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {offer.price !== null && offer.price !== undefined ? (
                      <span className="font-black text-slate-900">
                        £{Number(offer.salePrice ?? offer.price).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">
                        Price at advertiser
                      </span>
                    )}
                    {offer.category ? (
                      <span className="text-xs text-slate-400">
                        · {offer.category}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        Preview
                      </a>
                    </Button>
                    {offer.imported ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        disabled={isPending}
                        onClick={() => handleRemove(offer)}
                      >
                        {isPending ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 h-4 w-4" />
                        )}
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="bg-sky-600 hover:bg-sky-700"
                        disabled={isPending}
                        onClick={() => handleImport(offer)}
                      >
                        {isPending ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUpRight className="mr-1.5 h-4 w-4" />
                        )}
                        Add to store
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 flex items-start gap-1 text-[10px] text-slate-400">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    Read-only. MCOM manages this offer and its advertiser link.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
