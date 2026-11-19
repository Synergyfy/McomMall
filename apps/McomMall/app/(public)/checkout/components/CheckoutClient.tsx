'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import OrderSummaryCard from './OrderSummaryCard';
import PaymentForm from './PaymentForm';
import CouponCodeInput from './CouponCodeInput';
import GiftCardInput from './GiftCardInput';
import VoucherInput from './VoucherInput';
import { useGetProductById } from '@/service/store/products/hook';
import { useCart, CartItem } from '@/hooks/useCart';
import { loadStripe } from '@stripe/stripe-js';
import { useCheckout } from '@/hooks/useCheckout';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import { PaymentPurpose } from '@/service/payments/types';
import { useValidateCoupon } from '@/service/coupons/hook';
import { useCheckGiftCardBalance } from '@/service/gift-card/hook';
import { useVoucherBalance } from '@/service/vouchers/hook';
import { useGetMyVouchers } from '@/service/money-engine/hook';
import {
  useGetApplicableOffers,
  useApplyOffer,
} from '@/service/offers/hook';
import ApplicableOffers from './ApplicableOffers';
import MyRewards, { RewardLine } from './MyRewards';
import { useEligibleRewards } from '@/service/rewards/hook';
import { RewardApplication } from '@/service/rewards/types';
import ShippingDetailsForm from './ShippingDetailsForm';
import { PaymentMethod } from '@/service/bookings/types';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { useRouter } from 'next/navigation';
import {
  CheckoutQuoteRequest,
  CreateCheckoutDto,
  ServiceBookingDetailsDto,
  useCheckoutQuote,
} from '@/hooks/useCheckout';
import { Product } from '@/service/listings/types';

