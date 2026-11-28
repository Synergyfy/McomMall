'use client';

import { useState } from 'react';
import { BadgePercent, Loader2, Search } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TakeadsOfferCard from '@/components/takeads/TakeadsOfferCard';
import {
  useGetBusinessTakeadsDeals,
  useRecordBusinessTakeadsClick,
} from '@/service/takeads/hook';
import { PublicTakeadsOffer } from '@/service/takeads/types';

export default function AffiliateDealsPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const click = useRecordBusinessTakeadsClick();

  const { data, isLoading, isError } = useGetBusinessTakeadsDeals({
    q: query || undefined,
    page,
    limit: 12,
  });

  const openDeal = async (offer: PublicTakeadsOffer) => {
    try {
      const result = await click.mutateAsync({
        id: offer.id,
        source: 'business-dashboard',
        placement: 'affiliate-deals',
      });
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not open this deal.',
      );
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">
              Affiliate Deals
            </h1>
            <Badge className="border-violet-200 bg-violet-50 text-violet-700">
              Plan-only
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Partner offers reserved for your current MCOM plan. These deals are
            hidden from the public deals page.
          </p>
          {data?.planLabel && (
            <p className="mt-2 text-xs font-semibold text-slate-600">
              Your plan: {data.planLabel}
            </p>
          )}
        </div>
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
                  setQuery(search.trim());
                  setPage(1);
                }
              }}
              placeholder="Search partner deals or merchants"
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setQuery(search.trim());
              setPage(1);
            }}
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your partner deals…
        </div>
      ) : isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-sm text-red-700">
            Could not load your plan-only affiliate deals. Please try again.
          </CardContent>
        </Card>
      ) : !data?.data.length ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BadgePercent className="h-10 w-10 text-slate-300" />
            <p className="font-bold text-slate-800">No partner deals yet</p>
            <p className="max-w-md text-sm text-slate-500">
              {data?.planVariantId
                ? 'No published plan-only deals are targeted to your current plan variant.'
                : 'Your current membership does not include plan-only partner deals.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((offer) => (
            <TakeadsOfferCard
              key={offer.id}
              offer={offer}
              source="business-dashboard"
              onCtaClick={openDeal}
              ctaLoading={click.isPending}
            />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {data.page} of {data.totalPages} · {data.total} deals
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
