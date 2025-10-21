import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { PaginatedResponse, Product, Service } from './types';
import { ErrorResponse } from '../listings/hook';

export const useSearch = (query: string) => {
  const fetch = async () => {
    try {
      const response = await api.get('/search', {
        params: { q: query },
      });
      return response.data as PaginatedResponse<Product | Service>;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch search results'
      );
    }
  };

  const queryResult = useQuery({
    queryFn: fetch,
    queryKey: ['SEARCH', query],
    enabled: !!query,
  });

  return queryResult;
};
