'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadAuthFromCookies,
  setAuthTokens,
  logout as logoutAction,
} from '@/service/store/authSlice';
import { setBearerToken, SESSION_EVENTS, type RefreshResult } from '@/service/api';
import { RootState, AppDispatch } from '@/service/store/store';
import { useGetNotifications } from '@/service/notifications/hook';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch: AppDispatch = useDispatch();
  const { accessToken, userRole } = useSelector((state: RootState) => state.auth);

  const { refetch } = useGetNotifications();

  useEffect(() => {
    dispatch(loadAuthFromCookies());
  }, [dispatch]);

  useEffect(() => {
    if (accessToken) {
      setBearerToken(accessToken);
      if (userRole === 'owner') {
        refetch();
      }
    }
  }, [accessToken, userRole, refetch]);

  // Keep Redux in sync with silent refreshes performed outside of the login
  // forms (scheduled refresh, visibility refresh, 401 retry).
  useEffect(() => {
    const handleRefreshed = (event: Event) => {
      const tokens = (event as CustomEvent<RefreshResult>).detail;
      if (!tokens?.accessToken || !tokens?.refreshToken) return;

      dispatch(
        setAuthTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        })
      );
      // Restores userId/userName/userRole/packageInfo from the long-lived
      // cookies so a recovered session is never blank.
      dispatch(loadAuthFromCookies());
    };

    const handleExpired = () => {
      dispatch(logoutAction());
    };

    window.addEventListener(SESSION_EVENTS.REFRESHED, handleRefreshed);
    window.addEventListener(SESSION_EVENTS.EXPIRED, handleExpired);

    return () => {
      window.removeEventListener(SESSION_EVENTS.REFRESHED, handleRefreshed);
      window.removeEventListener(SESSION_EVENTS.EXPIRED, handleExpired);
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
