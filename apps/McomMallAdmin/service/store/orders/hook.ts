import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { Order, OrderStats } from './types';

const getStoreOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/order/');
  return data;
};

const getAllOrders = async (): Promise<Order[]> => {
    const { data } = await api.get('admin/orders');
    return data;
};

export const useGetAllOrders = () => {
    return useQuery({
        queryKey: ['all-admin-orders'],
        queryFn: getAllOrders,
    });
};

export const useGetStoreOrders = () => {
  return useQuery({
    queryKey: ['storeOrders'],
    queryFn: getStoreOrders,
  });
};

const getOrderStats = async (): Promise<OrderStats> => {
  const { data } = await api.get('/order/stats');
  return data;
};

export const useGetOrderStats = () => {
  return useQuery({
    queryKey: ['orderStats'],
    queryFn: getOrderStats,
  });
};
