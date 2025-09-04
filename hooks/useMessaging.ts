import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CreateMessageDto, Message, Conversation } from '@/service/messaging/types';

interface UseSocketProps {
  token: string | null;
  userId: string | null;
}

export const useSocket = ({ token, userId }: UseSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !userId) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3009', {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to messaging server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from messaging server');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  return { socket: socketRef.current, isConnected };
};

export const useMessaging = (token: string | null, userId: string | null) => {
  const { socket, isConnected } = useSocket({ token, userId });

  const sendMessage = (messageData: CreateMessageDto) => {
    if (!socket || !isConnected) {
      throw new Error('Socket not connected');
    }

    socket.emit('sendMessage', messageData);
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    if (!socket) return;

    socket.on('newMessage', callback);

    return () => {
      socket.off('newMessage', callback);
    };
  };

  const onConversationUpdate = (
    callback: (conversation: Conversation) => void,
  ) => {
    if (!socket) return;

    socket.on('conversationUpdated', callback);

    return () => {
      socket.off('conversationUpdated', callback);
    };
  };

  return {
    sendMessage,
    onNewMessage,
    onConversationUpdate,
    isConnected,
  };
};
