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

export interface RedemptionDto {
  type: "gift_card" | "voucher";
  code: string;
  value: number;
  valueType: "fixed" | "percentage";
}

export interface CreateCheckoutDto {
  payment: PaymentDto;
  directPurchase?: DirectPurchaseDto;
  giftCardPurchases?: GiftCardPurchaseDto[];
  couponCode?: string;
  offerId?: string;
  redemption?: RedemptionDto;
  serviceBookings?: ServiceBookingDetailsDto[];
}

const checkout = async (checkoutData: CreateCheckoutDto) => {
  const {
    payment,
    directPurchase,
    giftCardPurchases,
    couponCode,
    offerId,
    redemption,
    serviceBookings,
  } = checkoutData;
  const { data } = await api.post('/order/checkout', {
    payment,
    directPurchase,
    giftCardPurchases,
    couponCode,
    offerId,
    redemption,
    serviceBookings,
  });
  return data;
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: checkout,
  });
};
