import api from '../api';
import { CreateTierInput, Tier, UpdateTierInput } from '@/app/admin/types/tier';

export const getTiers = async (): Promise<Tier[]> => {
  const { data } = await api.get('/tiers');
  return data;
};

export const createTier = async (tier: CreateTierInput): Promise<Tier> => {
  const { data } = await api.post('/tiers', tier);
  return data;
};

export const updateTier = async (id: string, tier: UpdateTierInput): Promise<Tier> => {
  const { data } = await api.patch(`/tiers/${id}`, tier);
  return data;
};

export const deleteTier = async (id: string): Promise<void> => {
  await api.delete(`/tiers/${id}`);
};
