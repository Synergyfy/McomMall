'use client';

import { FC, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Handshake,
  Loader2,
  MapPin,
  Search,
  Store,
  Users,
} from 'lucide-react';
import api from '@/service/api';
import { BusinessCard } from '../shared/BusinessCard';

interface PartnerCandidate {
  businessId: string;
  userId: string;
  businessName: string;
  ownerName: string;
  ownerAvatarUrl?: string | null;
  logoUrl?: string | null;
  category: string;
  description?: string | null;
  address?: string | null;
  postcode?: string | null;
  isVerified?: boolean;
  matchPercent?: number;
  matchLabel?: string;
  distanceMiles?: number | null;
  partnershipStatus?:
    | 'none'
    | 'pending_sent'
    | 'pending_received'
    | 'partners'
    | 'declined';
}

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
  businessName: string;
  boroughName: string;
}

type SortMode = 'closest' | 'farthest' | 'match' | 'name';

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: 'closest', label: 'Closest first' },
  { value: 'farthest', label: 'Farthest first' },
  { value: 'match', label: 'Best match' },
  { value: 'name', label: 'Name A–Z' },
];

const RADIUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Any distance' },
  { value: '1', label: 'Within 1 mile' },
  { value: '3', label: 'Within 3 miles' },
  { value: '5', label: 'Within 5 miles' },
  { value: '10', label: 'Within 10 miles' },
  { value: '25', label: 'Within 25 miles' },
];

