export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface SupportMessage {
  id: string;
  content: string;
  senderId: string;
  ticketId: string;
  isAdminMessage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  userId: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}