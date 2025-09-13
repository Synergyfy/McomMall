import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  Promotion,
  CreatePromotionDto,
  UpdatePromotionDto,
  CheckPromotionDto,
  Participant,
  UpdatePointsDto,
} from './types';

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

const checkPromotions = async (
  params: CheckPromotionDto
): Promise<Promotion[]> => {
  const { data } = await api.get<Promotion[]>('/promotions/check', { params });
  return data;
};

const participateInPromotion = async (promotionId: string): Promise<void> => {
  await api.post(`/promotions/${promotionId}/participate`);
};

const getParticipants = async (): Promise<Participant[]> => {
  const { data } = await api.get<Participant[]>('/promotions/participants/all');
  return data;
};

const updateParticipantPoints = async ({
  participantId,
  amount,
}: {
  participantId: string;
  amount: number;
}): Promise<Participant> => {
  const { data } = await api.patch<Participant>(
    `/promotions/participants/${participantId}/points`,
    { amount }
  );
  return data;
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

export const useUpdateParticipantPoints = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Participant,
    Error,
    { participantId: string; amount: number }
  >({
    mutationFn: updateParticipantPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-participants'] });
    },
  });
};

export const useGetParticipants = () => {
  return useQuery<Participant[], Error>({
    queryKey: ['promotion-participants'],
    queryFn: getParticipants,
  });
};

export const useParticipateInPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: participateInPromotion,
    onSuccess: () => {
      // Invalidate queries that should be updated after participation
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
};

export const useCheckPromotions = (params: CheckPromotionDto) => {
  return useQuery<Promotion[], Error>({
    queryKey: ['promotions', 'check', params],
    queryFn: () => checkPromotions(params),
    enabled: !!params.businessId || !!params.productId,
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