const stripePromise = loadStripe(
  (process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY || '')
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
  const variantsFromUrl = searchParams.get('variants');
  const moneyVoucherFromUrl = searchParams.get('moneyVoucherCode');
  const priceReducerFromUrl = searchParams.get('priceReducerCode');

  const { data: product, isLoading: isProductLoading } = useGetProductById(
    productId || ''
  );
  const { cart, loading: isCartLoading } = useCart();
  const { bookings } = useSelector((state: RootState) => state.booking);
  const [quantity, setQuantity] = useState(quantityFromUrl ? parseInt(quantityFromUrl, 10) : 1);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (variantsFromUrl) {
      try {
        setSelectedVariants(JSON.parse(decodeURIComponent(variantsFromUrl)));
      } catch (e) {
        console.error('Failed to parse variants', e);
      }
    }
  }, [variantsFromUrl]);

  // Validation Logic
  useEffect(() => {
    setValidationError(null);
    if (product) {
      // Check Variation Stock
      if (product.variations && product.variations.length > 0) {
        const currentVariation = product.variations.find(v =>
          Object.entries(v.combination).every(([key, val]) => selectedVariants[key] === val)
        );

        if (currentVariation) {
          if (currentVariation.stock < quantity) {
            setValidationError(`Only ${currentVariation.stock} left in stock for this option.`);
          }
        } else if (Object.keys(selectedVariants).length > 0) {
          // Variation mismatch or incomplete?
          // We assume if passed from URL it was valid, but maybe not found if changed?
        }
      }
      // Check General Stock
      else if (product.enableStockManagement && (product.stock || 0) < quantity) {
        setValidationError(`Only ${product.stock} left in stock.`);
      }
    }
  }, [product, selectedVariants, quantity]);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isCouponLoading, setCouponLoading] = useState(false);

  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [giftCardRequested, setGiftCardRequested] = useState(0);
  const [isGiftCardLoading, setGiftCardLoading] = useState(false);

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherRequested, setVoucherRequested] = useState(0);
  const [isVoucherLoading, setVoucherLoading] = useState(false);

  const [moneyVoucherCode, setMoneyVoucherCode] = useState('');
  const [moneyVoucherDiscount, setMoneyVoucherDiscount] = useState(0);
  const [moneyVoucherRequested, setMoneyVoucherRequested] = useState(0);
  const [isMoneyVoucherLoading, setMoneyVoucherLoading] = useState(false);

  const [priceReducerCode, setPriceReducerCode] = useState('');
  const [priceReducerDiscount, setPriceReducerDiscount] = useState(0);
  const [isPriceReducerLoading, setPriceReducerLoading] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [isOfferLoading, setOfferLoading] = useState(false);

  const [rewardApplications, setRewardApplications] = useState<
    RewardApplication[]
  >([]);
  const [rewardDiscount, setRewardDiscount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );
  const [clientSecret, setClientSecret] = useState<string | undefined>(
    paymentIntentClientSecret || undefined
  );

  const router = useRouter();
  const checkoutIdempotencyKey = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const lastPaymentIntentKeyRef = useRef<string | null>(null);
  const { mutate: checkout } = useCheckout();
  const { mutateAsync: createPaymentIntent, isPending: isStripeLoading } =
    useStripePayment();
  const { createOrderMutation } = usePayPalPayment();
  const validateCoupon = useValidateCoupon();
  const { mutateAsync: checkGiftCardBalance } = useCheckGiftCardBalance();
  const { mutateAsync: applyVoucher } = useVoucherBalance();
  const { data: myVouchers } = useGetMyVouchers();
  const applyOffer = useApplyOffer();

  const productIds = useMemo(
    () =>
      fromCart
        ? cart?.items.map((item) => item.product.id) || []
        : productId
          ? [productId]
          : [],
    [fromCart, cart, productId],
  );

  const { data: applicableOffers, isLoading: areOffersLoading } =
    useGetApplicableOffers(productIds);

  // Bundled service bookings are only supported by the API on a direct
  // purchase. A cart checkout must not send them or it will be rejected.
  const serviceBookingsForOrder = useMemo(
    () =>
      Object.entries(bookings)
        .filter(
          ([productId, booking]) =>
            !fromCart && booking && productIds.includes(productId),
        )
        .map(([, booking]) => booking)
        .filter(
          (booking): booking is ServiceBookingDetailsDto => booking !== null,
        ),
    [bookings, fromCart, productIds],
  );

  const servicesTotalPrice = serviceBookingsForOrder.reduce(
    (total, booking) => total + Number(booking?.price || 0),
    0
  );

  const rewardItems = useMemo(() => {
    if (fromCart) {
      return (cart?.items || []).map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants,
      }));
    }
    if (product && productId) {
      return [
        {
          productId,
          quantity,
          selectedVariants:
            Object.keys(selectedVariants).length > 0
              ? selectedVariants
              : undefined,
        },
      ];
    }
    return [];
  }, [fromCart, cart, product, productId, quantity, selectedVariants]);

  const rewardLines: RewardLine[] = useMemo(() => {
    if (fromCart) {
      return (cart?.items || []).map((item) => ({
        lineKey: `product:${item.product.id}`,
        label: item.product.title,
      }));
    }
    if (product && productId) {
      return [{ lineKey: `product:${productId}`, label: product.title }];
    }
    return [];
  }, [fromCart, cart, product, productId]);

  const { data: eligibleRewards, isLoading: areRewardsLoading } =
    useEligibleRewards(
      rewardItems,
      serviceBookingsForOrder.map((booking) => ({
        serviceId: booking.serviceId,
        price: Number(booking.price),
        quantity: 1,
      }))
    );

  const calculateItemPrice = useCallback((item: CartItem) => {
    let price = (item.product.salePrice && item.product.salePrice < item.product.price)
      ? item.product.salePrice
      : item.product.price;
    if (item.selectedVariants && item.product.variants) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item.product.variants as any[]).forEach((v: any) => {
        const selectedOption = item.selectedVariants?.[v.name];
        if (selectedOption) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const option = v.options.find((o: any) => o.name === selectedOption);
          if (option) {
            price += Number(option.priceModifier) || 0;
          }
        }
      });
    }
    return price;
  }, []);

  const calculateProductPrice = useCallback((product: Product, variants: Record<string, string>) => {
    let price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    if (product.variants) {
      product.variants.forEach((v) => {
        const selectedOptionName = variants[v.name];
        if (selectedOptionName) {
          const option = v.options.find((o) => o.name === selectedOptionName);
          if (option) {
            price += Number(option.priceModifier) || 0;
          }
        }
      });
    }
    return price;
  }, []);

  const basePrice = useMemo(() => {
    return (fromCart
      ? cart?.items.reduce(
        (acc, item) => acc + calculateItemPrice(item) * item.quantity,
        0
      )
      : product
        ? calculateProductPrice(product, selectedVariants) * quantity
        : 0) || 0;
  }, [fromCart, cart, product, selectedVariants, quantity, calculateItemPrice, calculateProductPrice]);

  const quoteRequest = useMemo<CheckoutQuoteRequest>(() => {
    const request: CheckoutQuoteRequest = {
      couponCode: couponCode || undefined,
      offerId: selectedOffer || undefined,
      giftCardCode: giftCardCode || undefined,
      giftCardAmount: giftCardRequested > 0 ? giftCardRequested : undefined,
      voucherCode: voucherCode || undefined,
      voucherAmount: voucherRequested > 0 ? voucherRequested : undefined,
      priceReducerCode: priceReducerCode || undefined,
      moneyVoucherCode: moneyVoucherCode || undefined,
      moneyVoucherAmount:
        moneyVoucherRequested > 0 ? moneyVoucherRequested : undefined,
      rewardApplications:
        rewardApplications.length > 0 ? rewardApplications : undefined,
      serviceBookings:
        serviceBookingsForOrder.length > 0
          ? serviceBookingsForOrder
          : undefined,
    };

    if (!fromCart && product) {
      request.directPurchase = {
        productId: product.id,
        quantity,
        selectedVariants:
          Object.keys(selectedVariants).length > 0
            ? selectedVariants
            : undefined,
      };
    }

    return request;
  }, [
    fromCart,
    product,
    productId,
    quantity,
    selectedVariants,
    couponCode,
    selectedOffer,
    giftCardCode,
    giftCardRequested,
    voucherCode,
    voucherRequested,
    priceReducerCode,
    moneyVoucherCode,
    moneyVoucherRequested,
    rewardApplications,
    serviceBookingsForOrder,
  ]);

  const {
    data: quote,
    isFetching: isQuoteFetching,
    error: quoteError,
    refetch: refetchQuote,
  } = useCheckoutQuote(quoteRequest, {
    enabled: fromCart ? Boolean(cart?.items?.length) : Boolean(product),
  });

  // Keep the existing summary components in sync with the server quote. The
  // quote owns every discount amount, including caps from scoped instruments.
  useEffect(() => {
    if (!quote) return;
    setCouponDiscount(quote.couponDiscount);
    setOfferDiscount(quote.offerDiscount);
    setGiftCardDiscount(quote.giftCardApplied);
    setVoucherDiscount(quote.voucherApplied);
    setMoneyVoucherDiscount(quote.moneyVoucherApplied);
    setPriceReducerDiscount(quote.priceReducerDiscount);
    setRewardDiscount(quote.rewardDiscount);
  }, [quote]);

  const subtotal = quote?.subtotal ?? basePrice + servicesTotalPrice;
  const totalPrice = quote?.finalAmount ?? 0;
  const displayServiceBookings = useMemo(
    () =>
      serviceBookingsForOrder.map((booking) => ({
        ...booking,
        price:
          quote?.serviceBookings.find(
            (quoted) => quoted.serviceId === booking.serviceId,
          )?.amount ?? booking.price,
      })),
    [serviceBookingsForOrder, quote],
  );
  const quoteErrorMessage = quoteError
    ? (quoteError as any)?.response?.data?.message ||
      (quoteError as Error)?.message ||
      'Could not calculate this order. Please review your discounts.'
    : null;

  const handleCheckVoucherBalance = async (code: string) => {
    setVoucherLoading(true);
    try {
      const result = await applyVoucher(code);
      const balance = Number(result.balance);
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
    setVoucherRequested(amount);
    setVoucherDiscount(amount);
    setVoucherCode(code);
  };

  const handleCheckMoneyVoucherBalance = async (code: string) => {
    setMoneyVoucherLoading(true);
    try {
      const wallet = (myVouchers ?? []).find((voucher) => voucher.code === code);
      if (!wallet) {
        alert('Money voucher not found in your wallet.');
        return;
      }
      if (wallet.state !== 'active') {
        alert('This money voucher is not active.');
        return;
      }
      return Number(wallet.totalBalance);
    } finally {
      setMoneyVoucherLoading(false);
    }
  };

  const handleApplyMoneyVoucherDiscount = (code: string, amount: number) => {
    const otherDiscounts =
      couponDiscount +
      offerDiscount +
      giftCardDiscount +
      voucherDiscount +
      priceReducerDiscount +
      rewardDiscount;
    const maxApplicable = Math.max(0, subtotal - otherDiscounts);
    const requested = Math.min(amount, maxApplicable);
    setMoneyVoucherCode(code);
    setMoneyVoucherRequested(requested);
    setMoneyVoucherDiscount(requested);
  };

  const handleCheckPriceReducerBalance = async (code: string) => {
    setPriceReducerLoading(true);
    try {
      const wallet = (myVouchers ?? []).find((voucher) => voucher.code === code);
      if (!wallet) {
        alert('Voucher Coupon not found in your wallet.');
        return;
      }
      if (wallet.functionalType !== 'price_reducer') {
        alert('This code is not a Voucher Coupon.');
        return;
      }
      if (wallet.state !== 'active') {
        alert('This Voucher Coupon is not active.');
        return;
      }
      const value = Number(wallet.faceValue ?? 0);
      if (value <= 0) {
        alert('This Voucher Coupon has no discount value.');
        return;
      }
      return value;
    } finally {
      setPriceReducerLoading(false);
    }
  };

  const handleApplyPriceReducerDiscount = (code: string, amount: number) => {
    const otherDiscounts =
      couponDiscount +
      offerDiscount +
      giftCardDiscount +
      voucherDiscount +
      moneyVoucherDiscount +
      rewardDiscount;
    const maxApplicable = Math.max(0, subtotal - otherDiscounts);
    setPriceReducerCode(code);
    setPriceReducerDiscount(Math.min(amount, maxApplicable));
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
    setGiftCardRequested(amount);
    setGiftCardDiscount(amount);
    setGiftCardCode(code);
  };

  const handleApplyCoupon = async (code: string) => {
    setCouponLoading(true);
    try {
      const result = await validateCoupon({
        code,
        subtotal,
      });
      setCouponDiscount(Number(result.discountAmount ?? 0));
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

  const handleApplyRewards = useCallback(
    (applications: RewardApplication[], total: number) => {
      setRewardApplications(applications);
      setRewardDiscount(total);
      // Rewards and coupon/offer discounts never stack on the same line.
      if (total > 0) {
        setCouponDiscount(0);
        setCouponCode('');
        setOfferDiscount(0);
        setSelectedOffer(null);
      }
    },
    []
  );

  const handlePaymentSuccess = useCallback(
    (transactionId: string, methodOverride?: PaymentMethod) => {
      const method = methodOverride ?? paymentMethod;
      const currentProductIds = fromCart
        ? cart?.items.map(item => item.product.id) || []
        : productId ? [productId] : [];

      const serviceBookings = fromCart
        ? []
        : Object.entries(bookings)
            .filter(
              ([pid, booking]) =>
                currentProductIds.includes(pid) && booking,
            )
            .map(([, booking]) => booking)
            .filter(
              (booking): booking is ServiceBookingDetailsDto =>
                booking !== null,
            );

      const checkoutData: CreateCheckoutDto = {
        payment: {
          paymentMethod: method,
          amount: totalPrice,
          transactionId,
          idempotencyKey: checkoutIdempotencyKey.current,
        },
        couponCode: couponCode || undefined,
        offerId: selectedOffer || undefined,
        giftCardCode: giftCardCode || undefined,
        voucherCode: voucherCode || undefined,
        priceReducerCode: priceReducerCode || undefined,
        serviceBookings:
          serviceBookings.length > 0 ? serviceBookings : undefined,
        giftCardAmount: giftCardDiscount || undefined,
        voucherAmount: voucherDiscount || undefined,
        moneyVoucherCode: moneyVoucherCode || undefined,
        moneyVoucherAmount: moneyVoucherDiscount || undefined,
        rewardApplications:
          rewardApplications.length > 0 ? rewardApplications : undefined,
      };

      if (!fromCart && product) {
        checkoutData.directPurchase = {
          productId: product.id,
          quantity,
          selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
        };
      }

      checkout(checkoutData, {
        onSuccess: () => setSuccessModalOpen(true),
        onError: (error: any) => {
          const response = error?.response;
          const data = response?.data;
          if (
            response?.status === 409 &&
            String(data?.message || '').includes('order total changed')
          ) {
            lastPaymentIntentKeyRef.current = null;
            setClientSecret(undefined);
            setOrderID(undefined);
            setPaypalApprovalUrl(undefined);
            refetchQuote();
          }
          const message =
            data?.message ||
            error?.message ||
            'Checkout failed. Please review your discounts and try again.';
          alert(Array.isArray(message) ? message.join('\n') : message);
        },
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
      selectedVariants,
      giftCardDiscount,
      voucherDiscount,
      moneyVoucherCode,
      moneyVoucherDiscount,
      priceReducerCode,
      rewardApplications,
      paymentMethod,
      refetchQuote,
    ]
  );

  const [orderID, setOrderID] = useState<string | undefined>();
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<
    string | null | undefined
  >();
  const createPaypalOrderAsync = createOrderMutation.mutateAsync;

  const paymentIntentKey = `${paymentMethod}:${totalPrice.toFixed(2)}`;

  // Any change to the server quote invalidates the payment session. Clear the
  // old client secret before the effect below creates a new one for the new
  // amount, so the browser can never confirm a stale intent.
  useEffect(() => {
    setClientSecret(undefined);
    setOrderID(undefined);
    setPaypalApprovalUrl(undefined);
  }, [paymentIntentKey]);

  useEffect(() => {
    if (!quote || isQuoteFetching) return;
    if (lastPaymentIntentKeyRef.current === paymentIntentKey) return;

    lastPaymentIntentKeyRef.current = paymentIntentKey;

    if (paymentMethod === PaymentMethod.STRIPE && totalPrice > 0) {
      createPaymentIntent({
        amount: totalPrice,
        purpose: PaymentPurpose.PAYG_TOPUP,
        idempotencyKey: checkoutIdempotencyKey.current,
      })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          lastPaymentIntentKeyRef.current = null;
          console.error('Failed to create payment intent', err);
        });
    } else if (paymentMethod === PaymentMethod.PAYPAL && totalPrice > 0) {
      createPaypalOrderAsync({
        amount: totalPrice,
        purpose: PaymentPurpose.PAYG_TOPUP,
        idempotencyKey: checkoutIdempotencyKey.current,
      })
        .then((order) => {
          setOrderID(order.id);
          setPaypalApprovalUrl(order.approvalUrl ?? null);
        })
        .catch((err) => {
          lastPaymentIntentKeyRef.current = null;
          console.error('Failed to create paypal order', err);
        });
    }
  }, [
    paymentIntentKey,
    totalPrice,
    paymentMethod,
    quote,
    isQuoteFetching,
    createPaymentIntent,
    createPaypalOrderAsync,
  ]);

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
        className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-center mb-12 text-gray-900">
            Complete Your Purchase
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
            {/* Left side: Payment and Discounts */}
            <div className="lg:col-span-7 space-y-8">
              <ShippingDetailsForm />
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Payment Information
                </h2>
                {validationError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium text-center">
                    {validationError}
                    <div className="mt-2 text-sm text-red-500">Please adjust your order to proceed.</div>
                  </div>
                ) : quoteErrorMessage ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium text-center">
                    {Array.isArray(quoteErrorMessage)
                      ? quoteErrorMessage.join('\n')
                      : quoteErrorMessage}
                    <div className="mt-2 text-sm text-red-500">Please adjust your discounts to proceed.</div>
                  </div>
                ) : isStripeLoading || isQuoteFetching ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader className="animate-spin text-orange-600" size={32} />
                  </div>
                ) : (
                  <PaymentForm
                    totalPrice={totalPrice}
                    onPaymentSuccess={(transactionId, method) =>
                      handlePaymentSuccess(transactionId, method ?? paymentMethod)
                    }
                    setPaymentMethod={setPaymentMethod}
                    clientSecret={clientSecret}
                    orderID={orderID}
                    paypalApprovalUrl={paypalApprovalUrl}
                  />
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Discounts & Offers
                </h2>
                <div className="space-y-4">
                  <MyRewards
                    eligible={eligibleRewards?.rewards || []}
                    lines={rewardLines}
                    isLoading={areRewardsLoading}
                    onApply={handleApplyRewards}
                  />
                  <div
                    className={
                      rewardDiscount > 0
                        ? 'pointer-events-none opacity-50 space-y-4'
                        : 'space-y-4'
                    }
                  >
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
                  <VoucherInput
                    title="money voucher"
                    placeholder="Enter money voucher code"
                    defaultCode={moneyVoucherFromUrl ?? undefined}
                    onCheckBalance={handleCheckMoneyVoucherBalance}
                    onApply={handleApplyMoneyVoucherDiscount}
                    isLoading={isMoneyVoucherLoading}
                  />
                  <VoucherInput
                    title="voucher coupon"
                    placeholder="Enter Voucher Coupon code"
                    defaultCode={priceReducerFromUrl ?? undefined}
                    onCheckBalance={handleCheckPriceReducerBalance}
                    onApply={handleApplyPriceReducerDiscount}
                    isLoading={isPriceReducerLoading}
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
                  subtotal={quote?.subtotal}
                  totalPrice={totalPrice}
                  couponDiscount={couponDiscount}
                  giftCardDiscount={giftCardDiscount}
                  voucherDiscount={voucherDiscount}
                  moneyVoucherDiscount={moneyVoucherDiscount}
                  priceReducerDiscount={priceReducerDiscount}
                  offerDiscount={offerDiscount}
                  rewardDiscount={rewardDiscount}
                  serviceBookings={displayServiceBookings}
                  selectedVariants={selectedVariants}
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
