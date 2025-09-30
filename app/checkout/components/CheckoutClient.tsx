'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import CouponCodeInput from './CouponCodeInput';
import GiftCardInput from './GiftCardInput';
import VoucherInput from './VoucherInput';
import { useGetProductById } from '@/service/store/products/hook';
import { useCart } from '@/hooks/useCart';
import { loadStripe } from '@stripe/stripe-js';
import { useCheckout } from '@/hooks/useCheckout';
import { useRecordOrder } from '@/hooks/useRecordOrder';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import { useValidateCoupon } from '@/service/coupons/hook';
import { useCheckGiftCardBalance } from '@/service/gift-card/hook';
import { useRedeemVoucher } from '@/service/vouchers/hook';
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
  const paymentIntentClientSecret = searchParams.get(
    'payment_intent_client_secret'
  );

  const { data: product, isLoading: isProductLoading } = useGetProductById(
    productId || ''
  );
  const { cart, loading: isCartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponLoading, setCouponLoading] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [isGiftCardLoading, setGiftCardLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isVoucherLoading, setVoucherLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [isOfferLoading, setOfferLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );
  const [clientSecret, setClientSecret] = useState<string | undefined>(
    paymentIntentClientSecret || undefined
  );

  const router = useRouter();
  const { mutate: checkout } = useCheckout();
  const { mutate: recordOrder } = useRecordOrder();
  const { mutateAsync: createPaymentIntent, isPending: isStripeLoading } =
    useStripePayment();
  const { createOrderMutation } = usePayPalPayment();
  const validateCoupon = useValidateCoupon();
  const { mutateAsync: checkGiftCardBalance } = useCheckGiftCardBalance();
  const { mutateAsync: redeemVoucher } = useRedeemVoucher();
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

  const totalPrice =
    basePrice - discount - offerDiscount - giftCardDiscount - voucherDiscount;

  const handleApplyVoucher = async (code: string) => {
    setVoucherLoading(true);
    try {
      const result = await redeemVoucher({ code });
      if (result.balance > 0) {
        const applicableDiscount = Math.min(result.balance, basePrice);
        setVoucherDiscount(applicableDiscount);
        setVoucherCode(code);
        setDiscount(0);
        setCouponCode('');
        setOfferDiscount(0);
        setSelectedOffer(null);
        setGiftCardDiscount(0);
        setGiftCardCode('');
      } else {
        alert('This voucher has no balance.');
      }
    } catch (error) {
      console.error('Failed to apply voucher', error);
      alert('Invalid or inapplicable voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleApplyGiftCard = async (code: string) => {
    setGiftCardLoading(true);
    try {
      const result = await checkGiftCardBalance(code);
      if (result.currentBalance > 0) {
        const applicableDiscount = Math.min(result.currentBalance, basePrice);
        setGiftCardDiscount(applicableDiscount);
        setGiftCardCode(code);
        setDiscount(0); // Reset coupon discount
        setCouponCode('');
        setOfferDiscount(0); // Reset offer discount
        setSelectedOffer(null);
        setVoucherDiscount(0);
        setVoucherCode('');
      } else {
        alert('This gift card has no balance.');
      }
    } catch (error) {
      console.error('Failed to apply gift card', error);
      alert('Invalid or inapplicable gift card');
    } finally {
      setGiftCardLoading(false);
    }
  };

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
        giftCardCode: giftCardCode || undefined,
        voucherCode: voucherCode || undefined,
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
      giftCardCode,
      voucherCode,
    ]
  );

  const [orderID, setOrderID] = useState<string | undefined>();
  const createPaypalOrderAsync = createOrderMutation.mutateAsync;

  useEffect(() => {
    if (paymentMethod === PaymentMethod.STRIPE && totalPrice > 0) {
      createPaymentIntent(totalPrice)
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) =>
          console.error('Failed to create payment intent', err)
        );
    } else if (paymentMethod === PaymentMethod.PAYPAL && totalPrice > 0) {
      createPaypalOrderAsync(totalPrice)
        .then((order) => {
          setOrderID(order.id);
        })
        .catch((err) => console.error('Failed to create paypal order', err));
    }
  }, [totalPrice, paymentMethod, createPaymentIntent, createPaypalOrderAsync]);

  useEffect(() => {
    if (stripeRedirect && paymentIntentClientSecret) {
      const verifyPayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          paymentIntentClientSecret
        );
        if (paymentIntent?.status === 'succeeded') {
          handlePaymentSuccess(paymentIntent.id, PaymentMethod.STRIPE);
        }
      };
      verifyPayment();
    }
  }, [stripeRedirect, paymentIntentClientSecret, handlePaymentSuccess]);

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
              <GiftCardInput
                onApply={handleApplyGiftCard}
                isLoading={isGiftCardLoading}
              />
              <VoucherInput
                onApply={handleApplyVoucher}
                isLoading={isVoucherLoading}
              />
              <ApplicableOffers
                offers={applicableOffers || []}
                onApply={handleApplyOffer}
                isLoading={isOfferLoading || areOffersLoading}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            {isStripeLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader className="animate-spin text-orange-600" size={32} />
              </div>
            ) : (
              <PaymentForm
                totalPrice={totalPrice}
                onPaymentSuccess={(transactionId) =>
                  handlePaymentSuccess(transactionId, paymentMethod)
                }
                setPaymentMethod={setPaymentMethod}
                clientSecret={clientSecret}
                orderID={orderID}
              />
            )}
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
