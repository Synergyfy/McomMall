"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVerifyContributionPayment } from '@/service/grouping/hooks';
import { PaymentMethod } from '@/service/membership/types';
import { toast } from 'sonner';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ContributionStripeCheckoutProps {
  groupId: string;
  onSuccess: () => void;
}

const ContributionStripeCheckout = ({
  groupId,
  onSuccess,
}: ContributionStripeCheckoutProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const verifyPayment = useVerifyContributionPayment();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      verifyPayment.mutate(
        {
          groupId,
          dto: {
            paymentProvider: PaymentMethod.STRIPE,
            transactionId: paymentIntent.id,
          },
        },
        {
          onSuccess: () => {
            toast.success('Contribution paid successfully!');
            onSuccess();
          },
          onError: (error: ApiError) => {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              'An unexpected error occurred.';
            toast.error(`Payment verification failed: ${errorMessage}`);
            setIsLoading(false);
          },
        }
      );
    } else {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        disabled={isLoading || !stripe || !elements}
        className="w-full mt-4"
      >
        {isLoading ? 'Processing...' : 'Pay with Stripe'}
      </Button>
    </form>
  );
};

export default ContributionStripeCheckout;