'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { setBearerToken } from '@/service/api';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/service/store/store';
import { loadAuthFromCookies } from '@/service/store/authSlice';
import { useTokenRefresh } from '@/service/auth/useTokenRefresh';
import { SocketProvider } from '@/context/SocketContext';

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  useTokenRefresh();

  useEffect(() => {
    const token = Cookies.get('access');
    if (token) {
      setBearerToken(token);
      dispatch(loadAuthFromCookies());
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <AuthLoader>{children}</AuthLoader>
        </SocketProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
