import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Activity } from './types';
import { useAuth } from '../auth/hook';

export const useRecentActivities = () => {
  const { user } = useAuth();

  return useQuery<Activity[], Error>({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      const { data } = await api.get<Activity[]>('/activities');
      return data;
    },
    enabled: !!user,
  });
};
