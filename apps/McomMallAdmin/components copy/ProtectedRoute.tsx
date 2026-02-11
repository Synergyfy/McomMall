'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const refreshToken = Cookies.get('refresh');

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
