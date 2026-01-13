import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Tier } from './types';

export const useGetTiers = () => {
  const fetchTiers = async (): Promise<Tier[]> => {
    // The base URL already includes /api/v1 (or equivalent prefix handled by proxy),
    // so we should only pass the relative path.
    const response = await api.get<Tier[]>('/tiers');
    return response.data;
  };

  return useQuery({
    queryKey: ['tiers'],
    queryFn: fetchTiers,
  });
};

export const useGetTierById = (id: string) => {
  const fetchTier = async (): Promise<Tier> => {
    const response = await api.get<Tier>(`/tiers/${id}`);
    return response.data;
  };

  return useQuery({
    queryKey: ['tier', id],
    queryFn: fetchTier,
    enabled: !!id,
  });
};
