import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getQualityMissions,
    getMissionStats,
    createQualityMission,
    updateQualityMission,
    deleteQualityMission,
} from './api';
import { CreateQualityMissionDto, UpdateQualityMissionDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const missionKeys = {
    all: ['quality-missions'] as const,
    stats: ['quality-missions', 'stats'] as const,
};

export function useGetQualityMissions(status?: string) {
    return useQuery({
        queryKey: [...missionKeys.all, status ?? 'all'],
        queryFn: () => getQualityMissions(status),
    });
}

export function useGetMissionStats() {
    return useQuery({ queryKey: missionKeys.stats, queryFn: getMissionStats });
}

export function useCreateQualityMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateQualityMissionDto) => createQualityMission(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: missionKeys.all });
            queryClient.invalidateQueries({ queryKey: missionKeys.stats });
            toast.success('Mission assigned');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to assign mission')),
    });
}

export function useUpdateQualityMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateQualityMissionDto }) =>
            updateQualityMission(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: missionKeys.all });
            queryClient.invalidateQueries({ queryKey: missionKeys.stats });
            toast.success('Mission updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update mission')),
    });
}

export function useDeleteQualityMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteQualityMission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: missionKeys.all });
            queryClient.invalidateQueries({ queryKey: missionKeys.stats });
            toast.success('Mission deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete mission')),
    });
}
