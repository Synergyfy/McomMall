import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Notification, NotificationData, MarkAsSeenPayload } from './types';
import { useMemo } from 'react';

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

  const queryResult = useQuery<NotificationData, Error>({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: fetchNotifications,
    enabled: false,
    refetchInterval: 30000,
  });

  const { data: notifications } = queryResult;

  const processedData = useMemo(() => {
    if (!notifications) {
      return {
        newBookingsCount: 0,
        newOrdersCount: 0,
        newMessagesCount: 0,
        newBookingIds: [],
        newOrderIds: [],
        unseenIds: [],
        senders: {},
        notifications: [],
      };
    }

    const unseenNotifications = notifications.filter(n => !n.seen);
    const newBookings = unseenNotifications.filter(n => n.type === 'new_booking');
    const newOrders = unseenNotifications.filter(n => n.type === 'new_order');
    const newMessages = unseenNotifications.filter(n => n.type === 'new_message');

    const newBookingIds = newBookings.map(n => n.id);
    const newOrderIds = newOrders.map(n => n.id);

    const unseenIds = unseenNotifications.map(n => n.id);

    const senders = newMessages.reduce((acc, msg) => {
      if (msg.sender) {
        if (!acc[msg.sender.id]) {
          acc[msg.sender.id] = {
            count: 0,
            name: msg.sender.name,
            ids: []
          };
        }
        acc[msg.sender.id].count++;
        acc[msg.sender.id].ids.push(msg.id);
      }
      return acc;
    }, {} as Record<string, { count: number, name: string, ids: string[] }>);


    return {
      newBookingsCount: newBookings.length,
      newOrdersCount: newOrders.length,
      newMessagesCount: newMessages.length,
      newBookingIds,
      newOrderIds,
      unseenIds,
      senders,
      notifications,
    };
  }, [notifications]);

  return { ...queryResult, ...processedData };
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
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
};
