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
import { Loader2, Palmtree, CreditCard, Wallet } from "lucide-react";
import {
  useInitiateGiftCardPurchase,
  useVerifyGiftCardPurchase,
} from "@/service/hooks/useGiftCardPayment";
import { InitiatePurchaseDto, PaymentProvider } from "@/service/gift-cards/types";
import { PayPalCheckoutButton } from "@/components/PayPalCheckoutButton";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { CURRENCY } from "@/lib/utils";
import { getPaymentErrorInfo, showPaymentError } from "@/lib/payment-errors";
import {
  buildPayPalReturnUrls,
  storePendingPayPalPurchase,
} from "@/lib/paypal-return";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseDetails: Omit<InitiatePurchaseDto, "paymentProvider">;
  onSuccess: () => void;
}

const PaymentForm = ({
  purchaseDetails,
  onSuccess,
  onClose,
}: {
  purchaseDetails: Omit<InitiatePurchaseDto, "paymentProvider">;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const { initiatePurchase, isInitiating } = useInitiateGiftCardPurchase();
  const { verifyPurchase, isVerifying } = useVerifyGiftCardPurchase();
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProvider>("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const resetPayment = () => {
    setClientSecret(null);
    setPaypalOrderId(null);
    setPaypalApprovalUrl(null);
    setError(null);
  };

  const verifyPayment = async (
    provider: PaymentProvider,
    transactionId: string,
  ) => {
    setError(null);
    try {
      await verifyPurchase({
        paymentProvider: provider,
        transactionId,
        purchaseDetails: { ...purchaseDetails, paymentProvider: provider },
      });
      onSuccess();
    } catch (err: unknown) {
      const info = getPaymentErrorInfo(err);
      setError(info.message);
      showPaymentError(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentProvider === "stripe" && clientSecret) {
      return;
    }

    try {
      const { returnUrl, cancelUrl } = buildPayPalReturnUrls();
      const initiationRes = await initiatePurchase({
        ...purchaseDetails,
        paymentProvider,
        returnUrl,
        cancelUrl,
      });

      if (paymentProvider === "mcom_wallet") {
        const transactionId = initiationRes?.data?.transactionId;
        if (!transactionId) {
          throw new Error("MCOM Wallet did not return a payment reference.");
        }
        await verifyPayment(paymentProvider, transactionId);
        return;
      }

      if (paymentProvider === "paypal") {
        if (!initiationRes?.data?.orderId) {
          throw new Error("PayPal order could not be created.");
        }
        setPaypalOrderId(initiationRes.data.orderId);
        setPaypalApprovalUrl(
          (initiationRes.data as { approvalUrl?: string | null }).approvalUrl ??
            null,
        );
        storePendingPayPalPurchase('gift-card', {
          ...purchaseDetails,
          paymentProvider: 'paypal',
        });
        return;
      }

      if (!initiationRes?.data?.clientSecret) {
        throw new Error("Failed to initiate payment.");
      }
      setClientSecret(initiationRes.data.clientSecret);
    } catch (err: unknown) {
      const info = getPaymentErrorInfo(err);
      setError(info.message);
      showPaymentError(err);
    }
  };

  if (clientSecret) {
    return (
      <div className="space-y-4">
        <StripeCheckoutForm
          clientSecret={clientSecret}
          onPaymentSuccess={(paymentIntentId) =>
            verifyPayment("stripe", paymentIntentId)
          }
        />
        {isVerifying && (
          <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Issuing your gift card…
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={resetPayment}
            disabled={isVerifying}
          >
            Choose another payment method
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          onClick={() => {
            resetPayment();
            setPaymentProvider("stripe");
          }}
          variant={paymentProvider === "stripe" ? "default" : "outline"}
          className={paymentProvider === "stripe" ? "bg-orange-600" : ""}
        >
          <CreditCard className="mr-2 h-4 w-4" /> Card
        </Button>
        <Button
          type="button"
          onClick={() => {
            resetPayment();
            setPaymentProvider("paypal");
          }}
          variant={paymentProvider === "paypal" ? "default" : "outline"}
        >
          <Palmtree className="mr-2 h-4 w-4" /> PayPal
        </Button>
        <Button
          type="button"
          onClick={() => {
            resetPayment();
            setPaymentProvider("mcom_wallet");
          }}
          variant={paymentProvider === "mcom_wallet" ? "default" : "outline"}
        >
          <Wallet className="mr-2 h-4 w-4" /> MCOM Wallet
        </Button>
      </div>

      {paypalOrderId && (
        <div className="mb-4 flex justify-center">
          <PayPalCheckoutButton
            orderID={paypalOrderId}
            approvalUrl={paypalApprovalUrl}
            onPaymentSuccess={(orderId) => verifyPayment("paypal", orderId)}
          />
        </div>
      )}

      {paymentProvider === "mcom_wallet" && !paypalOrderId && (
        <p className="mb-4 rounded-md border border-orange-100 bg-orange-50 p-3 text-sm text-orange-800">
          Your MCOM Wallet will be charged when you press Pay. Wallet payments
          are processed by MCOM Pay and the standard processing fee applies.
        </p>
      )}

      {paymentProvider === "stripe" && (
        <p className="mb-4 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
          You will enter your card details on the next step. Card data is
          handled by MCOM Pay / Stripe and never stored by MCOM Mall.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isInitiating || isVerifying}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isInitiating || isVerifying || !!paypalOrderId}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {(isInitiating || isVerifying) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {paymentProvider === "stripe"
            ? "Continue to card payment"
            : paymentProvider === "paypal"
              ? "Continue with PayPal"
              : `Pay ${CURRENCY}${Number(purchaseDetails.amount).toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

const PaymentModal = ({
  isOpen,
  onClose,
  purchaseDetails,
  onSuccess,
}: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Securely pay {CURRENCY}
            {Number(purchaseDetails.amount).toFixed(2)} for your gift card.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          purchaseDetails={purchaseDetails}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
