import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPartners, getPartnerStats, createPartner, updatePartner, deletePartner } from './api';
import { CreatePartnerDto, UpdatePartnerDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const partnerKeys = {
    all: ['institutional-partners'] as const,
    stats: ['institutional-partners', 'stats'] as const,
};

export function useGetPartners(filters?: { status?: string; search?: string }) {
    return useQuery({
        queryKey: [...partnerKeys.all, filters ?? {}],
        queryFn: () => getPartners(filters),
    });
}

export function useGetPartnerStats() {
    return useQuery({ queryKey: partnerKeys.stats, queryFn: getPartnerStats });
}

export function useCreatePartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreatePartnerDto) => createPartner(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: partnerKeys.all });
            queryClient.invalidateQueries({ queryKey: partnerKeys.stats });
            toast.success('Partner added');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to add partner')),
    });
}

export function useUpdatePartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdatePartnerDto }) => updatePartner(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: partnerKeys.all });
            queryClient.invalidateQueries({ queryKey: partnerKeys.stats });
            toast.success('Partner updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update partner')),
    });
}

export function useDeletePartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePartner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: partnerKeys.all });
            queryClient.invalidateQueries({ queryKey: partnerKeys.stats });
            toast.success('Partner removed');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to remove partner')),
    });
}
