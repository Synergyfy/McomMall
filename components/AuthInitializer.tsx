'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAuthFromCookies } from '@/service/store/authSlice';
import { setBearerToken } from '@/service/api';
import { RootState, AppDispatch } from '@/service/store/store';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch: AppDispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadAuthFromCookies());
  }, [dispatch]);

  useEffect(() => {
    if (accessToken) {
      setBearerToken(accessToken);
    }
  }, [accessToken]);

  return <>{children}</>;
};

export default AuthInitializer;
