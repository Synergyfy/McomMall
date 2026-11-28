'use client';

import { useState } from 'react';
import { Loader2, Search, Sparkles, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TakeadsOfferCard from '@/components/takeads/TakeadsOfferCard';
import { useGetPublicTakeadsDeals } from '@/service/takeads/hook';

const PAGE_SIZE = 12;

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetPublicTakeadsDeals({
    q: query || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-28">
      <div className="container mx-auto px-4">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-8 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <Badge className="mb-3 border-0 bg-white/20 text-white hover:bg-white/20">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                External merchant offers
              </Badge>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Deals &amp; Coupons
              </h1>
              <p className="mt-2 text-sm text-sky-50 sm:text-base">
                Explore eligible promotions and coupons from participating
                merchants. You complete the purchase on the merchant&apos;s
                website.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm backdrop-blur">
              <p className="font-semibold">How it works</p>
              <ul className="mt-2 space-y-1 text-sky-50">
                <li>1. Choose an offer.</li>
                <li>2. Continue to the merchant.</li>
                <li>3. Complete the purchase there.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setQuery(search);
                  setPage(1);
                }
              }}
              placeholder="Search deals, merchants or brands"
              className="h-11 rounded-xl bg-white pl-9"
            />
          </div>
          <Button
            className="h-11 rounded-xl bg-sky-600 px-6 hover:bg-sky-700"
            onClick={() => {
              setQuery(search);
              setPage(1);
            }}
          >
            Search deals
          </Button>
          {query && (
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => {
                setSearch('');
                setQuery('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading deals…
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
            Deals are temporarily unavailable. Please try again shortly.
          </div>
        ) : !data?.data.length ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Tag className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No deals available right now
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              New merchant promotions appear here once MCOM Mall approves them.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                {data.total} deal{data.total === 1 ? '' : 's'} available
              </span>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.data.map((offer) => (
                <TakeadsOfferCard
                  key={offer.id}
                  offer={offer}
                  source="deals"
                />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={data.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="px-3 text-sm text-gray-500">
                  {data.page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        <p className="mt-10 text-center text-xs text-gray-400">
          MCOM Mall may earn a commission from qualifying purchases. Offers are
          supplied by external merchants and are subject to their terms.
        </p>
      </div>
    </div>
  );
}
