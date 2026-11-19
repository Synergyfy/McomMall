'use client';

import { useMemo, useRef, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import {
  useInitiateMembershipPayment,
  useRecordPayment,
  useWalletTopUpConfig,
} from '@/service/payments/hooks';
import {
  PaymentGateway,
  PaymentPurpose,
  PlanType,
} from '@/service/payments/types';

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string) {
  let cached = stripePromiseCache.get(publishableKey);
  if (!cached) {
    cached = loadStripe(publishableKey);
    stripePromiseCache.set(publishableKey, cached);
  }
  return cached;
}

interface MembershipCardPanelProps {
  method: 'card' | 'paypal';
  planName: string;
  planPrice: string;
  planVariantId?: string;
  tierId?: string;
  planType?: PlanType;
  totalPrice: number;
  isTrial: boolean;
  onPaymentComplete: () => void;
}

function CardPayForm({
  clientSecret,
  amount,
  recordArgs,
  onPaymentComplete,
  onBack,
}: {
  clientSecret: string;
  amount: number;
  recordArgs: {
    planVariantId?: string;
    tierId?: string;
    planType: PlanType;
    isTrial: boolean;
  };
  onPaymentComplete: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: recordPayment, isPending: isRecording } =
    useRecordPayment();
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
      await recordPayment({
        amount,
        planType: recordArgs.planType,
        purpose: PaymentPurpose.MEMBERSHIP,
        isTrial: recordArgs.isTrial,
        paymentGateway: PaymentGateway.STRIPE,
        transactionId: result.paymentIntent.id,
        currency: 'gbp',
        tierId: recordArgs.tierId,
        planVariantId: recordArgs.planVariantId,
      });
      onPaymentComplete();
    } catch (e: any) {
      setCardError(e?.message || 'Card payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const busy = isPaying || isRecording;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Paying{' '}
        <span className="font-bold text-gray-800">£{amount.toFixed(2)}</span> by
        card — processed securely by MCOM Solutions.
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

export default function MembershipCardPanel({
  method,
  planName,
  planPrice,
  planVariantId,
  tierId,
  planType,
  totalPrice,
  isTrial,
  onPaymentComplete,
}: MembershipCardPanelProps) {
  const { data: config, isLoading: isLoadingConfig } =
    useWalletTopUpConfig(method === 'card');
  const { mutateAsync: initiatePayment, isPending: isInitiating } =
    useInitiateMembershipPayment();
  const [session, setSession] = useState<{ clientSecret: string } | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
    null,
  );
  const { mutateAsync: recordPaypalPayment, isPending: isRecordingPaypal } =
    useRecordPayment();
  const attemptKey = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `membership-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const publishableKey =
    config?.publishableKey ||
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY ||
    '';

  const stripePromise = useMemo(
    () => (publishableKey ? getStripePromise(publishableKey) : null),
    [publishableKey],
  );

  const recordPlanType = planType || PlanType.MONTHLY;

  if (method === 'paypal') {
    const handlePayPal = async () => {
      setInitError(null);
      try {
        const res = await initiatePayment({
          paymentProvider: 'paypal',
          planVariantId,
          tierId,
          planType,
          idempotencyKey: attemptKey.current,
        });
        if (!res.orderId) {
          throw new Error('PayPal did not return an order.');
        }
        setPaypalOrderId(res.orderId);
        setPaypalApprovalUrl((res as any).approvalUrl ?? null);
      } catch (e: any) {
        setInitError(e?.message || 'Could not start PayPal payment.');
      }
    };

    const handlePayPalApproved = async (orderId: string) => {
      try {
        await recordPaypalPayment({
          amount: totalPrice,
          planType: recordPlanType,
          purpose: PaymentPurpose.MEMBERSHIP,
          isTrial,
          paymentGateway: PaymentGateway.PAYPAL,
          transactionId: orderId,
          currency: 'gbp',
          tierId,
          planVariantId,
        });
        onPaymentComplete();
      } catch (e: any) {
        setInitError(e?.message || 'PayPal payment could not be completed.');
      }
    };

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs text-gray-500">
          Pay{' '}
          <span className="font-bold text-gray-800">
            £{totalPrice.toFixed(2)}
          </span>{' '}
          with PayPal — processed securely by MCOM Pay.
        </p>
        {initError && (
          <p className="mt-2 text-xs font-semibold text-red-600">{initError}</p>
        )}
        {paypalOrderId ? (
          <div className="mt-4">
            <PayPalCheckoutButton
              orderID={paypalOrderId}
              approvalUrl={paypalApprovalUrl}
              onPaymentSuccess={handlePayPalApproved}
            />
          </div>
        ) : (
          <Button
            type="button"
            onClick={handlePayPal}
            disabled={isInitiating || isRecordingPaypal}
            className="mt-4 h-12 w-full rounded-xl bg-[#ffc439] text-sm font-bold text-[#003087] hover:bg-[#f5b800] disabled:opacity-50"
          >
            {isInitiating ? 'Starting…' : 'Continue with PayPal'}
          </Button>
        )}
      </div>
    );
  }

  if (isLoadingConfig && !stripePromise) {
    return <p className="text-sm text-gray-500">Loading card payment…</p>;
  }

  const isCardAvailable =
    !!stripePromise && (config?.cardTopUpAvailable ?? true);

  if (!isCardAvailable) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 p-3">
        <p className="text-xs font-semibold text-red-700">
          Card payments aren&apos;t available right now. Please pay with your
          MCOM Wallet instead.
        </p>
      </div>
    );
  }

  if (session) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: session.clientSecret }}
      >
        <CardPayForm
          clientSecret={session.clientSecret}
          amount={totalPrice}
          recordArgs={{
            planVariantId,
            tierId,
            planType: recordPlanType,
            isTrial,
          }}
          onPaymentComplete={onPaymentComplete}
          onBack={() => setSession(null)}
        />
      </Elements>
    );
  }

  const handleStart = async () => {
    setInitError(null);
    try {
      const res = await initiatePayment({
        paymentProvider: 'stripe',
        planVariantId,
        tierId,
        planType,
        idempotencyKey: attemptKey.current,
      });
      if (!res.clientSecret) {
        throw new Error('Card payment could not be started.');
      }
      setSession({ clientSecret: res.clientSecret });
    } catch (e: any) {
      setInitError(e?.message || 'Could not start card payment.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-500">
        <CreditCard className="h-4 w-4" /> Pay by card
      </h4>
      <p className="mt-1 text-xs text-gray-500">
        Charged in GBP by MCOM Solutions — your wallet balance is untouched.
      </p>
      {initError && (
        <p className="mt-2 text-xs font-semibold text-red-600">{initError}</p>
      )}
      <Button
        type="button"
        onClick={handleStart}
        disabled={isInitiating}
        className="mt-4 h-12 w-full rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isInitiating
          ? 'Starting…'
          : `Continue · £${totalPrice.toFixed(2)}`}
      </Button>
    </div>
  );
}
