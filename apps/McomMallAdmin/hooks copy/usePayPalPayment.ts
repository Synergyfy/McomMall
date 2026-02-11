import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';

const createPayPalOrder = async (amount: number) => {
  const { data } = await api.post('/payments/paypal/create-order', {
    amount,
  });
  return data;
};

const capturePayPalOrder = async (orderId: string) => {
  const { data } = await api.post('/payments/paypal/capture-order', {
    orderId,
  });
  return data;
};

export const usePayPalPayment = () => {
  const createOrderMutation = useMutation({
    mutationFn: createPayPalOrder,
  });

  const captureOrderMutation = useMutation({
    mutationFn: capturePayPalOrder,
  });

  return {
    createOrderMutation,
    captureOrderMutation,
  };
};
