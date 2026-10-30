'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type RewardValidation = {
  valid: boolean;
  reason?: string;
  type?: 'gift_card' | 'voucher' | 'coupon';
  businessId?: string | null;
  balance?: number;
  currency?: string;
  expiresAt?: string | null;
  eligibleForListing?: boolean;
  scope?: {
    mode: string;
    listingIds?: string[];
    productIds?: string[];
    serviceIds?: string[];
  };
  eligibleProductIds?: string[];
  eligibleServiceIds?: string[];
};

function apiBase(): string {
  const url =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mcom-mall-api.vercel.app/api/v1';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Deep-link banner for `/listings/[id]?reward=<code>`.
 *
 * Never crashes on an unknown/expired code. The code is only revealed on
 * demand and must still pass ownership checks when consumed at checkout.
 */
export default function RewardBanner({ listingId }: { listingId: string }) {
  const searchParams = useSearchParams();
  const rewardCode = searchParams.get('reward');
  const [state, setState] = useState<RewardValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!rewardCode) return;
    let cancelled = false;
    setLoading(true);

    fetch(
      `${apiBase()}/public/rewards/instruments/${encodeURIComponent(
        rewardCode,
      )}?listingId=${encodeURIComponent(listingId)}`,
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState({ valid: false, reason: 'VALIDATION_FAILED' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rewardCode, listingId]);

  if (!rewardCode || loading) return null;
  if (!state?.valid || state.eligibleForListing === false) {
    return (
      <div className="max-w-400 mx-auto px-8 pt-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
          This reward code is not available for this business.
        </div>
      </div>
    );
  }

  const amount = Number(state.balance ?? 0).toFixed(2);
  const symbol = state.currency === 'GBP' || !state.currency ? '£' : '';
  const eligibleCount =
    (state.eligibleProductIds?.length ?? 0) +
    (state.eligibleServiceIds?.length ?? 0);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(rewardCode);
      setCopied(true);
      // Persist for the checkout coupon/gift-card field.
      try {
        sessionStorage.setItem('mcom-reward-code', rewardCode);
      } catch {
        // ignore storage restrictions
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setRevealed(true);
    }
  };

  return (
    <div className="max-w-400 mx-auto px-8 pt-4">
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-black text-gray-900">
              You have a {symbol}
              {amount} reward for this business
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Use it at checkout. It applies only to eligible items from this
              business.
              {eligibleCount > 0
                ? ` ${eligibleCount} eligible item(s) are highlighted on this page.`
                : ''}
            </p>
            {state.expiresAt ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                Expires {new Date(state.expiresAt).toLocaleDateString()}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRevealed((value) => !value)}
              className="rounded-xl border border-orange-300 bg-white px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-50"
            >
              {revealed ? 'Hide code' : 'Show code'}
            </button>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-xl bg-[#f58220] px-4 py-2 text-sm font-bold text-white hover:bg-[#e67a1d]"
            >
              {copied ? 'Copied' : 'Copy code'}
            </button>
          </div>
        </div>
        {revealed ? (
          <p className="mt-3 rounded-lg bg-white px-3 py-2 font-mono text-sm tracking-widest text-gray-800">
            {rewardCode}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-gray-500">
          The reward must be used by the recipient signed in to MCOM Mall.
        </p>
      </div>
    </div>
  );
}
