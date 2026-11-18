'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/service/api';
import {
  useRecordPayment,
  useCreateStripeIntent,
  useCreatePayPalOrder,
} from '@/service/payments/hook';
import {
  PaymentGateway,
  PaymentPurpose,
  PlanType,
} from '@/service/payments/types';
import SubscriptionSummary from './SubscriptionSummary';
import PaymentForm from '@/app/checkout/components/PaymentForm';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { PaymentMethod } from '@/service/bookings/types';
import { Button } from '@/components/ui/button';

interface PricingCheckoutClientProps {
  planName: string;
  planPrice: string;
  planVariantId?: string;
  isTrial: boolean;
  isPayg?: boolean;
  listingId: string | null;
}

export default function PricingCheckoutClient({
  planName,
  planPrice,
  planVariantId,
  isTrial,
  isPayg,
  listingId,
}: PricingCheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeRedirect = searchParams.get('stripe_redirect');

  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE,
  );
  const [publishableKey, setPublishableKey] = useState<string>();
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `admin-plan-${Date.now()}`,
  );

  useEffect(() => {
    api
      .get('/payments/config')
      .then((res) => setPublishableKey(res.data?.publishableKey ?? undefined))
      .catch(() => undefined);
  }, []);

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
    return parseFloat(numericPart) || 0;
  };

  const totalPrice = isTrial ? 0 : getPriceAsNumber(planPrice);

  useEffect(() => {
    if (isTrial || stripeRedirect || totalPrice <= 0) return;
    const payload = planVariantId
      ? {
          planVariantId,
          purpose: PaymentPurpose.MEMBERSHIP,
          idempotencyKey,
        }
      : {
          amount: totalPrice,
          purpose: PaymentPurpose.PAYG_TOPUP,
          idempotencyKey,
        };
    if (paymentMethod === PaymentMethod.STRIPE) {
      createStripeIntent(payload);
    } else {
      createPayPalOrder(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice, paymentMethod, planVariantId, isTrial, stripeRedirect]);

  const handlePaymentSuccess = useCallback(
    (transactionId: string, method: PaymentMethod) => {
      recordPayment(
        planVariantId
          ? {
              amount: totalPrice,
              isTrial: false,
              paymentGateway:
                method === PaymentMethod.STRIPE
                  ? PaymentGateway.STRIPE
                  : PaymentGateway.PAYPAL,
              transactionId,
              currency: 'gbp',
              purpose: PaymentPurpose.MEMBERSHIP,
              planVariantId,
            }
          : {
              amount: totalPrice,
              planType: PlanType.PAYG,
              isTrial: false,
              paymentGateway:
                method === PaymentMethod.STRIPE
                  ? PaymentGateway.STRIPE
                  : PaymentGateway.PAYPAL,
              transactionId,
              currency: 'gbp',
              purpose: PaymentPurpose.PAYG_TOPUP,
            },
        {
          onSuccess: () => setSuccessModalOpen(true),
        },
      );
    },
    [totalPrice, planVariantId, recordPayment],
  );

  const handleStartTrial = async () => {
    if (!planVariantId) {
      setTrialError('This plan cannot be trialled yet.');
      return;
    }
    setIsStartingTrial(true);
    setTrialError(null);
    try {
      await api.post('/membership/join-trial', { planVariantId });
      setSuccessModalOpen(true);
    } catch (e: any) {
      setTrialError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not start the trial.',
      );
    } finally {
      setIsStartingTrial(false);
    }
  };

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
          {isTrial ? 'Start your trial' : 'Secure Checkout'}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <SubscriptionSummary
              planName={planName}
              planPrice={isTrial ? 'Free' : planPrice}
              isTrial={isTrial}
              isPayg={isPayg ?? !planVariantId}
              totalPrice={totalPrice}
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            {isTrial ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Activate the free trial for{' '}
                  <span className="font-semibold">{planName}</span>. No card
                  details are collected for a trial.
                </p>
                {trialError && (
                  <p className="text-sm text-rose-600">{trialError}</p>
                )}
                <Button
                  onClick={handleStartTrial}
                  disabled={isStartingTrial}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isStartingTrial ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Activate free trial'
                  )}
                </Button>
              </div>
            ) : (
              <PaymentForm
                totalPrice={totalPrice}
                onPaymentSuccess={(transactionId) =>
                  handlePaymentSuccess(transactionId, paymentMethod)
                }
                clientSecret={stripeIntent?.clientSecret}
                orderID={payPalOrder?.orderId ?? payPalOrder?.id}
                paypalApprovalUrl={payPalOrder?.approvalUrl}
                publishableKey={publishableKey}
                setPaymentMethod={setPaymentMethod}
              />
            )}
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
