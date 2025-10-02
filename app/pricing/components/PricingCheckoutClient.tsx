'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useRecordPayment,
  useCreateStripeIntent,
  useCreatePayPalOrder,
} from '@/service/payments/hook';
import {
  PaymentGateway,
  PlanType,
  PaygOption,
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
    if (!stripeRedirect && totalPrice > 0) {
      if (paymentMethod === PaymentMethod.STRIPE) {
        createStripeIntent({ amount: Math.round(totalPrice * 100) });
      } else {
        createPayPalOrder({ amount: totalPrice });
      }
    }
  }, [
    totalPrice,
    paymentMethod,
    createStripeIntent,
    createPayPalOrder,
    stripeRedirect,
  ]);

  const getPaygOption = (name: string): PaygOption | undefined => {
    if (name.includes('90')) return PaygOption.NINETY_DAYS;
    if (name.includes('180')) return PaygOption.ONE_EIGHTY_DAYS;
    if (name.includes('270')) return PaygOption.TWO_SEVENTY_DAYS;
    return undefined;
  };

  const handlePaymentSuccess = useCallback(
    (transactionId: string, paymentMethod: PaymentMethod) => {
      recordPayment(
        {
          amount: totalPrice,
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
    [totalPrice, isPayg, planName, isTrial, recordPayment]
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
          router.push('/dashboard/my-subscription');
        }}
      />
    </>
  );
}
