import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';

export interface DirectoryCustomer {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string | null;
  points: number;
  status: string;
  engagement: string;
  category: string;
  lastVisit: string | null;
  segments: string[];
  trustScore: number;
}

export interface CustomerDirectoryResponse {
  customers: DirectoryCustomer[];
  total: number;
}

export interface CustomerActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  businessId: string;
  created_at: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string | null;
  points: number;
  status: string;
  engagement: string;
  trustScore: number;
  bookings?: any[];
  reviews?: any[];
  promotions?: any[];
  signals?: any[];
}

export const useCustomerDirectory = (
  businessId?: string,
  options: { search?: string; category?: string; segment?: string; limit?: number; offset?: number } = {}
) =>
  useQuery<CustomerDirectoryResponse>({
    queryKey: ['customers', 'directory', businessId, options],
    queryFn: async () => {
      const { data } = await api.get('/customers/directory', {
        params: { businessId, ...options },
      });
      return data;
    },
    enabled: !!businessId,
  });

export const useCustomerActivity = (businessId?: string, limit = 50) =>
  useQuery<CustomerActivity[]>({
    queryKey: ['customers', 'activity', businessId, limit],
    queryFn: async () => {
      const { data } = await api.get('/customers/activity', {
        params: { businessId, limit },
      });
      return data;
    },
    enabled: !!businessId,
  });

export const useCustomerSegments = (businessId?: string) =>
  useQuery<CustomerSegment[]>({
    queryKey: ['customers', 'segments', businessId],
    queryFn: async () => {
      const { data } = await api.get('/customers/segments', {
        params: { businessId },
      });
      return data;
    },
    enabled: !!businessId,
  });

export const useCreateCustomerSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      businessId: string;
      name: string;
      description?: string;
      type?: string;
    }) => {
      const { data } = await api.post('/customers/segments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'segments'] });
    },
  });
};

export const useDeleteCustomerSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/customers/segments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'segments'] });
    },
  });
};

export const useCustomerDetail = (businessId?: string, customerId?: string) =>
  useQuery<CustomerDetail>({
    queryKey: ['customers', 'detail', businessId, customerId],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${customerId}`, {
        params: { businessId },
      });
      return data;
    },
    enabled: !!businessId && !!customerId,
  });
