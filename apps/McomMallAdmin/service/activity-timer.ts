import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
    ActivityTimerTemplate,
    CreateTemplateDto,
    UpdateTemplateDto,
    TemplateResponse,
    TemplateFilters
} from '@/app/admin/types/activity-timer';

const ACTIVITY_TIMER_API = '/activity-timer/templates';

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

// --- Create Template ---
export const useCreateActivityTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTemplateDto) => {
            try {
                const response = await api.post(ACTIVITY_TIMER_API, data);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to create template');
            }
        },
        onSuccess: (data) => {
            toast.success('Template created successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TEMPLATES'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

// --- Get All Templates ---
export const useGetActivityTemplates = (filters: TemplateFilters = {}) => {
    return useQuery({
        queryKey: ['FETCH_ACTIVITY_TEMPLATES', filters],
        queryFn: async () => {
            try {
                const response = await api.get<TemplateResponse>(ACTIVITY_TIMER_API, {
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
export const useGetActivityTemplate = (id: string | null) => {
    return useQuery({
        queryKey: ['FETCH_ACTIVITY_TEMPLATE', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const response = await api.get<ActivityTimerTemplate>(`${ACTIVITY_TIMER_API}/${id}`);
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
export const useUpdateActivityTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateDto }) => {
            try {
                const response = await api.patch(`${ACTIVITY_TIMER_API}/${id}`, data);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to update template');
            }
        },
        onSuccess: (_, variables) => {
            toast.success('Template updated successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TEMPLATES'] });
            queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TEMPLATE', variables.id] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

// --- Delete Template ---
export const useDeleteActivityTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                await api.delete(`${ACTIVITY_TIMER_API}/${id}`);
                return id;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to delete template');
            }
        },
        onSuccess: () => {
            toast.success('Template deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TEMPLATES'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
// --- Assign Template (Admin/Self) ---
export const useAssignActivityTemplate = () => {
    return useMutation({
        mutationFn: async (templateId: string) => {
            try {
                // Construct URL correctly with /api/v1 prefix
                const url = `/activity-timer/assign/${templateId}`;
                const response = await api.post(url);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to assign template');
            }
        },
        onSuccess: () => {
            toast.success('Template assigned to your account successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
