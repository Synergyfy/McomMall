'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { MOCK_BYPASS } from '@/lib/mock-data/mock-api-provider';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const refreshToken = Cookies.get('refresh');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (MOCK_BYPASS) {
    return <>{children}</>;
  }

  if (!accessToken && refreshToken) {
    // If we have a refresh token but no access token, it means we're likely
    // in the process of refreshing the token. Show a loading state.
    // The AuthRedirect component will handle the actual refresh logic.
    return <div>Loading...</div>; // You can replace this with a proper spinner
  }

  if (!accessToken && !refreshToken) {
    // If there are no tokens at all, the middleware should have already
    // redirected. The AuthRedirect component also handles this as a fallback.
    // Returning null here prevents rendering the children while redirection happens.
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
