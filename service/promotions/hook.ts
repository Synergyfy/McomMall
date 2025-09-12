import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { Promotion, CreatePromotionDto } from './types';

// API Functions

// Fetch all promotions
const fetchPromotions = async (): Promise<Promotion[]> => {
  const { data } = await api.get<Promotion[]>('/promotions');
  return data;
};

// Create a promotion
const addPromotion = async (
  promotionData: CreatePromotionDto
): Promise<Promotion> => {
  const { data } = await api.post<Promotion>('/promotions', promotionData);
  return data;
};

// Delete a promotion
const deletePromotion = async (id: string): Promise<void> => {
  await api.delete(`/promotions/${id}`);
};

// React Query Hooks

export const useGetPromotions = () => {
  return useQuery<Promotion[], Error>({
    queryKey: ['promotions'],
    queryFn: fetchPromotions,
  });
};

export const useAddPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation<Promotion, Error, CreatePromotionDto>({
    mutationFn: addPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
};
