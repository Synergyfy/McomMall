import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from './types';

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

// Get a single promotion by ID
const getPromotionById = async (id: string): Promise<Promotion> => {
  const { data } = await api.get<Promotion>(`/promotions/${id}`);
  return data;
};

// Update a promotion
const updatePromotion = async ({
  id,
  ...promotionData
}: UpdatePromotionDto & { id: string }): Promise<Promotion> => {
  const { data } = await api.patch<Promotion>(
    `/promotions/${id}`,
    promotionData
  );
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

export const useGetPromotionById = (id: string) => {
  return useQuery<Promotion, Error>({
    queryKey: ['promotions', id],
    queryFn: () => getPromotionById(id),
    enabled: !!id,
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation<Promotion, Error, UpdatePromotionDto & { id: string }>({
    mutationFn: updatePromotion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', data.id] });
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
