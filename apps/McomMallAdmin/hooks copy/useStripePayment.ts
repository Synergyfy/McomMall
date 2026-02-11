import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';

const createStripePaymentIntent = async (amount: number) => {
  const { data } = await api.post('/payments/stripe/create-intent', {
    amount,
  });
  return data;
};

export const useStripePayment = () => {
  return useMutation({
    mutationFn: createStripePaymentIntent,
  });
};
