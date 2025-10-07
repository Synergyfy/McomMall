"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useVerifyMembershipPayment } from "@/service/membership/hooks";
import { MembershipTier } from "@/service/membership/types";

interface MembershipCheckoutFormProps {
  tier: MembershipTier;
  onSuccess: () => void;
}

const MembershipCheckoutForm = ({ tier, onSuccess }: MembershipCheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const verifyPayment = useVerifyMembershipPayment();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/marketing/membership`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      verifyPayment.mutate(
        { paymentIntentId: paymentIntent.id, tier },
        {
          onSuccess: () => {
            toast.success("Payment successful! Your membership has been upgraded.");
            onSuccess();
          },
          onError: (error) => {
            toast.error(`Verification failed: ${error.message}`);
          },
          onSettled: () => {
            setIsLoading(false);
          }
        }
      );
    } else {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button disabled={!stripe || isLoading || verifyPayment.isPending} className="w-full mt-4">
        {isLoading || verifyPayment.isPending ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

export default MembershipCheckoutForm;