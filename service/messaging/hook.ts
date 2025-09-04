import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Conversation, Message, CreateMessageDto } from './types';

const MESSAGING_QUERY_KEY = 'messaging';

export const useGetConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: [MESSAGING_QUERY_KEY, 'conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messaging/conversations');
      return data;
    },
  });
};

export const useGetConversationMessages = (conversationId: string) => {
  return useQuery<Message[]>({
    queryKey: [MESSAGING_QUERY_KEY, 'conversations', conversationId],
    queryFn: async () => {
      const { data } = await api.get(`/messaging/conversations/${conversationId}`);
      return data;
    },
    enabled: !!conversationId,
  });
};

