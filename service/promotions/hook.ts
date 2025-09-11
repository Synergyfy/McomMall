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
const createPromotion = async (
  promotionData: CreatePromotionDto
): Promise<Promotion> => {
  const { data } = await api.post<Promotion>('/promotions', promotionData);
  return data;
};

// Delete a promotion
const deletePromotion = async (id: string): Promise<void> => {
  await api.delete(`/promotions/${id}`);
};

// React Query Hook
export const usePromotions = () => {
  const queryClient = useQueryClient();

  // Query to fetch all promotions
  const {
    data: promotions,
    isLoading,
    error,
  } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: fetchPromotions,
  });

  // Mutation to create a promotion
  const createPromotionMutation = useMutation<
    Promotion,
    Error,
    CreatePromotionDto
  >({
    mutationFn: createPromotion,
    onSuccess: () => {
      // Invalidate and refetch the promotions query to update the list
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  // Mutation to delete a promotion
  const deletePromotionMutation = useMutation<void, Error, string>({
    mutationFn: deletePromotion,
    onSuccess: () => {
      // Invalidate and refetch the promotions query
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  return {
    promotions,
    isLoading,
    error,
    createPromotion: createPromotionMutation.mutateAsync,
    deletePromotion: deletePromotionMutation.mutateAsync,
  };
};
