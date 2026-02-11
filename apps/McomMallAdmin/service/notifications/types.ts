export interface Sender {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: string;
}

export interface Notification {
  id: string;
  createdAt: string;
  updatedAt:string;
  recipientId: string;
  senderId: string | null;
  type: 'new_message' | 'new_booking' | 'new_order';
  entityId: string;
  seen: boolean;
  sender: Sender | null;
}

export type NotificationData = Notification[];

export interface MarkAsSeenPayload {
  notificationIds: string[];
}
