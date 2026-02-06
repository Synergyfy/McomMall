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
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { MarketplaceProvider } from '@/context/MarketplaceContext';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

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

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MarketplaceProvider>
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
            }}
          >
            <Elements stripe={stripePromise}>
              <AuthLoader>{children}</AuthLoader>
            </Elements>
          </PayPalScriptProvider>
        </MarketplaceProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
