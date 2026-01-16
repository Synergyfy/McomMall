import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Tier } from './types';

export const useGetTiers = (type: string = 'all') => {
  const fetchTiers = async (): Promise<Tier[]> => {
    // The base URL already includes /api/v1 (or equivalent prefix handled by proxy),
    // so we should only pass the relative path.
    const response = await api.get<Tier[]>('/tier', {
      params: { type },
    });
    return response.data;
  };

  return useQuery({
    queryKey: ['tiers', type],
    queryFn: fetchTiers,
  });
};

export const useGetTierById = (id: string) => {
  const fetchTier = async (): Promise<Tier> => {
    const response = await api.get<Tier>(`/tier/${id}`);
    return response.data;
  };

  return useQuery({
    queryKey: ['tier', id],
    queryFn: fetchTier,
    enabled: !!id,
  });
};
