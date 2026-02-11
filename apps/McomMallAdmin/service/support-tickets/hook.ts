import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { SupportTicket, SupportMessage } from './types';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const ENDPOINT = 'support-tickets';

export const useGetSupportTickets = () => {
  return useQuery({
    queryKey: ['admin-support-tickets'],
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
    queryKey: ['admin-support-tickets', id],
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

export const useAddSupportMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      try {
        const response = await api.post(`${ENDPOINT}/${id}/messages`, { content });
        return response.data as SupportMessage;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to add message');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets', variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets', id] });
    },
  });
};

export const useCloseSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.patch(`${ENDPOINT}/${id}/close`);
        return response.data as SupportTicket;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to close ticket');
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets', id] });
    },
  });
};
