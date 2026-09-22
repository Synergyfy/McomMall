import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getIntegrationSettings, updateIntegrationSettings, getBillingSummary } from './api';
import { UpdateIntegrationSettingsDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetIntegrationSettings(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? ['settings', 'integrations', businessId] : ['settings', 'integrations', 'none'],
        queryFn: () => getIntegrationSettings(businessId as string),
        enabled: !!businessId,
    });
}

export function useUpdateIntegrationSettings(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateIntegrationSettingsDto) =>
            updateIntegrationSettings(businessId as string, dto),
        onSuccess: () => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: ['settings', 'integrations', businessId] });
            }
            toast.success('Integration settings saved');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to save settings')),
    });
}

export function useGetBillingSummary() {
    return useQuery({ queryKey: ['settings', 'billing'], queryFn: getBillingSummary });
}
