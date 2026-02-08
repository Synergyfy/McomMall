import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  Offer,
  CreateOfferDto,
  UpdateOfferDto,
  ApplicableOffer,
  ApplyOfferRequest,
  ApplyOfferResponse,
} from './types';

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

// Get a single offer by ID
const getOfferById = async (id: string): Promise<Offer> => {
  const { data } = await api.get<Offer>(`/offer/${id}`);
  return data;
};

// Update an offer
const updateOffer = async ({
  id,
  ...offerData
}: UpdateOfferDto & { id: string }): Promise<Offer> => {
  const { data } = await api.patch<Offer>(`/offer/${id}`, offerData);
  return data;
};

// Delete an offer
const deleteOffer = async (id: string): Promise<void> => {
  await api.delete(`/offer/${id}`);
};

// Fetch applicable offers for checkout
const fetchApplicableOffers = async (
  productIds: string[]
): Promise<ApplicableOffer[]> => {
  const { data } = await api.post<ApplicableOffer[]>(
    '/checkout/applicable-offers',
    { productIds }
  );
  return data;
};

// Apply an offer
const applyOffer = async (
  applyOfferData: ApplyOfferRequest
): Promise<ApplyOfferResponse> => {
  const { data } = await api.post<ApplyOfferResponse>(
    '/offer/apply',
    applyOfferData
  );
  return data;
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

export const useGetApplicableOffers = (productIds: string[]) => {
  return useQuery<ApplicableOffer[], Error>({
    queryKey: ['applicableOffers', productIds],
    queryFn: () => fetchApplicableOffers(productIds),
    enabled: !!productIds && productIds.length > 0,
  });
};

export const useApplyOffer = () => {
  return useMutation<ApplyOfferResponse, Error, ApplyOfferRequest>({
    mutationFn: applyOffer,
  });
};

export const useGetOfferById = (id: string) => {
  return useQuery<Offer, Error>({
    queryKey: ['offers', id],
    queryFn: () => getOfferById(id),
    enabled: !!id,
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation<Offer, Error, UpdateOfferDto & { id: string }>({
    mutationFn: updateOffer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offers', data.id] });
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
