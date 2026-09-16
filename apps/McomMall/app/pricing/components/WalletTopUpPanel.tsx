'use client';

import { useMemo, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useConfirmWalletTopUp,
  useInitiateWalletTopUp,
  useWalletTopUpConfig,
} from '@/service/payments/hooks';

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string) {
  let cached = stripePromiseCache.get(publishableKey);
  if (!cached) {
    cached = loadStripe(publishableKey);
    stripePromiseCache.set(publishableKey, cached);
  }
  return cached;
}

interface WalletTopUpPanelProps {
  /** Suggested top-up (usually the exact shortfall vs plan price). */
  suggestedAmount: number;
  topUpUrl?: string;
  onTopUpComplete: () => void;
}

function TopUpCardForm({
  clientSecret,
  topUpRequestId,
  amount,
  onBack,
  onTopUpComplete,
}: {
  clientSecret: string;
  topUpRequestId: string;
  amount: number;
  onBack: () => void;
  onTopUpComplete: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: confirmTopUp, isPending: isConfirming } =
    useConfirmWalletTopUp();
  const [cardError, setCardError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setCardError(null);
    setIsPaying(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card form not ready. Please try again.');
      // Card details go browser -> Stripe (Solutions' account) only.
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (result.error) {
        throw new Error(
          result.error.message || 'Card payment failed. Please try again.',
        );
      }
      await confirmTopUp({
        topUpRequestId,
        paymentIntentId: result.paymentIntent.id,
      });
      onTopUpComplete();
    } catch (e: any) {
      setCardError(e?.message || 'Card payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const busy = isPaying || isConfirming;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Paying <span className="font-bold text-gray-800">£{amount.toFixed(2)}</span> by
        card — processed securely by MCOM Solutions into your wallet.
      </p>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
        <CardElement
          options={{
            style: {
              base: { fontSize: '14px', color: '#1f2937' },
              invalid: { color: '#dc2626' },
            },
          }}
        />
      </div>
      {cardError && (
        <p className="text-xs font-semibold text-red-600">{cardError}</p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={busy}
          className="h-11 rounded-xl text-xs font-bold text-gray-500"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handlePay}
          disabled={busy || !stripe || !elements}
          className="h-11 flex-1 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </span>
          ) : (
            `Pay £${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}

export default function WalletTopUpPanel({
  suggestedAmount,
  topUpUrl,
  onTopUpComplete,
}: WalletTopUpPanelProps) {
  const { data: config, isLoading: isLoadingConfig } =
    useWalletTopUpConfig(true);
  const { mutateAsync: initiateTopUp, isPending: isInitiating } =
    useInitiateWalletTopUp();

  const min = config?.limits?.min ?? 5;
  const max = config?.limits?.max ?? 500;
  const clamp = (value: number) =>
    Math.min(max, Math.max(min, Math.round(value * 100) / 100));
  const [amount, setAmount] = useState<number>(() => clamp(suggestedAmount));
  const [session, setSession] = useState<{
    clientSecret: string;
    topUpRequestId: string;
    amount: number;
  } | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const stripePromise = useMemo(
    () =>
      config?.publishableKey
        ? getStripePromise(config.publishableKey)
        : null,
    [config?.publishableKey],
  );

  if (isLoadingConfig) {
    return (
      <p className="mt-3 text-xs text-gray-500">Loading card top-up…</p>
    );
  }

  if (!config?.cardTopUpAvailable || !stripePromise) {
    return (
      <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3">
        <p className="text-xs font-semibold text-red-700">
          In-checkout card top-up isn&apos;t available right now. Top up your
          MCOM Wallet to continue.
        </p>
        {topUpUrl && (
          <a
            href={topUpUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-block text-xs font-bold text-red-800 underline"
          >
            Top up wallet →
          </a>
        )}
      </div>
    );
  }

  if (session) {
    return (
      <div className="mt-3">
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: session.clientSecret }}
        >
          <TopUpCardForm
            clientSecret={session.clientSecret}
            topUpRequestId={session.topUpRequestId}
            amount={session.amount}
            onBack={() => setSession(null)}
            onTopUpComplete={onTopUpComplete}
          />
        </Elements>
      </div>
    );
  }

  const handleStart = async () => {
    setInitError(null);
    try {
      const res = await initiateTopUp({ amount: clamp(amount), currency: 'GBP' });
      setSession({
        clientSecret: res.clientSecret,
        topUpRequestId: res.topUpRequestId,
        amount: res.amount,
      });
    } catch (e: any) {
      setInitError(e?.message || 'Could not start card top-up.');
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-500">
        <CreditCard className="h-4 w-4" /> Top up by card
      </h4>
      <p className="mt-1 text-xs text-gray-500">
        Charged in GBP by MCOM Solutions, credited to your wallet as MCOM.
      </p>
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
            £
          </span>
          <input
            type="number"
            min={min}
            max={max}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-8 pr-4 text-sm font-bold text-gray-800 focus:border-[#ff6900] focus:bg-white focus:outline-none"
          />
        </div>
        <Button
          type="button"
          onClick={handleStart}
          disabled={isInitiating}
          className="h-[46px] rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isInitiating ? 'Starting…' : 'Continue'}
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400">
        Min £{min.toFixed(2)} · max £{max.toFixed(2)} per top-up.
      </p>
      {initError && (
        <p className="mt-2 text-xs font-semibold text-red-600">{initError}</p>
      )}
    </div>
  );
}
