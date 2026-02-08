import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from '../api';
import { PageDto } from './types';
import { Product } from '../listings/types';
import { Service } from '../services/types';
import { VoucherProduct } from '../vouchers/types';
import { GiftCardTemplate } from '../gift-cards/types';
import { CouponProduct } from '../coupons/types';

export interface DiscoveryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
}

// Generic fetcher
const fetchDiscovery = async <T>(endpoint: string, params: DiscoveryQueryParams) => {
  const { data } = await api.get<PageDto<T>>(endpoint, { params });
  return data;
};

export const useGetPublicProducts = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<Product>>>) => {
  return useQuery({
    queryKey: ['discovery', 'products', params],
    queryFn: () => fetchDiscovery<Product>('/product/public', params),
    ...options
  });
};

export const useGetPublicServices = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<Service>>>) => {
  return useQuery({
    queryKey: ['discovery', 'services', params],
    queryFn: () => fetchDiscovery<Service>('/services/public', params),
    ...options
  });
};

export const useGetPublicVouchers = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<VoucherProduct>>>) => {
  return useQuery({
    queryKey: ['discovery', 'vouchers', params],
    queryFn: () => fetchDiscovery<VoucherProduct>('/vouchers/products/public', params),
    ...options
  });
};

export const useGetPublicGiftCards = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<GiftCardTemplate>>>) => {
  return useQuery({
    queryKey: ['discovery', 'gift-cards', params],
    queryFn: () => fetchDiscovery<GiftCardTemplate>('/gift-cards/templates/public', params),
    ...options
  });
};

export const useGetPublicCoupons = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<CouponProduct>>>) => {
  return useQuery({
    queryKey: ['discovery', 'coupons', params],
    queryFn: () => fetchDiscovery<CouponProduct>('/coupons/products/public', params),
    ...options
  });
};
