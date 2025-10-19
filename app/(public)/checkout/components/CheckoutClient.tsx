'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import OrderSummaryCard from './OrderSummaryCard';
import PaymentForm from './PaymentForm';
import CouponCodeInput from './CouponCodeInput';
import GiftCardInput from './GiftCardInput';
import VoucherInput from './VoucherInput';
import { useGetProductById } from '@/service/store/products/hook';
import { useCart } from '@/hooks/useCart';
import { loadStripe } from '@stripe/stripe-js';
import { useCheckout } from '@/hooks/useCheckout';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import { useValidateCoupon } from '@/service/coupons/hook';
import { useCheckGiftCardBalance } from '@/service/gift-card/hook';
import { useApplyVoucher } from '@/service/vouchers/hook';
import {
  useGetApplicableOffers,
  useApplyOffer,
} from '@/service/offers/hook';
import ApplicableOffers from './ApplicableOffers';
import { PaymentMethod } from '@/service/bookings/types';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { useRouter } from 'next/navigation';
import {
  CreateCheckoutDto,
  ServiceBookingDetailsDto,
} from '@/hooks/useCheckout';

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
  const quantityFromUrl = searchParams.get('quantity');

  const { data: product, isLoading: isProductLoading } = useGetProductById(
    productId || ''
  );
  const { cart, loading: isCartLoading } = useCart();
  const { bookings } = useSelector((state: RootState) => state.booking);
  const [quantity, setQuantity] = useState(quantityFromUrl ? parseInt(quantityFromUrl, 10) : 1);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
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
  const { mutateAsync: createPaymentIntent, isPending: isStripeLoading } =
    useStripePayment();
  const { createOrderMutation } = usePayPalPayment();
  const validateCoupon = useValidateCoupon();
  const { mutateAsync: checkGiftCardBalance } = useCheckGiftCardBalance();
  const { mutateAsync: applyVoucher } = useApplyVoucher();
  const applyOffer = useApplyOffer();

  const productIds = fromCart
    ? cart?.items.map((item) => item.product.id) || []
    : productId
    ? [productId]
    : [];

  const { data: applicableOffers, isLoading: areOffersLoading } =
    useGetApplicableOffers(productIds);

  const serviceBookingsForOrder = Object.entries(bookings)
    .filter(([productId, booking]) => booking && productIds.includes(productId))
    .map(([, booking]) => booking)
    .filter((booking): booking is ServiceBookingDetailsDto => booking !== null);

  const servicesTotalPrice = serviceBookingsForOrder.reduce(
    (total, booking) => total + Number(booking?.price || 0),
    0
  );

  const basePrice =
    (fromCart
      ? cart?.items.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        )
      : product
      ? product.price * quantity
      : 0) || 0;

  const subtotal = basePrice + servicesTotalPrice;

  const totalDiscount =
    couponDiscount + offerDiscount + giftCardDiscount + voucherDiscount;
  const totalPrice = subtotal - totalDiscount;

  const handleCheckVoucherBalance = async (code: string) => {
    setVoucherLoading(true);
    try {
      const result = await applyVoucher(code);
      const balance = parseFloat(result.balance);
      if (balance > 0) {
        return balance;
      } else {
        alert("This voucher has no balance.");
      }
    } catch (error) {
      console.error("Failed to apply voucher", error);
      alert("Invalid or inapplicable voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleApplyVoucherDiscount = (code: string, amount: number) => {
    setVoucherDiscount(amount);
    setVoucherCode(code);
  };

  const handleCheckGiftCardBalance = async (code: string) => {
    setGiftCardLoading(true);
    try {
      const result = await checkGiftCardBalance(code);
      const balance = parseFloat(result.currentBalance);
      if (balance > 0) {
        return balance;
      } else {
        alert("This gift card has no balance.");
      }
    } catch (error) {
      console.error("Failed to apply gift card", error);
      alert("Invalid or inapplicable gift card");
    } finally {
      setGiftCardLoading(false);
    }
  };

  const handleApplyGiftCardDiscount = (code: string, amount: number) => {
    setGiftCardDiscount(amount);
    setGiftCardCode(code);
  };

  const handleApplyCoupon = async (code: string) => {
    setCouponLoading(true);
    try {
      const result = await validateCoupon({
        couponCode: code,
        productIds,
      });
      setCouponDiscount(result.discountAmount);
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
      setCouponDiscount(0); // Reset coupon discount
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
      const currentProductIds = fromCart
        ? cart?.items.map(item => item.product.id) || []
        : productId ? [productId] : [];

      const serviceBookings = Object.entries(bookings)
        .filter(([pid, booking]) => currentProductIds.includes(pid) && booking)
        .map(([, booking]) => booking)
        .filter((booking): booking is ServiceBookingDetailsDto => booking !== null);

      const checkoutData: CreateCheckoutDto = {
        payment: {
          paymentMethod,
          amount: totalPrice,
          transactionId,
        },
        couponCode: couponCode || undefined,
        offerId: selectedOffer || undefined,
        giftCardCode: giftCardCode || undefined,
        voucherCode: voucherCode || undefined,
        serviceBookings:
          serviceBookings.length > 0 ? serviceBookings : undefined,
        giftCardAmount: giftCardDiscount || undefined,
        voucherAmount: voucherDiscount || undefined,
      };

      if (!fromCart && product) {
        checkoutData.directPurchase = {
          productId: product.id,
          quantity,
        };
      }

      checkout(checkoutData, {
        onSuccess: () => setSuccessModalOpen(true),
      });
    },
    [
      fromCart,
      product,
      quantity,
      totalPrice,
      checkout,
      couponCode,
      selectedOffer,
      giftCardCode,
      voucherCode,
      bookings,
      cart,
      productId,
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-center mb-12 text-gray-900">
            Complete Your Purchase
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
            {/* Left side: Payment and Discounts */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Payment Information
                </h2>
                {isStripeLoading ? (
                  <div className="flex justify-center items-center h-48">
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
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Discounts & Offers
                </h2>
                <div className="space-y-4">
                  <CouponCodeInput
                    onApply={handleApplyCoupon}
                    isLoading={isCouponLoading}
                  />
                  <GiftCardInput
                    onCheckBalance={handleCheckGiftCardBalance}
                    onApply={handleApplyGiftCardDiscount}
                    isLoading={isGiftCardLoading}
                  />
                  <VoucherInput
                    onCheckBalance={handleCheckVoucherBalance}
                    onApply={handleApplyVoucherDiscount}
                    isLoading={isVoucherLoading}
                  />
                  <ApplicableOffers
                    offers={applicableOffers || []}
                    onApply={handleApplyOffer}
                    isLoading={isOfferLoading || areOffersLoading}
                  />
                </div>
              </div>
            </div>

            {/* Right side: Order Summary */}
            <div className="lg:col-span-5 mt-12 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 sticky top-8">
                <OrderSummaryCard
                  product={product}
                  cart={cart}
                  fromCart={fromCart}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  basePrice={basePrice}
                  totalPrice={totalPrice}
                  couponDiscount={couponDiscount}
                  giftCardDiscount={giftCardDiscount}
                  voucherDiscount={voucherDiscount}
                  offerDiscount={offerDiscount}
                  serviceBookings={serviceBookingsForOrder}
                />
              </div>
            </div>
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
