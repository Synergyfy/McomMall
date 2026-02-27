import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeasons, createSeason, CreateSeasonDto } from './api';
import { toast } from 'sonner';

export const useGetSeasons = () => {
    return useQuery({
        queryKey: ['seasons'],
        queryFn: getSeasons,
    });
};

export const useCreateSeason = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateSeasonDto) => createSeason(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seasons'] });
            toast.success('Season created successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create season');
        },
    });
};
