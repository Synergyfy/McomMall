import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';
import { PaymentMethod } from '@/types/order';

export interface PaymentDto {
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
}

export interface CreateCheckoutDto {
  payment: PaymentDto;
  couponCode?: string;
  offerId?: string;
  voucherCode?: string;
  giftCardCode?: string;
}

const checkout = async (checkoutData: CreateCheckoutDto) => {
  const { payment, couponCode, offerId, voucherCode, giftCardCode } =
    checkoutData;
  const { data } = await api.post('/order/checkout', {
    payment,
    couponCode,
    offerId,
    voucherCode,
    giftCardCode,
  });
  return data;
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: checkout,
  });
};
