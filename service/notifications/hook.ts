import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { NotificationData, MarkAsSeenPayload } from './types';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';

export const useGetNotifications = () => {
  const fetchNotifications = async (): Promise<NotificationData> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  };

  return useQuery<NotificationData, Error>({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: fetchNotifications,
    enabled: false, // Will be enabled when a user with the 'owner' role is logged in
  });
};

export const useMarkNotificationsAsSeen = () => {
  const queryClient = useQueryClient();

  const markAsSeen = async (payload: MarkAsSeenPayload) => {
    try {
      await api.post('/notifications/seen', payload);
    } catch (error) {
      console.error('Failed to mark notifications as seen:', error);
      throw new Error('Failed to mark notifications as seen');
    }
  };

  return useMutation<void, Error, MarkAsSeenPayload>({
    mutationFn: markAsSeen,
    onSuccess: () => {
      // Invalidate the notifications query to refetch the data
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
};
