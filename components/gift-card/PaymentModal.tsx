"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Palmtree, CreditCard } from "lucide-react";
import { useInitiateGiftCardPurchase, useVerifyGiftCardPurchase } from "@/service/hooks/useGiftCardPayment";
import { InitiatePurchaseDto, PaymentProvider } from "@/service/gift-cards/types";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseDetails: Omit<InitiatePurchaseDto, "paymentProvider">;
  onSuccess: () => void;
}

// It is strongly recommended to move the key to environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = ({ purchaseDetails, onSuccess, onClose }: { purchaseDetails: Omit<InitiatePurchaseDto, "paymentProvider">, onSuccess: () => void, onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { initiatePurchase, isInitiating } = useInitiateGiftCardPurchase();
  const { verifyPurchase, isVerifying } = useVerifyGiftCardPurchase();
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("STRIPE");
  const [error, setError] = useState<string | null>(null);

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setError(null);

    try {
      const initiationRes = await initiatePurchase({
        ...purchaseDetails,
        paymentProvider: "STRIPE",
      });

      if (!initiationRes?.data?.clientSecret) {
        throw new Error("Failed to initiate payment.");
      }

      const paymentResult = await stripe.confirmCardPayment(initiationRes.data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: purchaseDetails.recipientEmail,
            name: purchaseDetails.recipientName,
          },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message ?? "An unknown error occurred.");
        return;
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        await verifyPurchase({
          paymentProvider: "STRIPE",
          transactionId: paymentResult.paymentIntent.id,
          purchaseDetails: {
            ...purchaseDetails,
            paymentProvider: "STRIPE",
          },
        });
        onSuccess();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Payment failed. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentProvider === "STRIPE") {
      await handleStripePayment();
    } else {
      // Handle PayPal
      setError("PayPal is not yet supported.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          type="button"
          onClick={() => setPaymentProvider("STRIPE")}
          variant={paymentProvider === "STRIPE" ? "default" : "outline"}
          className="bg-orange-600"
        >
          <CreditCard className="mr-2 h-4 w-4" /> Stripe
        </Button>
        <Button
          type="button"
          onClick={() => setPaymentProvider("PAYPAL")}
          variant={paymentProvider === "PAYPAL" ? "default" : "outline"}
        >
          <Palmtree className="mr-2 h-4 w-4" /> PayPal
        </Button>
      </div>

      {paymentProvider === "STRIPE" && (
        <div className="mb-4 p-4 border rounded-md">
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isInitiating || isVerifying}>
          Cancel
        </Button>
        <Button type="submit" disabled={isInitiating || isVerifying || !stripe} className="bg-orange-600 hover:bg-orange-700">
          {(isInitiating || isVerifying) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay ${purchaseDetails.amount}
        </Button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, purchaseDetails, onSuccess }: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Securely pay for your gift card.
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm purchaseDetails={purchaseDetails} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;