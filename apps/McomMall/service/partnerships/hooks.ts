import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  CreateUserPartnershipRequestDto,
  RespondToUserPartnershipRequestDto,
  CreateItemPartnershipRequestDto,
  UserPartnershipRequest,
  UserPartner,
  ItemPartnershipRequest,
  PartnershipAnalytics
} from './types';

// --- User Partnerships ---

export const useCreateUserPartnershipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<UserPartnershipRequest, Error, CreateUserPartnershipRequestDto>({
    mutationFn: async (dto) => (await api.post('/partnerships/user-request', dto)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-user-requests'] });
      queryClient.invalidateQueries({ queryKey: ['partnership-analytics'] });
    },
  });
};

export const useRespondToUserPartnershipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<UserPartnershipRequest, Error, { id: string; dto: RespondToUserPartnershipRequestDto }>({
    mutationFn: async ({ id, dto }) => (await api.patch(`/partnerships/user-request/${id}/respond`, dto)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-user-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-partners'] });
      queryClient.invalidateQueries({ queryKey: ['partnership-analytics'] });
    },
  });
};

export const useGetSentUserRequests = () => {
  return useQuery<UserPartnershipRequest[], Error>({
    queryKey: ['sent-user-requests'],
    queryFn: async () => (await api.get('/partnerships/requests/user/sent')).data,
  });
};

export const useGetReceivedUserRequests = () => {
  return useQuery<UserPartnershipRequest[], Error>({
    queryKey: ['received-user-requests'],
    queryFn: async () => (await api.get('/partnerships/requests/user/received')).data,
  });
};

export const useGetSentItemRequests = () => {
    return useQuery<ItemPartnershipRequest[], Error>({
      queryKey: ['sent-item-requests'],
      queryFn: async () => (await api.get('/partnerships/requests/item/sent')).data,
    });
  };
  
export const useGetReceivedItemRequests = () => {
    return useQuery<ItemPartnershipRequest[], Error>({
        queryKey: ['received-item-requests'],
        queryFn: async () => (await api.get('/partnerships/requests/item/received')).data,
    });
};

export const useGetMyPartners = () => {
  return useQuery<UserPartner[], Error>({
    queryKey: ['my-partners'],
    queryFn: async () => (await api.get('/partnerships/my-partners')).data,
  });
};

// --- Item "Plus" Partnerships ---

export const useCreateItemPartnershipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<ItemPartnershipRequest, Error, CreateItemPartnershipRequestDto>({
    mutationFn: async (dto) => (await api.post('/partnerships/item-request', dto)).data,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['partnership-analytics'] });
    }
  });
};

export const useRespondToItemPartnershipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<ItemPartnershipRequest, Error, { id: string; dto: RespondToUserPartnershipRequestDto }>({
    mutationFn: async ({ id, dto }) => (await api.patch(`/partnerships/item-request/${id}/respond`, dto)).data,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['partnership-analytics'] });
    }
  });
};

export const useGetPartnerItems = (partnershipId: string) => {
    return useQuery<any, Error>({
        queryKey: ['partner-items', partnershipId],
        queryFn: async () => (await api.get(`/partnerships/partner-items/${partnershipId}`)).data,
        enabled: !!partnershipId,
    });
};

export const useGetPartnershipAnalytics = () => {
  return useQuery<PartnershipAnalytics, Error>({
    queryKey: ['partnership-analytics'],
    queryFn: async () => (await api.get('/partnerships/analytics')).data,
  });
};

export const useGetProductsByUserId = (userId: string) => {
    return useQuery<any[], Error>({
        queryKey: ['user-products', userId],
        queryFn: async () => (await api.get(`/product/user/${userId}`)).data,
        enabled: !!userId,
    });
};

export const useGetServicesByUserId = (userId: string) => {
    return useQuery<any[], Error>({
        queryKey: ['user-services', userId],
        queryFn: async () => (await api.get(`/services/user/${userId}`)).data,
        enabled: !!userId,
    });
};

export const useSearchOwners = (query: string) => {
  return useQuery<any[], Error>({
    queryKey: ['search-owners', query],
    queryFn: async () => (await api.get(`/partnerships/search-owners?q=${query}`)).data,
    enabled: query.length >= 2,
  });
};

export const useSearchPartnerItems = (query: string) => {
  return useQuery<any[], Error>({
    queryKey: ['search-partner-items', query],
    queryFn: async () => (await api.get(`/partnerships/search-items?q=${query}`)).data,
    enabled: query.length >= 2,
  });
};

export const useGetServicePlusItems = (serviceId: string) => {
    return useQuery<any[], Error>({
        queryKey: ['service-plus-items', serviceId],
        queryFn: async () => (await api.get(`/partnerships/service/${serviceId}/plus-items`)).data,
        enabled: !!serviceId,
    });
};

export const useGetProductPlusItems = (productId: string) => {
    return useQuery<any[], Error>({
        queryKey: ['product-plus-items', productId],
        queryFn: async () => (await api.get(`/partnerships/product/${productId}/plus-items`)).data,
        enabled: !!productId,
    });
};

export const useCreateCompositePartnershipRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateItemPartnershipRequestDto) => {
            return (await api.post('/partnerships/composite-request', data)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sent-user-requests'] });
            queryClient.invalidateQueries({ queryKey: ['my-partners'] });
        },
    });
};