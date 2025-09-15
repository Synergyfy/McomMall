export interface NotificationData {
  total: number;
  newOrders: number;
  newBookings: number;
  newMessages: {
    total: number;
    senders: Record<string, number>;
  };
}

export interface MarkAsSeenPayload {
  notificationIds: string[];
}
