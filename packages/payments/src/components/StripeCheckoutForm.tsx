'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

export interface StripeCheckoutFormProps {
  clientSecret?: string;
  /** Called with the provider transaction id once the card has settled. */
  onPaymentSuccess?: (transactionId: string) => void;
  /** Alias used by older admin call sites. */
  onSuccess?: (transactionId: string) => void;
  /** Local checkout intent id — lets the return page recover the payment. */
  paymentIntentId?: string;
  /**
   * Supplied by `GET /payments/config`; never hardcode or require a build-time
   * key. Falls back to the public env var for customer flows.
   */
  publishableKey?: string;
  disabled?: boolean;
  payLabel?: string;
}

const stripePromiseCache = new Map<string, ReturnType<typeof loadStripe>>();

function getStripePromise(key: string) {
  let cached = stripePromiseCache.get(key);
  if (!cached) {
    cached = loadStripe(key);
    stripePromiseCache.set(key, cached);
  }
  return cached;
}

function CheckoutForm({
  clientSecret,
  onPaymentSuccess,
  paymentIntentId,
  disabled,
  payLabel,
}: {
  clientSecret: string;
  onPaymentSuccess: (transactionId: string) => void;
  paymentIntentId?: string;
  disabled?: boolean;
  payLabel?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Retrieve the payment intent first to check its current status.
      const { paymentIntent: currentIntent } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (currentIntent?.status === 'succeeded') {
        onPaymentSuccess(currentIntent.id);
        setIsLoading(false);
        return;
      }

      // 2. Only confirm if not already succeeded.
      // Stripe appends payment_intent / payment_intent_client_secret /
      // redirect_status to return_url. Add our own marker so the checkout page
      // can verify a redirect-based method instead of showing the form again.
      const returnUrl = new URL(window.location.href);
      returnUrl.searchParams.set('stripe_redirect', '1');
      if (paymentIntentId) {
        returnUrl.searchParams.set('paymentIntentId', paymentIntentId);
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: returnUrl.toString(),
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        toast.info('Payment is processing. We will update you shortly.');
      } else if (!error && !paymentIntent) {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      toast.error('An unexpected error occurred.');
      console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && (
        <div className="mt-2 text-sm text-red-500">{errorMessage}</div>
      )}
      <button
        type="submit"
        disabled={disabled || isLoading || !stripe || !elements}
        className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : (payLabel ?? 'Pay now')}
      </button>
    </form>
  );
}

/**
 * The one card form used by every mall/admin payment flow.
 *
 * Card charges are created by MCOM Pay, so the browser must use the
 * publishable key of Central's Stripe account — never the mall's own key.
 */
export function StripeCheckoutForm({
  clientSecret,
  onPaymentSuccess,
  onSuccess,
  paymentIntentId,
  publishableKey,
  disabled,
  payLabel,
}: StripeCheckoutFormProps) {
  const key =
    publishableKey ||
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    '';

  useEffect(() => {
    if (!key) {
      console.error('MCOM Solutions Stripe publishable key is missing!');
    }
  }, [key]);

  const stripePromise = useMemo(
    () => (key ? getStripePromise(key) : null),
    [key],
  );

  const notify = onPaymentSuccess ?? onSuccess;

  if (!clientSecret || !stripePromise || !notify) {
    return (
      <p className="text-sm text-rose-600">
        Card payments are not configured. Please use MCOM Wallet or PayPal.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        clientSecret={clientSecret}
        onPaymentSuccess={notify}
        paymentIntentId={paymentIntentId}
        disabled={disabled}
        payLabel={payLabel}
      />
    </Elements>
  );
}
