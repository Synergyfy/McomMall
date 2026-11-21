import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { PaymentMethod } from '@/types/order';

export interface PaymentDto {
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
  idempotencyKey?: string;
}

export interface DirectPurchaseDto {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface GiftCardPurchaseDto {
  businessId: string;
  amount: number;
  recipientEmail: string;
  message?: string;
  fromName: string;
}

export interface ServiceBookingDetailsDto {
  serviceId: string;
  startTime: string;
  endTime: string;
  name: string;
  price: number;
}

export interface RewardApplicationDto {
  issuanceId: string;
  lineKey: string;
}

export interface CreateCheckoutDto {
  payment: PaymentDto;
  directPurchase?: DirectPurchaseDto;
  giftCardPurchases?: GiftCardPurchaseDto[];
  couponCode?: string;
  offerId?: string;
  voucherCode?: string;
  priceReducerCode?: string;
  giftCardCode?: string;
  moneyVoucherCode?: string;
  serviceBookings?: ServiceBookingDetailsDto[];
  giftCardAmount?: number;
  voucherAmount?: number;
  moneyVoucherAmount?: number;
  rewardApplications?: RewardApplicationDto[];
}

export type CheckoutQuoteRequest = Omit<CreateCheckoutDto, 'payment'>;

export interface CheckoutQuote {
  currency: string;
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  serviceBookings: Array<{
    serviceId: string;
    name: string;
    startTime: string;
    endTime: string;
    amount: number;
  }>;
  giftCardPurchases: Array<{ businessId: string; amount: number }>;
  subtotal: number;
  rewardDiscount: number;
  offerDiscount: number;
  couponDiscount: number;
  priceReducerDiscount: number;
  shippingFee: number;
  giftCardApplied: number;
  voucherApplied: number;
  moneyVoucherApplied: number;
  totalBeforeRedemption: number;
  totalAfterDiscounts: number;
  totalWithShipping: number;
  finalAmount: number;
  applied: {
    offer: { id: string; name: string } | null;
    coupon: { code: string } | null;
    giftCard: { code: string; requested: number; applied: number } | null;
    voucher: { code: string; requested: number; applied: number } | null;
    moneyVoucher: {
      code: string;
      requested: number;
      applied: number;
    } | null;
    rewards: Array<{
      issuanceId: string;
      lineKey: string;
      discountAmount: number;
    }>;
  };
}

const fetchCheckoutQuote = async (
  payload: CheckoutQuoteRequest
): Promise<CheckoutQuote> => {
  const { data } = await api.post<CheckoutQuote>('/order/quote', payload);
  return data;
};

/**
 * Server-authoritative checkout pricing. The browser must never add up
 * discounts itself: scoped gift cards, vouchers and service bookings are only
 * known to the API.
 */
export const useCheckoutQuote = (
  payload: CheckoutQuoteRequest,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['checkoutQuote', payload],
    queryFn: () => fetchCheckoutQuote(payload),
    enabled: options?.enabled ?? true,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export interface CreateOrderPaymentIntentRequest {
  quote: CheckoutQuoteRequest;
  paymentProvider: 'stripe' | 'paypal';
  idempotencyKey: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CreateOrderPaymentIntentResponse {
  paymentRequired: boolean;
  paymentIntentId?: string;
  provider?: 'stripe' | 'paypal';
  amount?: number;
  clientSecret?: string;
  approvalUrl?: string | null;
  orderId?: string;
  chargeId?: string;
  providerRef?: string;
  completed?: boolean;
}

const createOrderPaymentIntent = async (
  payload: CreateOrderPaymentIntentRequest,
): Promise<CreateOrderPaymentIntentResponse> => {
  const { data } = await api.post<CreateOrderPaymentIntentResponse>(
    '/order/payment-intent',
    payload,
  );
  return data;
};

/**
 * Creates the MCOM Pay charge for a checkout from the server quote. The quote
 * is frozen on the intent so the webhook can complete the order even if the
 * browser closes after payment.
 */
export const useCreateOrderPaymentIntent = () => {
  return useMutation({
    mutationFn: createOrderPaymentIntent,
  });
};

const checkout = async (checkoutData: CreateCheckoutDto) => {
  const {
    payment,
    directPurchase,
    giftCardPurchases,
    couponCode,
    offerId,
    voucherCode,
    priceReducerCode,
    giftCardCode,
    moneyVoucherCode,
    serviceBookings,
    giftCardAmount,
    voucherAmount,
    moneyVoucherAmount,
    rewardApplications,
  } = checkoutData;
  const { data } = await api.post('/order/checkout', {
    payment,
    directPurchase,
    giftCardPurchases,
    couponCode,
    offerId,
    voucherCode,
    priceReducerCode,
    giftCardCode,
    moneyVoucherCode,
    serviceBookings,
    giftCardAmount,
    voucherAmount,
    moneyVoucherAmount,
    rewardApplications,
  });
  return data;
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: checkout,
  });
};
