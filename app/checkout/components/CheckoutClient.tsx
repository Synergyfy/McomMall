'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import CouponCodeInput from './CouponCodeInput';
import { useGetProductById } from '@/service/store/products/hook';
import { useCart } from '@/hooks/useCart';
import { loadStripe } from '@stripe/stripe-js';
import { useCheckout } from '@/hooks/useCheckout';
import { useRecordOrder } from '@/hooks/useRecordOrder';
import { useValidateCoupon } from '@/service/coupons/hook';
import {
  useGetApplicableOffers,
  useApplyOffer,
} from '@/service/offers/hook';
import ApplicableOffers from './ApplicableOffers';
import { PaymentMethod } from '@/service/bookings/types';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const fromCart = searchParams.get('from') === 'cart';
  const stripeRedirect = searchParams.get('stripe_redirect');
  const clientSecret = searchParams.get('payment_intent_client_secret');

  const { data: product, isLoading: isProductLoading } = useGetProductById(
    productId || ''
  );
  const { cart, loading: isCartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponLoading, setCouponLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [isOfferLoading, setOfferLoading] = useState(false);

  const router = useRouter();
  const { mutate: checkout } = useCheckout();
  const { mutate: recordOrder } = useRecordOrder();
  const validateCoupon = useValidateCoupon();
  const applyOffer = useApplyOffer();

  const productIds = fromCart
    ? cart?.items.map((item) => item.product.id) || []
    : productId
    ? [productId]
    : [];

  const { data: applicableOffers, isLoading: areOffersLoading } =
    useGetApplicableOffers(productIds);

  const basePrice = fromCart
    ? cart?.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      ) || 0
    : product
    ? product.price * quantity
    : 0;

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
      setOfferDiscount(0); // Reset offer discount
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
      setDiscount(0); // Reset coupon discount
      setCouponCode('');
    } catch (error) {
      console.error('Failed to apply offer', error);
      alert('Failed to apply offer');
    } finally {
      setOfferLoading(false);
    }
  };

  const handlePaymentSuccess = useCallback(
    (transactionId: string, paymentMethod: PaymentMethod) => {
      const checkoutData = {
        payment: {
          paymentMethod,
          amount: totalPrice,
          transactionId,
        },
        couponCode: couponCode || undefined,
        offerId: selectedOffer || undefined,
      };

      if (fromCart) {
        checkout(checkoutData, {
          onSuccess: () => setSuccessModalOpen(true),
        });
      } else if (product) {
        recordOrder(
          {
            ...checkoutData,
            productId: product.id,
            quantity,
          },
          {
            onSuccess: () => setSuccessModalOpen(true),
          }
        );
      }
    },
    [
      fromCart,
      product,
      quantity,
      totalPrice,
      checkout,
      recordOrder,
      couponCode,
      selectedOffer,
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

  if (isProductLoading || isCartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (!productId && !fromCart) {
    return <div>No product selected.</div>;
  }

  if (!product && !fromCart) {
    return <div>Product not found.</div>;
  }

  if (fromCart && (!cart || cart.items.length === 0)) {
    return <div>Your cart is empty.</div>;
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
            <OrderSummary
              product={product}
              cart={cart}
              fromCart={fromCart}
              quantity={quantity}
              setQuantity={setQuantity}
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
          router.push('/dashboard/store/orders');
        }}
      />
    </>
  );
}
