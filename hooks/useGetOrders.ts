import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { Order } from '@/types/order';

const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/order');
  return data;
};

export const useGetOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
};
