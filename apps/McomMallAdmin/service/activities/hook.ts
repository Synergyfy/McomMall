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

export interface AdminActivity {
  id: string;
  action: string;
  target: string;
  targetName: string;
  user?: { id: string; firstName?: string; lastName?: string; fullName?: string; email?: string } | null;
  userId?: string;
  created_at?: string;
  listing?: { id: string } | null;
  product?: { id: string } | null;
  service?: { id: string } | null;
  order?: { id: string } | null;
  booking?: { id: string } | null;
  promotion?: { id: string } | null;
}

export const useGetAdminActivities = () => {
  return useQuery<AdminActivity[], Error>({
    queryKey: ['admin-activities'],
    queryFn: async () => {
      const { data } = await api.get<AdminActivity[]>('/admin/activities');
      return data;
    },
  });
};
