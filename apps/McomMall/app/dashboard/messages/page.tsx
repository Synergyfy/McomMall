'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetConversations } from '@/service/messaging/hook';
import { Conversation } from '@/service/messaging/types';
import ConversationSidebar from './components/ConversationSidebar';
import MessageView from './components/MessageView';
import { useMarkNotificationsAsSeen, useGetNotifications } from '@/service/notifications/hook';
import { useAuth } from '@/service/auth/hook';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function MessagesContent() {
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
    return (
      <div className="flex h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <div className="w-full md:w-1/4 border-r border-gray-100 p-6 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 transition-all duration-500">
      <div
        className={`
          ${isSidebarVisible ? 'block' : 'hidden'}
          md:block w-full md:w-1/4 bg-white
          h-full min-h-0 overflow-hidden
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
          md:block flex-1 flex flex-col w-full md:w-3/4 bg-gray-50/10
          h-full min-h-0 overflow-hidden
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

export default function MessagesPage() {
  return (
    <div className="p-0 md:p-2 lg:p-4 max-w-[1600px] mx-auto h-full animate-in fade-in duration-700 overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
