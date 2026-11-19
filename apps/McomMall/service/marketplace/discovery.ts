import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import api from '../api';
import {
  MarketplaceLocationFacets,
  MarketplaceLocationLevel,
  MarketplaceLocationSearchResponse,
  PageDto,
  ResolvedMarketplaceLocation,
} from './types';
import { Product } from '../listings/types';
import { Service } from '../services/types';
import { VoucherProduct } from '../vouchers/types';
import { GiftCardTemplate } from '../gift-cards/types';
import { CouponProduct } from '../coupon-products/types';

export interface DiscoveryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  locationType?: MarketplaceLocationLevel;
  locationId?: string;
  locationName?: string;
  nearLocalMallId?: string;
  nearHighStreetId?: string;
  nearBoroughId?: string;
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
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useGetPublicServices = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<Service>>>) => {
  return useQuery({
    queryKey: ['discovery', 'services', params],
    queryFn: () => fetchDiscovery<Service>('/services/public', params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useGetPublicVouchers = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<VoucherProduct>>>) => {
  return useQuery({
    queryKey: ['discovery', 'vouchers', params],
    queryFn: () => fetchDiscovery<VoucherProduct>('/vouchers/products/public', params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useGetPublicGiftCards = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<GiftCardTemplate>>>) => {
  return useQuery({
    queryKey: ['discovery', 'gift-cards', params],
    queryFn: () => fetchDiscovery<GiftCardTemplate>('/gift-cards/templates/public', params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useGetPublicCoupons = (params: DiscoveryQueryParams = {}, options?: Partial<UseQueryOptions<PageDto<CouponProduct>>>) => {
  return useQuery({
    queryKey: ['discovery', 'coupons', params],
    queryFn: () => fetchDiscovery<CouponProduct>('/coupons/products/public', params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options
  });
};

/**
 * City → Borough → High Street → Local Mall tree with live business counts.
 * The API caches the aggregate; the frontend keeps it for five minutes so
 * opening the location picker is instant.
 */
export const useGetMarketplaceLocations = (
  options?: Partial<UseQueryOptions<MarketplaceLocationFacets>>,
) => {
  return useQuery({
    queryKey: ['marketplace', 'locations'],
    queryFn: async () => {
      const { data } = await api.get<MarketplaceLocationFacets>(
        '/marketplace/locations',
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
};

/**
 * Postcode / place-name search. Works before the hierarchy backfill because the
 * API always returns an outward-code match from local business postcodes.
 */
export const useSearchMarketplaceLocations = (
  query: string,
  options?: Partial<UseQueryOptions<MarketplaceLocationSearchResponse>>,
) => {
  return useQuery({
    queryKey: ['marketplace', 'locations', 'search', query],
    queryFn: async () => {
      const { data } = await api.get<MarketplaceLocationSearchResponse>(
        '/marketplace/location/search',
        { params: { q: query } },
      );
      return data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
};

export interface ResolveLocationParams {
  postcode?: string;
  lat?: number;
  lng?: number;
}

/**
 * Resolves the shopper from their Central profile, a postcode or browser
 * coordinates. Outside the UK the API returns the closest city with sellers.
 */
export const useResolveMarketplaceLocation = (
  params: ResolveLocationParams | null,
  options?: Partial<UseQueryOptions<ResolvedMarketplaceLocation>>,
) => {
  return useQuery({
    queryKey: ['marketplace', 'location', 'resolve', params],
    queryFn: async () => {
      const { data } = await api.get<ResolvedMarketplaceLocation>(
        '/marketplace/location/resolve',
        { params: params || {} },
      );
      return data;
    },
    enabled: Boolean(params),
    retry: false,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
};
