import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getExpos, getExpoStats, createExpo, updateExpo, deleteExpo } from './api';
import { CreateExpoDto, UpdateExpoDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const expoKeys = {
    all: ['expos'] as const,
    stats: ['expos', 'stats'] as const,
};

export function useGetExpos(filters?: { status?: string; boroughId?: string }) {
    return useQuery({
        queryKey: [...expoKeys.all, filters ?? {}],
        queryFn: () => getExpos(filters),
    });
}

export function useGetExpoStats() {
    return useQuery({ queryKey: expoKeys.stats, queryFn: getExpoStats });
}

export function useCreateExpo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateExpoDto) => createExpo(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expoKeys.all });
            queryClient.invalidateQueries({ queryKey: expoKeys.stats });
            toast.success('Expo created');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to create expo')),
    });
}

export function useUpdateExpo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateExpoDto }) => updateExpo(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expoKeys.all });
            queryClient.invalidateQueries({ queryKey: expoKeys.stats });
            toast.success('Expo updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update expo')),
    });
}

export function useDeleteExpo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteExpo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expoKeys.all });
            queryClient.invalidateQueries({ queryKey: expoKeys.stats });
            toast.success('Expo deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete expo')),
    });
}
