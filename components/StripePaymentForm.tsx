'use client';

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';

interface StripePaymentFormProps {
  clientSecret: string;
  stripePromise: Promise<Stripe | null>;
}

export function StripePaymentForm({
  clientSecret,
  stripePromise,
}: StripePaymentFormProps) {
  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}