'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAuthFromCookies } from '@/service/store/authSlice';
import { setBearerToken } from '@/service/api';
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

  return <>{children}</>;
};

export default AuthInitializer;
