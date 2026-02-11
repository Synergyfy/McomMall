import { useMutation } from '@tanstack/react-query';
import api from '@/service/api';
import { CreateOrderDto } from '@/types/order';

const recordOrder = async (orderData: CreateOrderDto) => {
  const { data } = await api.post('/order', orderData);
  return data;
};

export const useRecordOrder = () => {
  return useMutation({
    mutationFn: recordOrder,
  });
};
