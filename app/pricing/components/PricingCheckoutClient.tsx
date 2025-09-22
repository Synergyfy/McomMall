'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRecordPayment } from '@/service/payments/hook';
import {
  PaymentGateway,
  PlanType,
  PaygOption,
} from '@/service/payments/types';
import SubscriptionSummary from './SubscriptionSummary';
import PaymentForm from '@/app/checkout/components/PaymentForm';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { PaymentMethod } from '@/service/bookings/types';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PricingCheckoutClientProps {
  planName: string;
  planPrice: string;
  isTrial: boolean;
  isPayg?: boolean;
  listingId: string | null;
}

export default function PricingCheckoutClient({
  planName,
  planPrice,
  isTrial,
  isPayg,
  listingId,
}: PricingCheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeRedirect = searchParams.get('stripe_redirect');
  const clientSecret = searchParams.get('payment_intent_client_secret');

  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const { mutate: recordPayment, isPending: isRecordingPayment } =
    useRecordPayment();

  const getPriceAsNumber = (price: string) => {
    const numericPart = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericPart);
  };

  const totalPrice = isTrial ? 1.0 : getPriceAsNumber(planPrice) + 1.0;

  const getPaygOption = (name: string): PaygOption | undefined => {
    if (name.includes('90')) return PaygOption.NINETY_DAYS;
    if (name.includes('180')) return PaygOption.ONE_EIGHTY_DAYS;
    if (name.includes('270')) return PaygOption.TWO_SEVENTY_DAYS;
    return undefined;
  };

  const handlePaymentSuccess = useCallback(
    (transactionId: string, paymentMethod: PaymentMethod) => {
      const amount = totalPrice.toFixed(2);

      recordPayment(
        {
          amount,
          planType: isPayg ? PlanType.PAYG : PlanType.CO_BRANDED,
          paygOption: isPayg ? getPaygOption(planName) : undefined,
          isTrial,
          paymentGateway:
            paymentMethod === PaymentMethod.STRIPE
              ? PaymentGateway.STRIPE
              : PaymentGateway.PAYPAL,
          transactionId,
          currency: 'gbp',
        },
        {
          onSuccess: () => setSuccessModalOpen(true),
        }
      );
    },
    [
      totalPrice,
      isPayg,
      planName,
      isTrial,
      recordPayment,
    ]
  );

  useEffect(() => {
    if (stripeRedirect && clientSecret) {
      const verifyPayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          clientSecret
        );
        if (paymentIntent?.status === 'succeeded') {
          handlePaymentSuccess(paymentIntent.id, PaymentMethod.STRIPE);
        }
      };
      verifyPayment();
    }
  }, [stripeRedirect, clientSecret, handlePaymentSuccess]);

  if (isRecordingPayment) {
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
              discount={0}
              totalPrice={totalPrice}
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <PaymentForm
              totalPrice={totalPrice}
              onPaymentSuccess={(transactionId) =>
                handlePaymentSuccess(transactionId, PaymentMethod.PAYPAL)
              }
            />
          </div>
        </div>
      </motion.div>
      <SuccessDialog
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          router.push('/dashboard/my-listings');
        }}
      />
    </>
  );
}
