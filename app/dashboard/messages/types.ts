export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt:string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  conversation: Conversation;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  content: string;
  receiverId: string;
}
