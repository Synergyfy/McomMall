import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CreateSupportMessageDto, CreateSupportTicketDto, SupportMessage, SupportTicket } from './types';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const ENDPOINT = '/support-tickets';

export const useGetSupportTickets = () => {
  return useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      try {
        const response = await api.get(ENDPOINT);
        return response.data as SupportTicket[];
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch tickets');
      }
    },
  });
};

export const useGetSupportTicket = (id: string | undefined) => {
  return useQuery({
    queryKey: ['support-tickets', id],
    queryFn: async () => {
      try {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data as SupportTicket;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch ticket details');
      }
    },
    enabled: !!id,
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSupportTicketDto) => {
      try {
        const response = await api.post(ENDPOINT, data);
        return response.data as SupportTicket;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to create ticket');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
};

export const useAddSupportMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateSupportMessageDto }) => {
      try {
        const response = await api.post(`${ENDPOINT}/${id}/messages`, data);
        return response.data as SupportMessage;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to add message');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets', variables.id] });
    },
  });
};

export const useResolveSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.patch(`${ENDPOINT}/${id}/resolve`);
        return response.data as SupportTicket;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to resolve ticket');
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets', id] });
    },
  });
};