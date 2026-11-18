import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';

const createStripePaymentIntent = async (payload: {
  amount: number;
  purpose?: string;
  idempotencyKey?: string;
}) => {
  const { data } = await api.post('/payments/stripe/create-intent', payload);
  return data;
};

export const useStripePayment = () => {
  return useMutation({
    mutationFn: createStripePaymentIntent,
  });
};
