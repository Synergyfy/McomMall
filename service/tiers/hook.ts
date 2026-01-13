import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Tier } from './types';

export const useGetTiers = () => {
  const fetchTiers = async (): Promise<Tier[]> => {
    const response = await api.get<Tier[]>('/api/v1/tiers');
    return response.data;
  };

  return useQuery({
    queryKey: ['tiers'],
    queryFn: fetchTiers,
  });
};

export const useGetTierById = (id: string) => {
  const fetchTier = async (): Promise<Tier> => {
    const response = await api.get<Tier>(`/api/v1/tiers/${id}`);
    return response.data;
  };

  return useQuery({
    queryKey: ['tier', id],
    queryFn: fetchTier,
    enabled: !!id,
  });
};
