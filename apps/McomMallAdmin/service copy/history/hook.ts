import { useQuery } from '@tanstack/react-query';
import {
  UserPromotion,
  UserTransaction,
  RedeemedOffer,
  PaginatedResponse,
} from './types';
import api from '../api';

// API Functions

const fetchUserPromotions = async (
  userId: string
): Promise<{ data: { promotions: UserPromotion[] } }> => {
  const { data } = await api.get(`/users/${userId}/promotions`);
  return data;
};

const fetchUserTransactions = async (
  userId: string,
  page: number,
  per_page: number
): Promise<PaginatedResponse<{ transactions: UserTransaction[] }>> => {
  const { data } = await api.get(`/users/${userId}/transactions`, {
    params: { page, per_page },
  });
  return data;
};

const fetchRedeemedOffers = async (
  userId: string,
  page: number,
  per_page: number
): Promise<PaginatedResponse<{ redeemedOffers: RedeemedOffer[] }>> => {
  const { data } = await api.get(`/users/${userId}/redeemed-offers`, {
    params: { page, per_page },
  });
  return data;
};

// React Query Hooks

export const useGetUserPromotions = (userId: string | null) => {
  return useQuery<{ data: { promotions: UserPromotion[] } }, Error>({
    queryKey: ['userPromotions', userId],
    queryFn: () => fetchUserPromotions(userId!),
    enabled: userId !== null,
  });
};

export const useGetUserTransactions = (
  userId: string | null,
  page: number,
  per_page: number
) => {
  return useQuery<
    PaginatedResponse<{ transactions: UserTransaction[] }>,
    Error
  >({
    queryKey: ['userTransactions', userId, page, per_page],
    queryFn: () => fetchUserTransactions(userId!, page, per_page),
    enabled: userId !== null,
  });
};

export const useGetRedeemedOffers = (
  userId: string | null,
  page: number,
  per_page: number
) => {
  return useQuery<PaginatedResponse<{ redeemedOffers: RedeemedOffer[] }>, Error>({
    queryKey: ['redeemedOffers', userId, page, per_page],
    queryFn: () => fetchRedeemedOffers(userId!, page, per_page),
    enabled: userId !== null,
  });
};
