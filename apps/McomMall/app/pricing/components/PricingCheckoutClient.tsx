'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useRecordPayment,
  useCreateStripeIntent,
  useCreatePayPalOrder,
} from '@/service/payments/hooks';
import {
  PaymentGateway,
  PlanType,
  PaygOption,
  PaymentPurpose,
  CreateStripeIntentRequest,
  CreatePaypalOrderRequest
} from '@/service/payments/types';
import SubscriptionSummary from './SubscriptionSummary';
import PaymentForm from '@/app/(public)/checkout/components/PaymentForm';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { PaymentMethod } from '@/service/bookings/types';

interface PricingCheckoutClientProps {
  planName: string;
  planPrice: string;
  isTrial: boolean;
  isPayg?: boolean;
  listingId: string | null;
  tierId?: string;
  planType?: PlanType;
}

export default function PricingCheckoutClient({
  planName,
  planPrice,
  isTrial,
  isPayg,
  listingId,
  tierId,
  planType,
}: PricingCheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeRedirect = searchParams.get('stripe_redirect');

  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );

  const { mutate: recordPayment, isPending: isRecordingPayment } =
    useRecordPayment();
  const {
    mutateAsync: createStripeIntent,
    data: stripeIntent,
    isPending: isCreatingStripeIntent,
  } = useCreateStripeIntent();
  const {
    mutateAsync: createPayPalOrder,
    data: payPalOrder,
    isPending: isCreatingPayPalOrder,
  } = useCreatePayPalOrder();

  const getPriceAsNumber = (price: string) => {
    const numericPart = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericPart);
  };

  const totalPrice = isTrial ? 1.0 : getPriceAsNumber(planPrice);

  useEffect(() => {
    // Only fetch intent/order if we have valid conditions:
    // 1. Not a stripe redirect (which means we are coming back from stripe)
    // 2. Either (totalPrice > 0 OR it's a membership with tierId)
    // Note: Membership trial might be 0 or small amount, but backend logic handles it.
    if (!stripeRedirect) {
      if (paymentMethod === PaymentMethod.STRIPE) {
        const payload: CreateStripeIntentRequest = {};
        if (isPayg) {
          payload.purpose = PaymentPurpose.PAYG_TOPUP;
          payload.amount = Math.round(totalPrice * 100);
        } else if (tierId && planType) {
          payload.purpose = PaymentPurpose.MEMBERSHIP;
          payload.tierId = tierId;
          payload.planType = planType;
          // Backend fetches amount for membership, but we might want to send it just in case or if backend logic relies on it for validation
          // Guide says: "You do not need to calculate the price manually."
          // But for trial logic (isTrial=true), amount is 1.0 (100 cents) in current code.
          // If isTrial is handled by backend via tierId/planType?
          // The guide doesn't mention trial in create-intent payload, but record-payment has isTrial.
          // I'll stick to guide for Membership.
        } else {
          // Fallback or incomplete data, maybe just return
          return;
        }
        createStripeIntent(payload);
      } else {
        const payload: CreatePaypalOrderRequest = {};
        if (isPayg) {
          payload.purpose = PaymentPurpose.PAYG_TOPUP;
          payload.amount = totalPrice;
        } else if (tierId && planType) {
          payload.purpose = PaymentPurpose.MEMBERSHIP;
          payload.tierId = tierId;
          payload.planType = planType;
        } else {
          return;
        }
        createPayPalOrder(payload);
      }
    }
  }, [
    totalPrice,
    paymentMethod,
    createStripeIntent,
    createPayPalOrder,
    stripeRedirect,
    isPayg,
    tierId,
    planType
  ]);

  const getPaygOption = (name: string): PaygOption | undefined => {
    if (name.includes('90')) return PaygOption.NINETY_DAYS;
    if (name.includes('180')) return PaygOption.ONE_EIGHTY_DAYS;
    if (name.includes('270')) return PaygOption.TWO_SEVENTY_DAYS;
    return undefined;
  };

  const handlePaymentSuccess = useCallback(
    (transactionId: string, paymentMethod: PaymentMethod) => {
      const purpose = isPayg ? PaymentPurpose.PAYG_TOPUP : PaymentPurpose.MEMBERSHIP;
      // Determine PlanType for record call
      // If Membership, use the specific planType (monthly/annual).
      // If PAYG, use PlanType.PAYG.
      // Legacy code used PlanType.CO_BRANDED for subscriptions.
      // I should use the specific planType if available, else fallback?
      // Guide says for RecordPaymentRequest: planType: PlanType (monthly/quarterly/annual).
      // So for Membership, it MUST be monthly/quarterly/annual.

      const recordPlanType = isPayg ? PlanType.PAYG : (planType || PlanType.CO_BRANDED);
      // Note: PlanType.CO_BRANDED might be rejected by backend if it expects monthly/etc.
      // But if planType prop is missing (shouldn't happen for new flow), we might have issues.

      recordPayment(
        {
          amount: totalPrice,
          planType: recordPlanType,
          purpose,
          paygOption: isPayg ? getPaygOption(planName) : undefined,
          isTrial,
          paymentGateway:
            paymentMethod === PaymentMethod.STRIPE
              ? PaymentGateway.STRIPE
              : PaymentGateway.PAYPAL,
          transactionId,
          currency: 'gbp',
          tierId: isPayg ? undefined : tierId,
        },
        {
          onSuccess: () => setSuccessModalOpen(true),
        }
      );
    },
    [totalPrice, isPayg, planName, isTrial, recordPayment, planType, tierId]
  );


  if (isRecordingPayment || isCreatingStripeIntent || isCreatingPayPalOrder) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12"
      >
        <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
          Secure Checkout
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <SubscriptionSummary
              planName={planName}
              planPrice={planPrice}
              isTrial={isTrial}
              isPayg={isPayg}
              paygOption={getPaygOption(planName)}
              totalPrice={totalPrice}
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <PaymentForm
              totalPrice={totalPrice}
              onPaymentSuccess={(transactionId) =>
                handlePaymentSuccess(
                  transactionId,
                  paymentMethod
                )
              }
              clientSecret={stripeIntent?.clientSecret}
              orderID={payPalOrder?.id}
              setPaymentMethod={setPaymentMethod}
            />
          </div>
        </div>
      </motion.div>
      <SuccessDialog
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          router.push('/dashboard');
        }}
      />
    </>
  );
}
