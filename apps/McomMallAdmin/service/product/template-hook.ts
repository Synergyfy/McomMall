import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
    ProductTemplate,
    CreateProductTemplatePayload,
    UpdateProductTemplatePayload,
    ProductTemplateResponse,
    TemplateFilters
} from './template-types';

const TEMPLATE_API = '/product-variant-template';

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

// --- Create Template ---
export const useCreateProductTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateProductTemplatePayload) => {
            try {
                const response = await api.post(TEMPLATE_API, data);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to create template');
            }
        },
        onSuccess: (data) => {
            toast.success('Template created successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_PRODUCT_TEMPLATES'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

// --- Get All Templates ---
export const useGetProductTemplates = (filters: TemplateFilters = {}) => {
    return useQuery({
        queryKey: ['FETCH_PRODUCT_TEMPLATES', filters],
        queryFn: async () => {
            try {
                const response = await api.get<ProductTemplateResponse>(TEMPLATE_API, {
                    params: filters,
                });
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to fetch templates');
            }
        },
    });
};

// --- Get Single Template ---
export const useGetProductTemplate = (id: string | null) => {
    return useQuery({
        queryKey: ['FETCH_PRODUCT_TEMPLATE', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const response = await api.get<ProductTemplate>(`${TEMPLATE_API}/${id}`);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to fetch template details');
            }
        },
        enabled: !!id,
    });
};

// --- Update Template ---
export const useUpdateProductTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateProductTemplatePayload }) => {
            try {
                const response = await api.patch(`${TEMPLATE_API}/${id}`, data);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to update template');
            }
        },
        onSuccess: (_, variables) => {
            toast.success('Template updated successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_PRODUCT_TEMPLATES'] });
            queryClient.invalidateQueries({ queryKey: ['FETCH_PRODUCT_TEMPLATE', variables.id] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

// --- Delete Template ---
export const useDeleteProductTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                await api.delete(`${TEMPLATE_API}/${id}`);
                return id;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to delete template');
            }
        },
        onSuccess: () => {
            toast.success('Template deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_PRODUCT_TEMPLATES'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
