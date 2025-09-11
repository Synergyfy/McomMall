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
const createOffer = async (offerData: CreateOfferDto): Promise<Offer> => {
  const { data } = await api.post<Offer>('/offer', offerData);
  return data;
};

// Delete an offer
const deleteOffer = async (id: string): Promise<void> => {
  await api.delete(`/offer/${id}`);
};

// React Query Hook
export const useOffers = () => {
  const queryClient = useQueryClient();

  // Query to fetch all offers
  const {
    data: offers,
    isLoading,
    error,
  } = useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: fetchOffers,
  });

  // Mutation to create an offer
  const createOfferMutation = useMutation<Offer, Error, CreateOfferDto>({
    mutationFn: createOffer,
    onSuccess: () => {
      // Invalidate and refetch the offers query to update the list
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  // Mutation to delete an offer
  const deleteOfferMutation = useMutation<void, Error, string>({
    mutationFn: deleteOffer,
    onSuccess: () => {
      // Invalidate and refetch the offers query
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  return {
    offers,
    isLoading,
    error,
    createOffer: createOfferMutation.mutateAsync,
    deleteOffer: deleteOfferMutation.mutateAsync,
  };
};
