import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook } from './api';
import { CreateWebhookDto, UpdateWebhookDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetWebhooks() {
    return useQuery({ queryKey: ['webhooks'], queryFn: getWebhooks });
}

export function useCreateWebhook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateWebhookDto) => createWebhook(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook registered');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to register webhook')),
    });
}

export function useUpdateWebhook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateWebhookDto }) => updateWebhook(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update webhook')),
    });
}

export function useDeleteWebhook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteWebhook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete webhook')),
    });
}
