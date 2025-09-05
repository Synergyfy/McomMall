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
    refetchInterval: 5000,
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
    refetchInterval: 5000,
  });
};

import { useRouter } from 'next/navigation';

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (message: CreateMessageDto) => {
      const { data } = await api.post('/messaging', {
        content: message.content,
        receiverId: message.receiverId,
      });
      return data;
    },
    onSuccess: (data: Message) => {
      queryClient.invalidateQueries({
        queryKey: [MESSAGING_QUERY_KEY, 'conversations'],
      });
      if (data.conversation) {
        router.push(`/dashboard/messages?conversationId=${data.conversation.id}`);
      }
    },
  });
};
