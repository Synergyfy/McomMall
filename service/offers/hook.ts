import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { Offer, CreateOfferDto } from './types';

// API Functions

// Fetch all offers
const fetchOffers = async (): Promise<Offer[]> => {
  const { data } = await api.get<Offer[]>('/offer');
  return data;
};

// Create an offer
const addOffer = async (offerData: CreateOfferDto): Promise<Offer> => {
  const { data } = await api.post<Offer>('/offer', offerData);
  return data;
};

// Delete an offer
const deleteOffer = async (id: string): Promise<void> => {
  await api.delete(`/offer/${id}`);
};

// React Query Hooks

export const useGetOffers = () => {
  return useQuery<Offer[], Error>({
    queryKey: ['offers'],
    queryFn: fetchOffers,
  });
};

export const useAddOffer = () => {
  const queryClient = useQueryClient();
  return useMutation<Offer, Error, CreateOfferDto>({
    mutationFn: addOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};
