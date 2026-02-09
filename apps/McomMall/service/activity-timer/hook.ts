import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import { ActiveTimerResponse } from './types';

export const useGetActivityTimerStatus = () => {
    return useQuery<ActiveTimerResponse[], Error>({
        queryKey: ['FETCH_ACTIVITY_TIMER_STATUS'],
        queryFn: async () => {
            const { data } = await api.get<ActiveTimerResponse[]>('/activity-timer/status');
            return data;
        },
    });
};

export const usePauseActivityTimer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/activity-timer/pause');
        },
        onSuccess: () => {
            toast.success('Timer paused');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TIMER_STATUS'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to pause timer');
        }
    });
};

export const useResumeActivityTimer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/activity-timer/resume');
        },
        onSuccess: () => {
            toast.success('Timer resumed');
            queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TIMER_STATUS'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to resume timer');
        }
    });
};
