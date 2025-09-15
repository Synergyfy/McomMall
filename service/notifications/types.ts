export interface NotificationCategory {
  count: number;
  ids: string[];
}

export interface MessageSender {
  count: number;
  ids: string[];
}

export interface NotificationData {
  total: number;
  newOrders: NotificationCategory;
  newBookings: NotificationCategory;
  newMessages: {
    total: number;
    senders: Record<string, MessageSender>;
  };
}

export interface MarkAsSeenPayload {
  notificationIds: string[];
}
