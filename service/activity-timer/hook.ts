import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import { ActivityTimer } from './types';
import { ErrorResponse } from '../listings/hook';
import { TrialAction } from '../payments/types';

export const useGetActivityTimers = () => {
  const fetch = async (): Promise<ActivityTimer[]> => {
    try {
      const response = await api.get('/activity-timer/status');
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch activity timers'
      );
    }
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_ACTIVITY_TIMERS'],
    enabled: true,
  });
};

export const usePauseOrResumeActivityTimer = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: { action: TrialAction; timerId: string }) => {
      const { action, timerId } = payload;
      const endpoint =
        action === TrialAction.PAUSE ? '/activity-timer/pause' : '/activity-timer/resume';
      return api.post(endpoint, { timerId });
    },
    onSuccess: () => {
      toast.success('Timer status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TIMERS'] });
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update timer status';
      toast.error(errorMessage);
    },
  });

  return mutation;
};

export const useCompleteActivityTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (key: string) => {
      return api.post(`/activity-timer/complete-task/${key}`);
    },
    onSuccess: () => {
      toast.success('Task marked as completed');
      queryClient.invalidateQueries({ queryKey: ['FETCH_ACTIVITY_TIMERS'] });
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to complete task';
      toast.error(errorMessage);
    },
  });

  return mutation;
};
