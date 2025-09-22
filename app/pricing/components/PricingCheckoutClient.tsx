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
import CouponCodeInput from '@/app/checkout/components/CouponCodeInput';
import ApplicableOffers from '@/app/checkout/components/ApplicableOffers';
import { useValidateCoupon } from '@/service/coupons/hook';
import {
  useGetApplicableOffers,
  useApplyOffer,
} from '@/service/offers/hook';
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
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponLoading, setCouponLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [isOfferLoading, setOfferLoading] = useState(false);

  const { mutate: recordPayment, isPending: isRecordingPayment } =
    useRecordPayment();
  const validateCoupon = useValidateCoupon();
  const applyOffer = useApplyOffer();

  // For now, we'll assume no products are associated with plans
  const productIds: string[] = [];

  const { data: applicableOffers, isLoading: areOffersLoading } =
    useGetApplicableOffers(productIds);

  const getPriceAsNumber = (price: string) => {
    const numericPart = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericPart);
  };

  const basePrice = isTrial ? 1.0 : getPriceAsNumber(planPrice) + 1.0;
  const totalPrice = basePrice - discount - offerDiscount;

  const handleApplyCoupon = async (code: string) => {
    setCouponLoading(true);
    try {
      const result = await validateCoupon({
        couponCode: code,
        productIds,
      });
      setDiscount(result.discountAmount);
      setCouponCode(code);
      setOfferDiscount(0);
      setSelectedOffer(null);
    } catch (error) {
      console.error('Failed to apply coupon', error);
      alert('Invalid or inapplicable coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyOffer = async (offerId: string) => {
    setOfferLoading(true);
    try {
      const result = await applyOffer.mutateAsync({
        offerId,
        productIds,
      });
      setOfferDiscount(result.discountAmount);
      setSelectedOffer(offerId);
      setDiscount(0);
      setCouponCode('');
    } catch (error) {
      console.error('Failed to apply offer', error);
      alert('Failed to apply offer');
    } finally {
      setOfferLoading(false);
    }
  };

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
              discount={discount + offerDiscount}
              totalPrice={totalPrice}
            />
            <div className="mt-8">
              <CouponCodeInput
                onApply={handleApplyCoupon}
                isLoading={isCouponLoading}
              />
              <ApplicableOffers
                offers={applicableOffers || []}
                onApply={handleApplyOffer}
                isLoading={isOfferLoading || areOffersLoading}
              />
            </div>
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
