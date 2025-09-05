import { useState, useEffect, useRef } from 'react';
import { Conversation } from '@/service/messaging/types';
import { useGetConversationMessages } from '@/service/messaging/hook';
import { useAuth } from '@/service/auth/hook';
import { useQueryClient } from '@tanstack/react-query';
import { useMessaging } from '@/hooks/useMessaging';

interface MessageViewProps {
  conversation: Conversation | null;
}

import { Message } from '@/service/messaging/types';

export default function MessageView({ conversation }: MessageViewProps) {
  const { data: messages, isLoading } = useGetConversationMessages(conversation?.id || '');
  const { user: currentUser, token } = useAuth();
  const { sendMessage, onNewMessage } = useMessaging(token, currentUser?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getContactName = (conversation: Conversation) => {
    const participant = conversation.participants.find(p => p.id !== currentUser?.id);
    return participant?.name || 'Unknown';
  };

  useEffect(() => {
    const cleanup = onNewMessage((message: Message) => {
      if (message.conversation && message.conversation.id === conversation?.id) {
        queryClient.invalidateQueries({
          queryKey: ['messaging', 'conversations', conversation.id],
        });
      }
    });

    return cleanup;
  }, [onNewMessage, conversation, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !conversation || !currentUser) return;

    const receiver = conversation.participants.find(p => p.id !== currentUser.id);

    if (!receiver) {
      console.error("Could not determine the receiver of the message. The participants array may be incomplete.");
      return;
    }

    try {
      sendMessage({
        content: newMessage,
        receiverId: receiver.id,
        conversationId: conversation.id,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
        <h2 className="text-xl font-semibold">{getContactName(conversation)}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages?.map(message => (
          <div
            key={message.id}
            className={`flex my-2 ${
              message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                message.sender.id === currentUser?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs text-right mt-1 opacity-75">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
