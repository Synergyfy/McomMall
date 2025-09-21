'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetConversations } from '@/service/messaging/hook';
import { Conversation } from '@/service/messaging/types';
import ConversationSidebar from './components/ConversationSidebar';
import MessageView from './components/MessageView';
import { Menu, X } from 'lucide-react';
import { useMarkNotificationsAsSeen, useGetNotifications } from '@/service/notifications/hook';
import { useAuth } from '@/service/auth/hook';

export default function MessagesPage() {
  const { data: conversations, isLoading } = useGetConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const { user } = useAuth();
  const { senders } = useGetNotifications();
  const { mutate: markAsSeen } = useMarkNotificationsAsSeen();
  const searchParams = useSearchParams();

  const markConversationAsSeen = useCallback((conversation: Conversation) => {
    if (!user) return;
    const sender = conversation.participants.find(p => p.id !== user.id);
    if (sender && senders[sender.id]) {
      markAsSeen({ notificationIds: senders[sender.id].ids });
    }
  }, [user, senders, markAsSeen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(!selectedConversation);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [selectedConversation]);

  useEffect(() => {
    if (conversations && conversations.length > 0 && user) {
      const conversationId = searchParams.get('conversationId');
      let conversationToSelect: Conversation | null = null;

      if (conversationId) {
        conversationToSelect = conversations.find(c => c.id === conversationId) || null;
      } else if (!selectedConversation) {
        conversationToSelect = conversations[0];
      }

      if (conversationToSelect) {
        setSelectedConversation(conversationToSelect);
        markConversationAsSeen(conversationToSelect);
        if (window.innerWidth < 768) {
          setIsSidebarVisible(false);
        }
      }
    }
  }, [conversations, searchParams, selectedConversation, user, markConversationAsSeen]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    markConversationAsSeen(conversation);
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setIsSidebarVisible(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-100px)] bg-gray-100 overflow-hidden">
      <div
        className={`
          ${isSidebarVisible ? 'block' : 'hidden'}
          md:block w-full md:w-1/4 bg-white border-r border-gray-200
          h-full
        `}
      >
        <ConversationSidebar
          conversations={conversations || []}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      <div
        className={`
          ${!isSidebarVisible ? 'block' : 'hidden'}
          md:block flex-1 flex flex-col w-full md:w-3/4
        `}
      >
        <MessageView
          conversation={selectedConversation}
          onBack={handleBackToConversations}
        />
      </div>
    </div>
  );
}
