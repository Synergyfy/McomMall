"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVerifyMembershipPayment } from '@/service/membership/hooks';
import { MembershipTier, PaymentMethod } from '@/service/membership/types';
import { toast } from 'sonner';

interface MembershipCheckoutFormProps {
  tier: MembershipTier;
  onSuccess: () => void;
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
          paymentProvider: PaymentMethod.STRIPE,
          transactionId: paymentIntent.id,
          purchaseDetails: { tier },
        },
        {
          onSuccess: () => {
            toast.success('Payment successful! Your membership is active.');
            onSuccess();
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || 'An unexpected error occurred.';
            toast.error(`Payment verification failed: ${errorMessage}`);
            setIsLoading(false);
          },
        }
      );
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