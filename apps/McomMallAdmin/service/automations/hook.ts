import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getAutomationsByBusiness,
    getAutomationSummary,
    getAutomationById,
    updateAutomation,
    deleteAutomation,
} from './api';
import { UpdateAutomationDto } from './types';

export const automationKeys = {
    all: ['automations'] as const,
    byBusiness: (businessId: string) => [...automationKeys.all, 'business', businessId] as const,
    summary: (businessId: string) => [...automationKeys.all, 'summary', businessId] as const,
    detail: (id: string) => [...automationKeys.all, 'detail', id] as const,
};

export function useGetAutomationsByBusiness(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? automationKeys.byBusiness(businessId) : ['automations', 'business', 'none'],
        queryFn: () => getAutomationsByBusiness(businessId as string),
        enabled: !!businessId,
    });
}

export function useGetAutomationSummary(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? automationKeys.summary(businessId) : ['automations', 'summary', 'none'],
        queryFn: () => getAutomationSummary(businessId as string),
        enabled: !!businessId,
    });
}

export function useGetAutomationById(id: string | undefined) {
    return useQuery({
        queryKey: id ? automationKeys.detail(id) : ['automations', 'detail', 'none'],
        queryFn: () => getAutomationById(id as string),
        enabled: !!id,
    });
}

export function useUpdateAutomation(businessId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateAutomationDto }) => updateAutomation(id, dto),
        onSuccess: (_data, vars) => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: automationKeys.byBusiness(businessId) });
                queryClient.invalidateQueries({ queryKey: automationKeys.summary(businessId) });
            } else {
                queryClient.invalidateQueries({ queryKey: automationKeys.all });
            }
            queryClient.invalidateQueries({ queryKey: automationKeys.detail(vars.id) });
            toast.success('Automation updated');
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to update automation';
            toast.error(message);
        },
    });
}

export function useDeleteAutomation(businessId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteAutomation(id),
        onSuccess: () => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: automationKeys.byBusiness(businessId) });
                queryClient.invalidateQueries({ queryKey: automationKeys.summary(businessId) });
            } else {
                queryClient.invalidateQueries({ queryKey: automationKeys.all });
            }
            toast.success('Automation deleted');
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to delete automation';
            toast.error(message);
        },
    });
}
