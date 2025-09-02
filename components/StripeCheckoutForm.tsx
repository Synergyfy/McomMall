'use client';

import { useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useStripePayment } from '@/hooks/useStripePayment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.href}&stripe_redirect=true`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      // This part is not reached because the user is redirected.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe}
        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
      >
        Pay Now
      </Button>
    </form>
  );
}

export default function StripeCheckoutForm({
  totalPrice,
}: {
  totalPrice: number;
}) {
  const {
    mutate: createPaymentIntent,
    data,
    isPending,
  } = useStripePayment();
  const clientSecret = data?.client_secret;

  useEffect(() => {
    if (totalPrice > 0) {
      createPaymentIntent(totalPrice);
    }
  }, [totalPrice, createPaymentIntent]);

  if (isPending) {
    return <div>Loading payment form...</div>;
  }

  if (!clientSecret) {
    return <div>Could not initialize payment.</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}
