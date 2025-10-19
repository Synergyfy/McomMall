import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';
import { PaymentMethod } from '@/types/order';

export interface PaymentDto {
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
}

export interface DirectPurchaseDto {
  productId: string;
  quantity: number;
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

export interface CreateCheckoutDto {
  payment: PaymentDto;
  directPurchase?: DirectPurchaseDto;
  giftCardPurchases?: GiftCardPurchaseDto[];
  couponCode?: string;
  offerId?: string;
  voucherCode?: string;
  giftCardCode?: string;
  serviceBookings?: ServiceBookingDetailsDto[];
  giftCardAmount?: number;
  voucherAmount?: number;
}

const checkout = async (checkoutData: CreateCheckoutDto) => {
  const {
    payment,
    directPurchase,
    giftCardPurchases,
    couponCode,
    offerId,
    voucherCode,
    giftCardCode,
    serviceBookings,
    giftCardAmount,
    voucherAmount,
  } = checkoutData;
  const { data } = await api.post('/order/checkout', {
    payment,
    directPurchase,
    giftCardPurchases,
    couponCode,
    offerId,
    voucherCode,
    giftCardCode,
    serviceBookings,
    giftCardAmount,
    voucherAmount,
  });
  return data;
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: checkout,
  });
};
