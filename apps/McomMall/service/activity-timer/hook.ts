import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  completeMockTask,
  getMockActivityTimers,
  pauseMockActivityTimer,
  resumeMockActivityTimer,
} from '@/lib/mock-data/activity-timer-mock-data';
import { ActiveTimerResponse } from './types';

const MOCK_DELAY_MS = 350;
const QUERY_KEY = ['FETCH_ACTIVITY_TIMER_STATUS'];

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Activity timers are currently simulated on the business dashboard. These
 * hooks deliberately do not touch the API — the backend activity-timer module
 * has been decommissioned. See lib/mock-data/activity-timer-mock-data.ts.
 */
export const useGetActivityTimerStatus = () => {
  return useQuery<ActiveTimerResponse[], Error>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      await wait(MOCK_DELAY_MS);
      return getMockActivityTimers();
    },
    staleTime: 0,
  });
};

export const usePauseActivityTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await wait(MOCK_DELAY_MS);
      pauseMockActivityTimer();
    },
    onSuccess: () => {
      toast.success('Timer paused');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to pause timer');
    },
  });
};

export const useResumeActivityTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await wait(MOCK_DELAY_MS);
      resumeMockActivityTimer();
    },
    onSuccess: () => {
      toast.success('Timer resumed');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to resume timer');
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      await wait(MOCK_DELAY_MS);
      completeMockTask(key);
    },
    onSuccess: () => {
      toast.success('Task marked as completed');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to complete task');
    },
  });
};
