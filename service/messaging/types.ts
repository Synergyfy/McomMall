export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  conversation?: Conversation;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages?: Message[];
  created_at: string;
  updated_at: string;
}

export interface CreateMessageDto {
  content: string;
  receiverId: string;
  conversationId?: string;
}
