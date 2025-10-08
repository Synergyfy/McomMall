"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVerifyMembershipPayment } from '@/service/membership/hooks';
import {
  Membership,
  MembershipTier,
  VerifyPaymentDto,
} from '@/service/membership/types';
import { toast } from 'sonner';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface MembershipCheckoutFormProps {
  tier: MembershipTier;
  onSuccess: (membership: Membership) => void;
}

const MembershipCheckoutForm = ({
  tier,
  onSuccess,
}: MembershipCheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const verifyPayment = useVerifyMembershipPayment();
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
          paymentIntentId: paymentIntent.id,
          tier,
        },
        {
          onSuccess: (membership) => {
            onSuccess(membership);
          },
          onError: (error: ApiError) => {
            const errorMessage =
              error.response?.data?.message || error.message || 'An unexpected error occurred.';
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
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

export default MembershipCheckoutForm;