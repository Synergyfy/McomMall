import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';
import { PaymentMethod } from '@/service/bookings/types';

export interface PaymentDto {
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
}

export interface CreateCheckoutDto {
  payment: PaymentDto;
}

const checkout = async (checkoutData: CreateCheckoutDto) => {
  const { data } = await api.post('/order/checkout', checkoutData);
  return data;
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: checkout,
  });
};
