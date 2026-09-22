import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getTrainingModules,
    createTrainingModule,
    updateTrainingModule,
    deleteTrainingModule,
} from './api';
import { CreateTrainingModuleDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetTrainingModules(kind?: string) {
    return useQuery({
        queryKey: ['training-modules', kind ?? 'all'],
        queryFn: () => getTrainingModules(kind),
    });
}

export function useCreateTrainingModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateTrainingModuleDto) => createTrainingModule(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-modules'] });
            toast.success('Resource published');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to publish resource')),
    });
}

export function useToggleTrainingPublish() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
            updateTrainingModule(id, { isPublished }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-modules'] });
            toast.success('Visibility updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update resource')),
    });
}

export function useDeleteTrainingModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTrainingModule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-modules'] });
            toast.success('Resource deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete resource')),
    });
}
