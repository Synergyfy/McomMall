import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getBoroughs,
    getBoroughStats,
    getBorough,
    getBoroughCampaigns,
    getBoroughCampaignsAll,
    createBorough,
    updateBorough,
    deleteBorough,
} from './api';
import { CreateBoroughDto, UpdateBoroughDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const boroughKeys = {
    all: ['boroughs'] as const,
    stats: ['boroughs', 'stats'] as const,
    detail: (id: string) => ['boroughs', 'detail', id] as const,
    campaigns: (id: string) => ['boroughs', 'campaigns', id] as const,
};

export function useGetBoroughs() {
    return useQuery({ queryKey: boroughKeys.all, queryFn: getBoroughs });
}

export function useGetBoroughStats() {
    return useQuery({ queryKey: boroughKeys.stats, queryFn: getBoroughStats });
}

export function useGetBorough(id: string | undefined) {
    return useQuery({
        queryKey: id ? boroughKeys.detail(id) : ['boroughs', 'detail', 'none'],
        queryFn: () => getBorough(id as string),
        enabled: !!id,
    });
}

export function useGetAllBoroughCampaigns() {
    return useQuery({ queryKey: ['borough-campaigns', 'all'], queryFn: getBoroughCampaignsAll });
}

export function useGetBoroughCampaigns(id: string | undefined) {
    return useQuery({
        queryKey: id ? boroughKeys.campaigns(id) : ['boroughs', 'campaigns', 'none'],
        queryFn: () => getBoroughCampaigns(id as string),
        enabled: !!id,
    });
}

export function useCreateBorough() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateBoroughDto) => createBorough(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boroughKeys.all });
            queryClient.invalidateQueries({ queryKey: boroughKeys.stats });
            toast.success('Borough onboarded');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to onboard borough')),
    });
}

export function useUpdateBorough() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateBoroughDto }) => updateBorough(id, dto),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: boroughKeys.all });
            queryClient.invalidateQueries({ queryKey: boroughKeys.stats });
            queryClient.invalidateQueries({ queryKey: boroughKeys.detail(vars.id) });
            toast.success('Borough updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update borough')),
    });
}

export function useDeleteBorough() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteBorough(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boroughKeys.all });
            queryClient.invalidateQueries({ queryKey: boroughKeys.stats });
            toast.success('Borough removed');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to remove borough')),
    });
}
