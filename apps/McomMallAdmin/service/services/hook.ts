import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
  AdminServiceStats,
  AdminServiceResponse,
  AdminServiceFilters,
  Service
} from './types';

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Fetch Service by ID
export const useGetServiceById = (id: string) => {
  return useQuery({
    queryKey: ['FETCH_SERVICE_BY_ID', id],
    queryFn: async () => {
      try {
        const response = await api.get<Service>(`/services/${id}`);
        return response.data;
      } catch (error: any) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch service');
      }
    },
    enabled: !!id,
  });
};

// Fetch Services by Business ID
export const useGetServicesByBusiness = (businessId: string) => {
  return useQuery({
    queryKey: ['FETCH_SERVICES_BY_BUSINESS', businessId],
    queryFn: async () => {
      try {
        const response = await api.get<Service[]>(`/services/business/${businessId}`);
        return response.data;
      } catch (error: any) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch business services');
      }
    },
    enabled: !!businessId,
  });
};

// Fetch Admin Service Stats
export const useGetAdminServiceStats = () => {
  return useQuery({
    queryKey: ['FETCH_ADMIN_SERVICE_STATS'],
    queryFn: async () => {
      try {
        const response = await api.get<AdminServiceStats>('/admin/services/stats');
        return response.data;
      } catch (error: any) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch service stats');
      }
    },
  });
};

// Fetch All Admin Services
export const useGetAllAdminServices = (filters: AdminServiceFilters = {}) => {
  return useQuery({
    queryKey: ['FETCH_ALL_ADMIN_SERVICES', filters],
    queryFn: async () => {
      try {
        const response = await api.get<AdminServiceResponse>('/admin/services', {
          params: filters,
        });
        return response.data;
      } catch (error: any) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch services');
      }
    },
  });
};

// Delete Service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.delete(`/admin/services/${id}`);
        return response.data;
      } catch (error: any) {
        const err = error as ErrorResponse;
        throw new Error(err.response?.data?.message || err.message || 'Failed to delete service');
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_SERVICES'] });
      queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_SERVICE_STATS'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
