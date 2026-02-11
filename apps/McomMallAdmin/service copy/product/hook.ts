import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
    AdminProductStats,
    AdminProductResponse,
    AdminProductFilters
} from './types';

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

// Fetch Admin Product Stats
export const useGetAdminProductStats = () => {
    return useQuery({
        queryKey: ['FETCH_ADMIN_PRODUCT_STATS'],
        queryFn: async () => {
            try {
                const response = await api.get<AdminProductStats>('/admin/products/stats');
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to fetch product stats');
            }
        },
    });
};

// Fetch All Admin Products
export const useGetAllAdminProducts = (filters: AdminProductFilters = {}) => {
    return useQuery({
        queryKey: ['FETCH_ALL_ADMIN_PRODUCTS', filters],
        queryFn: async () => {
            try {
                const response = await api.get<AdminProductResponse>('/admin/products', {
                    params: filters,
                });
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to fetch products');
            }
        },
    });
};

// Deactivate Product
export const useDeactivateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                const response = await api.patch(`/admin/products/${id}/deactivate`);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to deactivate product');
            }
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Product deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_PRODUCTS'] });
            queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_PRODUCT_STATS'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

// Delete Product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                const response = await api.delete(`/admin/products/${id}`);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to delete product');
            }
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Product deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_PRODUCTS'] });
            queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_PRODUCT_STATS'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
