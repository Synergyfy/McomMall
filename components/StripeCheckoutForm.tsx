'use client';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface StripeCheckoutFormProps {
  clientSecret: string;
  onSuccess: (transactionId: string) => void;
}

export function StripeCheckoutForm({
  clientSecret,
  onSuccess,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (paymentIntent) {
      onSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="w-full mt-4">
        {isLoading ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  );
}
