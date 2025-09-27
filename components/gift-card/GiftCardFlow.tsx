"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  GiftCardTemplate,
  InitiatePurchaseDto,
  InitiatePurchaseResponse,
  GiftCard,
} from "@/service/gift-card/types";
import {
  useInitiatePurchase,
  useVerifyPurchase,
} from "@/service/gift-card/hook";
import { toast } from "sonner";
import RecipientStep from "./RecipientStep";
import ValueStep from "./ValueStep";
import DesignStep from "./DesignStep";
import DeliveryStep from "./DeliveryStep";
import CheckoutStep from "./CheckoutStep";
import StripeCheckoutForm from "@/components/StripeCheckoutForm";
import PayPalCheckoutButton from "@/components/PayPalCheckoutButton";
import PaymentSuccessDialog from "@/components/PaymentSuccessModal";

interface GiftCardFlowProps {
  template: GiftCardTemplate;
}

const GiftCardFlow = ({ template }: GiftCardFlowProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipientType: "someoneElse" as "myself" | "someoneElse",
    amount: 0,
    recipientName: "",
    recipientEmail: "",
    personalMessage: "",
    design: {
      theme: "birthday",
      svg: "BirthdayCake" as string | null,
      customImage: null as string | null,
      textColor: "#000000",
      backgroundColor: "#f0f0f0",
    },
    delivery: {
      type: "now" as "now" | "scheduled",
      date: null as Date | null,
    },
  });

  const [purchaseResponse, setPurchaseResponse] =
    useState<InitiatePurchaseResponse | null>(null);
  const [purchaseDetails, setPurchaseDetails] =
    useState<InitiatePurchaseDto | null>(null);
  const [createdGiftCard, setCreatedGiftCard] = useState<GiftCard | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { mutate: initiatePurchase, isPending: isInitiating } =
    useInitiatePurchase();
  const { mutate: verifyPurchase, isPending: isVerifying } =
    useVerifyPurchase();

  const handleRecipientSelect = (recipientType: "myself" | "someoneElse") => {
    setFormData((prev) => ({ ...prev, recipientType }));
    setStep(2);
  };

  const handleValueSave = (amount: number) => {
    setFormData((prev) => ({ ...prev, amount }));
    setStep(3);
  };

  const handleDesignSave = (data: {
    theme: string;
    svg: string | null;
    customImage: string | null;
    recipientName: string;
    recipientEmail: string;
    personalMessage: string;
    textColor: string;
    backgroundColor: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      personalMessage: data.personalMessage,
      design: {
        ...prev.design,
        theme: data.theme,
        svg: data.svg,
        customImage: data.customImage,
        textColor: data.textColor,
        backgroundColor: data.backgroundColor,
      },
    }));
    setStep(4);
  };

  const handleDeliverySave = (delivery: {
    type: "now" | "scheduled";
    date: Date | null;
  }) => {
    setFormData((prev) => ({ ...prev, delivery }));
    setStep(5);
  };

  const handlePurchase = (details: InitiatePurchaseDto) => {
    setPurchaseDetails(details);
    initiatePurchase(details, {
      onSuccess: (data) => {
        setPurchaseResponse(data);
      },
      onError: () => {
        toast.error("Failed to initiate purchase. Please try again.");
      },
    });
  };

  const handleVerification = (transactionId: string) => {
    if (!purchaseDetails || !purchaseResponse) return;

    verifyPurchase(
      {
        paymentProvider: purchaseResponse.provider,
        transactionId,
        purchaseDetails: purchaseDetails,
      },
      {
        onSuccess: (data) => {
          setCreatedGiftCard(data);
          setShowSuccessDialog(true);
        },
        onError: () => {
          toast.error("Payment verification failed. Please contact support.");
        },
      }
    );
  };

  // prettier-ignore
  const STEPS = [
    { title: "Recipient", description: "Who is this gift for?" },
    { title: "Value", description: "Choose the gift card value" },
    { title: "Design", description: "Personalize your gift card" },
    { title: "Delivery", description: "Schedule the delivery" },
    { title: "Checkout", description: "Complete your purchase" },
  ];

  if (isVerifying) {
    return <div>Verifying payment...</div>;
  }

  if (showSuccessDialog && createdGiftCard) {
    return (
      <PaymentSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        giftCard={createdGiftCard}
      />
    );
  }

  if (purchaseResponse && purchaseResponse.provider === "stripe" && purchaseResponse.clientSecret) {
    return (
      <StripeCheckoutForm
        clientSecret={purchaseResponse.clientSecret}
        onPaymentSuccess={(paymentIntentId) => handleVerification(paymentIntentId)}
      />
    );
  }

  if (purchaseResponse && purchaseResponse.provider === "paypal" && purchaseResponse.orderId) {
    return (
      <div className="flex justify-center">
        <PayPalCheckoutButton
          orderID={purchaseResponse.orderId}
          onSuccess={(orderID) => handleVerification(orderID)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">
          Step {step}: {STEPS[step - 1].title}
        </h2>
        <p className="text-gray-500">{STEPS[step - 1].description}</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && <RecipientStep onSelect={handleRecipientSelect} />}
        {step === 2 && (
          <ValueStep template={template} onSave={handleValueSave} />
        )}
        {step === 3 && (
          <DesignStep
            onSave={handleDesignSave}
            amount={formData.amount}
            recipientType={formData.recipientType}
          />
        )}
        {step === 4 && <DeliveryStep onSave={handleDeliverySave} />}
        {step === 5 && (
          <CheckoutStep
            template={template}
            formData={formData}
            onPurchase={handlePurchase}
            isInitiating={isInitiating}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftCardFlow;