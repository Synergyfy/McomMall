'use client';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey) {
  console.error('Stripe publishable key is missing!');
}

const stripePromise = loadStripe(stripePublishableKey);

interface StripeCheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: (transactionId: string) => void;
}

function CheckoutForm({ clientSecret, onPaymentSuccess }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePublishableKey) {
        setErrorMessage('Payment configuration error. Please contact support.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Retrieve the payment intent first to check its current status
      const { paymentIntent: currentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      if (currentIntent?.status === 'succeeded') {
        onPaymentSuccess(currentIntent.id);
        setIsLoading(false);
        return;
      }

      // 2. Only confirm if not already succeeded
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
            return_url: window.location.href,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
         toast.info('Payment is processing. We will update you shortly.');
      } else {
         if (!error && !paymentIntent) {
             toast.error('Something went wrong. Please try again.');
         }
      }
    } catch (err) {
        toast.error('An unexpected error occurred.');
        console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && <div className="text-red-500 mt-2 text-sm">{errorMessage}</div>}
      <Button
        disabled={isLoading || !stripe || !elements}
        className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  );
}

export function StripeCheckoutForm({ clientSecret, onPaymentSuccess }: StripeCheckoutFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
}
