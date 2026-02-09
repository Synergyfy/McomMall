import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ActivityTimer } from './types';
import { ErrorResponse } from '../listings/hook';

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
