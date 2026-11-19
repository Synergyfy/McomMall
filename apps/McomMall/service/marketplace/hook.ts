import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import api from '../api';
import { MarketplacePublicData } from './types';
import type { DiscoveryQueryParams } from './discovery';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const useGetMarketplacePublic = (
  params: DiscoveryQueryParams = {},
  options?: Partial<UseQueryOptions<MarketplacePublicData>>,
) => {
  return useQuery({
    queryKey: ['marketplace', 'public', params],
    queryFn: async () => {
      try {
        const { data } = await api.get<MarketplacePublicData>(
          'marketplace/public',
          { params },
        );
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch marketplace public data'
        );
      }
    },
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options
  });
};
