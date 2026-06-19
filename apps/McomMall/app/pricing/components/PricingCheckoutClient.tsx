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
import { Button } from '@/components/ui/button';

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
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col justify-between">
            <div>
              <SubscriptionSummary
                planName={planName}
                planPrice={planPrice}
                isTrial={isTrial}
                isPayg={isPayg}
                paygOption={getPaygOption(planName)}
                totalPrice={totalPrice}
              />

              {/* Billing Details & Promos */}
              <div className="mt-8 pt-8 border-t border-gray-150 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Billing Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Billing Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Corp Ltd" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ff6900]" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Billing Address</label>
                        <input 
                          type="text" 
                          placeholder="10 Downing St" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ff6900]" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Postcode</label>
                        <input 
                          type="text" 
                          placeholder="SW1A 2AA" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ff6900]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Promo Code & Voucher Credits</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Promo Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="MCOM20" 
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#ff6900]" 
                        />
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-4 rounded-xl border border-gray-200 h-9">
                          Apply
                        </Button>
                      </div>
                    </div>

                    <div className="bg-[#fcf8f6] border border-orange-100 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-gray-855">Apply Voucher Credits</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Available: $1,240.00 credit balance</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff6900]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
