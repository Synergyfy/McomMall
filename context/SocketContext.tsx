'use client';
import { createContext, useContext, useEffect } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from '@/service/auth/hook';

const SocketContext = createContext(socket);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      socket.io.opts.extraHeaders = {
        Authorization: `Bearer ${token}`,
      };
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