const initials = (value?: string | null) =>
  (value || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const HomeScreen: FC<HomeScreenProps> = ({
  mallData,
  businessName,
  boroughName,
}) => {
  const mallName = mallData?.mallName || 'your local mall';
  const candidates: PartnerCandidate[] = useMemo(
    () => mallData?.partnerCandidates || [],
    [mallData],
  );

  const city = mallData?.city || '';
  const borough = mallData?.borough || boroughName || '';
  const highStreet =
    mallData?.highStreet || mallData?.mall?.primaryHighStreet || '';
  const postcodes: string[] = mallData?.postcodes || [];

  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('closest');
  const [statuses, setStatuses] = useState<
    Record<string, PartnerCandidate['partnershipStatus']>
  >({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const maxMiles = radius ? Number(radius) : null;

    const matched = candidates.filter((candidate) => {
      if (maxMiles != null) {
        if (
          candidate.distanceMiles == null ||
          candidate.distanceMiles > maxMiles
        ) {
          return false;
        }
      }
      if (!term) return true;
      return (
        candidate.businessName.toLowerCase().includes(term) ||
        candidate.category.toLowerCase().includes(term) ||
        (candidate.postcode || '').toLowerCase().includes(term) ||
        (candidate.ownerName || '').toLowerCase().includes(term)
      );
    });

    const distanceOf = (candidate: PartnerCandidate) =>
      candidate.distanceMiles ?? Number.POSITIVE_INFINITY;

    return [...matched].sort((a, b) => {
      switch (sortBy) {
        case 'farthest': {
          const aDistance =
            a.distanceMiles == null
              ? Number.NEGATIVE_INFINITY
              : a.distanceMiles;
          const bDistance =
            b.distanceMiles == null
              ? Number.NEGATIVE_INFINITY
              : b.distanceMiles;
          const diff = bDistance - aDistance;
          return diff !== 0
            ? diff
            : (b.matchPercent ?? 0) - (a.matchPercent ?? 0);
        }
        case 'match': {
          const diff = (b.matchPercent ?? 0) - (a.matchPercent ?? 0);
          return diff !== 0 ? diff : distanceOf(a) - distanceOf(b);
        }
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        case 'closest':
        default: {
          const diff = distanceOf(a) - distanceOf(b);
          return diff !== 0
            ? diff
            : (b.matchPercent ?? 0) - (a.matchPercent ?? 0);
        }
      }
    });
  }, [candidates, query, radius, sortBy]);

  const statusOf = (candidate: PartnerCandidate) =>
    statuses[candidate.userId] ?? candidate.partnershipStatus ?? 'none';

  const handlePartner = async (candidate: PartnerCandidate) => {
    if (sendingId) return;
    setSendingId(candidate.userId);
    setError(null);

    try {
      await api.post('partnerships/user-request', {
        targetUserId: candidate.userId,
        message: `Hi ${candidate.ownerName}, we'd like to explore a partnership with ${candidate.businessName} through ${mallName}.`,
      });
      setStatuses((prev) => ({
        ...prev,
        [candidate.userId]: 'pending_sent',
      }));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Could not send the partnership request. Please try again.',
      );
    } finally {
      setSendingId(null);
    }
  };

  const hierarchy = [
    { label: 'City', value: city, icon: Building2 },
    { label: 'Borough', value: borough, icon: MapPin },
    { label: 'High street', value: highStreet, icon: Store },
    { label: 'Local mall', value: mallName, icon: Handshake },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="flex flex-col gap-5">
      {/* Local mall banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-5 md:p-6 text-white shadow-md">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-black/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            <Store className="h-3.5 w-3.5" /> Local Mall
          </div>
          <h1 className="mt-1 text-xl md:text-2xl font-black tracking-tight">
            {mallName}
          </h1>
          <p className="mt-1 text-[11px] text-white/80">
            {postcodes.length > 0
              ? `Covering ${postcodes.join(', ')}`
              : businessName
                ? `Signed in as ${businessName}`
                : 'Your local business ecosystem'}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {hierarchy.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm border border-white/15"
              >
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
                  <item.icon className="h-3 w-3" /> {item.label}
                </div>
                <p className="mt-0.5 truncate text-xs font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-1 border-t border-white/20 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base md:text-lg font-black tracking-tight">
                Businesses you can partner with
              </h2>
              <p className="text-[11px] text-white/80">
                Partner-ready businesses in your local mall.
              </p>
            </div>
            <span className="mt-1 sm:mt-0 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold backdrop-blur-sm">
              <Users className="h-3.5 w-3.5" />
              {candidates.length} business{candidates.length === 1 ? '' : 'es'}
            </span>
          </div>
        </div>
      </div>

      {/* Search, radius and sort */}
      <div className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses, categories or postcodes..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
          />
        </div>

        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 sm:flex-none">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              Radius
            </span>
            <select
              value={radius}
              onChange={(event) => setRadius(event.target.value)}
              className="w-full sm:w-auto rounded-xl border border-gray-150 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {RADIUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1 sm:flex-none">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              Sort by
            </span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortMode)}
              className="w-full sm:w-auto rounded-xl border border-gray-150 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-gray-400">
        <span>
          Showing {filtered.length} of {candidates.length}
        </span>
        {(query || radius) && (
          <button
            onClick={() => {
              setQuery('');
              setRadius('');
            }}
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((candidate) => {
          const status = statusOf(candidate);
          const isSending = sendingId === candidate.userId;

          return (
            <div
              key={candidate.businessId}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-sm shrink-0 border border-orange-100 overflow-hidden">
                  {candidate.logoUrl ? (
                    <img
                      src={candidate.logoUrl}
                      alt={candidate.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials(candidate.businessName)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-black text-gray-900 leading-tight truncate">
                      {candidate.businessName}
                    </h3>
                    {typeof candidate.matchPercent === 'number' && (
                      <span
                        title={candidate.matchLabel}
                        className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700"
                      >
                        {candidate.matchPercent}% match
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-500 truncate">
                    {candidate.category}
                  </p>
                  {candidate.matchLabel && (
                    <p className="text-[9px] font-medium text-gray-400 truncate">
                      {candidate.matchLabel}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {[candidate.address, candidate.postcode]
                      .filter(Boolean)
                      .join(', ') || mallName}
                  </p>
                </div>
              </div>

              {candidate.description && (
                <p className="text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                  {candidate.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span className="truncate">{candidate.ownerName}</span>
                {candidate.distanceMiles != null && (
                  <span className="ml-auto shrink-0 font-bold text-gray-500">
                    {candidate.distanceMiles} mi away
                  </span>
                )}
              </div>

              {candidate.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified business
                </span>
              )}

              <div className="mt-auto">
                {status === 'none' && (
                  <button
                    onClick={() => handlePartner(candidate)}
                    disabled={Boolean(sendingId)}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-150"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Handshake className="w-4 h-4" />
                    )}
                    {isSending ? 'Sending request…' : 'Partner with them'}
                  </button>
                )}

                {status === 'pending_sent' && (
                  <div className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4" /> Request sent
                  </div>
                )}

                {status === 'pending_received' && (
                  <div className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4" /> Awaiting your response
                  </div>
                )}

                {status === 'partners' && (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Already partners
                  </div>
                )}

                {status === 'declined' && (
                  <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center gap-1.5">
                    Request declined
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">
            {candidates.length === 0
              ? `No partner-ready businesses in ${mallName} yet`
              : 'No businesses match your filters'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {candidates.length === 0
              ? 'Businesses appear here once they have a storefront in your local mall.'
              : 'Try a larger radius, a different search term or another sort option.'}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── CUSTOMER LOCAL MALL HOME ────────────────────────────────────────────────
interface CustomerMallHomeProps {
  onNavigate: (screen: string) => void;
  mallData: any;
  customerName: string;
}

/**
 * Customer-facing local mall landing page.
 *
 * Customers browse the published businesses assigned to their Central local
 * mall and open a merchant's listing/profile. Partnership actions are reserved
 * for business owners and deliberately absent here.
 */
export const CustomerMallHome: FC<CustomerMallHomeProps> = ({
  onNavigate,
  mallData,
  customerName,
}) => {
  const router = useRouter();
  const mallName = mallData?.mallName || 'Your local mall';
  const businesses: any[] = useMemo(
    () => mallData?.businesses || [],
    [mallData],
  );
  const nearbyDeals: any[] = mallData?.nearbyDeals || [];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return businesses;
    return businesses.filter(
      (business) =>
        String(business.businessName || '')
          .toLowerCase()
          .includes(term) ||
        String(business.category || '')
          .toLowerCase()
          .includes(term) ||
        String(business.shortDescription || '')
          .toLowerCase()
          .includes(term),
    );
  }, [businesses, query]);

  const hierarchy = [
    { label: 'Local mall', value: mallData?.mallName, icon: Store },
    { label: 'City', value: mallData?.city, icon: Building2 },
    { label: 'Borough', value: mallData?.borough, icon: MapPin },
    { label: 'High street', value: mallData?.highStreet, icon: MapPin },
    { label: 'Postcode', value: mallData?.postcode, icon: MapPin },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-5 md:p-6 text-white shadow-md">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-black/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            <Store className="h-3.5 w-3.5" /> Local Mall
          </div>
          <h1 className="mt-1 text-xl md:text-2xl font-black tracking-tight">
            {mallName}
          </h1>
          <p className="mt-1 text-[11px] text-white/80">
            {customerName ? `Hi ${customerName}, ` : ''}
            explore the businesses in your local mall.
          </p>

          {hierarchy.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {hierarchy.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm border border-white/15"
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
                    <item.icon className="h-3 w-3" /> {item.label}
                  </div>
                  <p className="mt-0.5 truncate text-xs font-bold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {nearbyDeals.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-black text-gray-900">
              Offers near you
            </h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {nearbyDeals.slice(0, 5).map((deal: any, index: number) => (
              <div
                key={`${deal.business}-${deal.deal}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/60 border border-orange-100 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {deal.deal}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-400 truncate">
                    {deal.business}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-orange-600">
                    +{deal.points} pts
                  </p>
                  <p className="text-[9px] font-semibold text-gray-400">
                    {deal.expires} left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            Businesses in your mall
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Open a storefront to see its listing, offers and contact details.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses or categories..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((business) => (
            <BusinessCard
              key={business.id}
              id={business.id}
              name={business.businessName}
              category={business.category || 'Store'}
              description={
                business.shortDescription || 'No description provided.'
              }
              address={business.address || ''}
              isClaimed={business.isClaimed}
              isVerified={business.isVerified}
              logoUrl={business.logoUrl}
              viewLabel="View Listing"
              onViewProfile={(id) =>
                router.push(`/listings/${id}?source=in-house`)
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <Store className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">
              {businesses.length === 0
                ? `No businesses listed in ${mallName} yet`
                : 'No businesses match your search'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {businesses.length === 0
                ? 'Published merchants assigned to your local mall will appear here.'
                : 'Try a different name or category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
