import { useEffect } from 'react';
import { Conversation } from '@/service/messaging/types';
import { useAuth } from '@/service/auth/hook';
import { useMessaging } from '@/hooks/useMessaging';
import { useQueryClient } from '@tanstack/react-query';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
}

export default function ConversationSidebar({
  conversations,
  selectedConversation,
  onConversationSelect,
}: ConversationSidebarProps) {
  const { user: currentUser, token } = useAuth();
  const { onNewMessage, onConversationUpdate } = useMessaging(
    token,
    currentUser?.id || null
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const cleanupNewMessage = onNewMessage(() => {
      queryClient.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
    });

    const cleanupConversationUpdate = onConversationUpdate(() => {
      queryClient.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
    });

    return () => {
      cleanupNewMessage?.();
      cleanupConversationUpdate?.();
    };
  }, [onNewMessage, onConversationUpdate, queryClient]);

  const getContactName = (conversation: Conversation) => {
    const participant = conversation.participants.find(p => p.id !== currentUser?.id);
    return participant?.name || 'Unknown';
  };

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="p-4 text-xl font-semibold border-b">Conversations</h2>
      <ul>
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedConversation?.id === conversation.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => onConversationSelect(conversation)}
          >
            <div className="flex items-center">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
              <div>
                <p className="font-semibold">{getContactName(conversation)}</p>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.messages && conversation.messages.length > 0
                    ? conversation.messages[conversation.messages.length - 1]?.content
                    : 'No messages yet'}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
