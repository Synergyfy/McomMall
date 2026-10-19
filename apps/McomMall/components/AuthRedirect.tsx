'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/service/store/store';
import { loadAuthFromCookies } from '@/service/store/authSlice';
import { setLoginModalOpen } from '@/service/store/uiSlice';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAccessToken, getRefreshToken } from '@/lib/auth-cookies';
import { SESSION_EVENTS } from '@/service/api';

/**
 * Fallback routing for the dashboard when there is no recoverable session.
 * Token refreshing is owned by `useTokenRefresh` (mounted globally in
 * ClientProviders) so there is only one refresher and one source of truth.
 */
const AuthRedirect = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getAccessToken();
    const refresh = getRefreshToken();

    if (!token && !refresh && pathname.startsWith('/dashboard')) {
      router.push(`/?redirect=${pathname}`);
      dispatch(setLoginModalOpen(true));
    } else if (token && !accessToken) {
      dispatch(loadAuthFromCookies());
    }
  }, [accessToken, dispatch, pathname, router]);

  // The refresh token was explicitly rejected — route to sign-in immediately
  // instead of leaving the dashboard stuck on its loading state.
  useEffect(() => {
    const handleExpired = () => {
      if (pathname.startsWith('/dashboard')) {
        router.push(`/?redirect=${pathname}`);
        dispatch(setLoginModalOpen(true));
      }
    };

    window.addEventListener(SESSION_EVENTS.EXPIRED, handleExpired);
    return () =>
      window.removeEventListener(SESSION_EVENTS.EXPIRED, handleExpired);
  }, [dispatch, pathname, router]);

  return null;
};

export default AuthRedirect;
