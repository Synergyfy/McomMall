'use client';

import { useMemo, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

function CheckoutForm({
  onPaymentSuccess,
}: {
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('Processing payment... Please do not close this page.');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Payment failed. Please try again.');
      toast.error(error.message || 'Payment failed.');
      setIsLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    } else {
      setMessage('Payment did not complete. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Pay Now'}
      </Button>
    </form>
  );
}

export default function StripeCheckoutForm({
  clientSecret,
  publishableKey,
  onPaymentSuccess,
}: {
  clientSecret?: string;
  /** Supplied by `GET /payments/config`; never hardcode or require a build-time key. */
  publishableKey?: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  const key =
    publishableKey ||
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    '';

  const stripePromise = useMemo(
    () => (key ? loadStripe(key) : null),
    [key],
  );

  if (!clientSecret || !stripePromise) {
    return (
      <p className="text-sm text-rose-600">
        Card payments are not configured. Please use MCOM Wallet or PayPal.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
}
