export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicketUser {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
}

export interface SupportMessage {
    id: string;
    message: string;
    user?: SupportTicketUser;
    userId?: string;
    isStaffReply?: boolean;
    created_at?: string;
    createdAt?: string;
}

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    status: TicketStatus;
    user?: SupportTicketUser;
    userId: string;
    messages?: SupportMessage[];
    lastMessageAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
}
