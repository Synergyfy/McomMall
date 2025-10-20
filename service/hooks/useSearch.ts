import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export const useSearch = (query: string) => {
  return useQuery(['search', query], async () => {
    const response = await api.get(`/search?q=${query}`);
    return response.data;
  });
};
