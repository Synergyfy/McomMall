import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTier, deleteTier, getTiers, updateTier } from './api';
import { CreateTierInput, UpdateTierInput } from '@/app/admin/types/tier';
import { toast } from 'sonner';

export const useGetTiers = () => {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: getTiers,
  });
};

export const useCreateTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tier: CreateTierInput) => createTier(tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      toast.success('Tier created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create tier');
    },
  });
};

export const useUpdateTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTierInput }) => updateTier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      toast.success('Tier updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update tier');
    },
  });
};

export const useDeleteTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      toast.success('Tier deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete tier');
    },
  });
};
