import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { MarketplacePublicData } from './types';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const useGetMarketplacePublic = () => {
  return useQuery({
    queryKey: ['marketplace', 'public'],
    queryFn: async () => {
      try {
        const { data } = await api.get<MarketplacePublicData>('marketplace/public');
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch marketplace public data'
        );
      }
    },
  });
};
