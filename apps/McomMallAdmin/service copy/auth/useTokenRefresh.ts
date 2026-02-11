'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import api, { setBearerToken } from '../api';
import { AppDispatch } from '../store/store';
import { setAuthTokens, logout } from '../store/authSlice';
import { RefreshTokenResponse } from './types';

const REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds

export const useTokenRefresh = () => {
  const dispatch: AppDispatch = useDispatch();
  const isRefreshing = useRef(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = async () => {
    if (isRefreshing.current) {
      return;
    }

    const refreshToken = Cookies.get('refresh');
    if (!refreshToken) {
      return;
    }

    isRefreshing.current = true;

    try {
      const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      setBearerToken(accessToken);
      dispatch(setAuthTokens({ accessToken, refreshToken }));
      Cookies.set('refresh', newRefreshToken, { expires: 7 }); // Assuming refresh token is valid for 7 days

      // Reset the timer
      if (intervalId.current) {
        clearTimeout(intervalId.current as unknown as number);
      }
      intervalId.current = setTimeout(
        refreshToken,
        REFRESH_INTERVAL
      ) as unknown as NodeJS.Timeout;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      dispatch(logout());
    } finally {
      isRefreshing.current = false;
    }
  };

  useEffect(() => {
    const accessToken = Cookies.get('access');
    const refreshTokenExists = !!Cookies.get('refresh');

    if (!accessToken && refreshTokenExists) {
      refreshToken();
    }

    intervalId.current = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
};
