import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getLoyaltyStats,
    getLoyaltyRules,
    updateLoyaltyRule,
    deleteLoyaltyRule,
    getLoyaltySettings,
    updateLoyaltySettings,
} from './api';
import { UpdateLoyaltyRuleDto, UpdateLoyaltySettingsDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const loyaltyKeys = {
    all: ['loyalty'] as const,
    stats: (businessId: string) => [...loyaltyKeys.all, 'stats', businessId] as const,
    rules: (businessId: string) => [...loyaltyKeys.all, 'rules', businessId] as const,
    settings: (businessId: string) => [...loyaltyKeys.all, 'settings', businessId] as const,
};

export function useGetLoyaltyStats(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? loyaltyKeys.stats(businessId) : ['loyalty', 'stats', 'none'],
        queryFn: () => getLoyaltyStats(businessId as string),
        enabled: !!businessId,
    });
}

export function useGetLoyaltyRules(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? loyaltyKeys.rules(businessId) : ['loyalty', 'rules', 'none'],
        queryFn: () => getLoyaltyRules(businessId as string),
        enabled: !!businessId,
    });
}

export function useUpdateLoyaltyRule(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateLoyaltyRuleDto }) =>
            updateLoyaltyRule(id, dto),
        onSuccess: () => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: loyaltyKeys.rules(businessId) });
                queryClient.invalidateQueries({ queryKey: loyaltyKeys.stats(businessId) });
            }
            toast.success('Loyalty rule updated');
        },
        onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to update rule')),
    });
}

export function useDeleteLoyaltyRule(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteLoyaltyRule(id),
        onSuccess: () => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: loyaltyKeys.rules(businessId) });
                queryClient.invalidateQueries({ queryKey: loyaltyKeys.stats(businessId) });
            }
            toast.success('Loyalty rule deleted');
        },
        onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to delete rule')),
    });
}

export function useGetLoyaltySettings(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? loyaltyKeys.settings(businessId) : ['loyalty', 'settings', 'none'],
        queryFn: () => getLoyaltySettings(businessId as string),
        enabled: !!businessId,
    });
}

export function useUpdateLoyaltySettings(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateLoyaltySettingsDto) =>
            updateLoyaltySettings(businessId as string, dto),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: loyaltyKeys.settings(businessId) });
            toast.success('Loyalty settings saved');
        },
        onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to save settings')),
    });
}
