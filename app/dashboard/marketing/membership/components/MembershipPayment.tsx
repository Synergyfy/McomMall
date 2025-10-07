"use client";

import {
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useVerifyPayment } from "@/service/membership/hooks";
import { LowercaseMembershipTier, MembershipTier } from "@/service/membership/types";
import { toast } from "sonner";

interface MembershipPaymentProps {
  clientSecret: string;
  tier: MembershipTier;
  onSuccess: () => void;
}

const MembershipPayment = ({
  clientSecret,
  tier,
  onSuccess,
}: MembershipPaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const verifyPayment = useVerifyPayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      verifyPayment.mutate(
        { paymentIntentId: paymentIntent.id, tier: tier.toLowerCase() as LowercaseMembershipTier },
        {
          onSuccess: () => {
            toast.success("Payment successful! Your membership is now active.");
            onSuccess();
          },
          onError: (error) => {
            toast.error(`Payment verification failed: ${error.message}`);
          },
          onSettled: () => {
            setIsProcessing(false);
          },
        }
      );
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="mt-4 w-full">
        {isProcessing ? "Processing..." : "Pay"}
      </Button>
    </form>
  );
};

export default MembershipPayment;