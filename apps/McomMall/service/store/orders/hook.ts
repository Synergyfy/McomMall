import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { Order, OrderStats, PageDto } from './types';

export interface StoreOrdersQueryParams {
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const fetchStoreOrders = async (
  params: StoreOrdersQueryParams = {}
): Promise<PageDto<Order>> => {
  const { data } = await api.get<PageDto<Order> | Order[]>('/order/', { params });

  // `/order/` is paginated (`{ data, meta }`), but tolerate a bare array in case
  // the response shape changes back.
  if (Array.isArray(data)) {
    return {
      data,
      meta: {
        totalItems: data.length,
        itemCount: data.length,
        itemsPerPage: data.length,
        totalPages: 1,
        currentPage: DEFAULT_PAGE,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  return {
    data: data?.data ?? [],
    meta: data?.meta ?? {
      totalItems: data?.data?.length ?? 0,
      itemCount: data?.data?.length ?? 0,
      itemsPerPage: params.limit ?? DEFAULT_LIMIT,
      totalPages: 1,
      currentPage: params.page ?? DEFAULT_PAGE,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
};

export const useGetStoreOrders = (params: StoreOrdersQueryParams = {}) => {
  return useQuery({
    queryKey: ['storeOrders', params],
    queryFn: () => fetchStoreOrders(params),
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
