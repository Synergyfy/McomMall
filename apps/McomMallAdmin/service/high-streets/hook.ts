import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getHighStreets,
    getHighStreetStats,
    createHighStreet,
    updateHighStreet,
    deleteHighStreet,
} from './api';
import { CreateHighStreetDto, UpdateHighStreetDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const highStreetKeys = {
    all: ['high-streets'] as const,
    stats: ['high-streets', 'stats'] as const,
};

export function useGetHighStreets(filters?: { status?: string; boroughId?: string }) {
    return useQuery({
        queryKey: [...highStreetKeys.all, filters ?? {}],
        queryFn: () => getHighStreets(filters),
    });
}

export function useGetHighStreetStats() {
    return useQuery({ queryKey: highStreetKeys.stats, queryFn: getHighStreetStats });
}

export function useCreateHighStreet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateHighStreetDto) => createHighStreet(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: highStreetKeys.all });
            queryClient.invalidateQueries({ queryKey: highStreetKeys.stats });
            toast.success('High street activated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to activate high street')),
    });
}

export function useUpdateHighStreet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateHighStreetDto }) => updateHighStreet(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: highStreetKeys.all });
            queryClient.invalidateQueries({ queryKey: highStreetKeys.stats });
            toast.success('High street updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update high street')),
    });
}

export function useDeleteHighStreet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteHighStreet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: highStreetKeys.all });
            queryClient.invalidateQueries({ queryKey: highStreetKeys.stats });
            toast.success('High street removed');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to remove high street')),
    });
}
