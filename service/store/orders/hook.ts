import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { Order } from './types';

const getStoreOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/order/');
  return data;
};

export const useGetStoreOrders = () => {
  return useQuery({
    queryKey: ['storeOrders'],
    queryFn: getStoreOrders,
  });
};
