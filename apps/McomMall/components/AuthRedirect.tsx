'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/service/store/store';
import { loadAuthFromCookies } from '@/service/store/authSlice';
import { setLoginModalOpen } from '@/service/store/uiSlice';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useRefreshToken } from '@/service/auth/hook';
import { MOCK_BYPASS } from '@/lib/mock-data/mock-api-provider';

const AuthRedirect = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: refreshTokenFn } = useRefreshToken();

  useEffect(() => {
    if (MOCK_BYPASS) return;

    const token = Cookies.get('access');
    const refresh = Cookies.get('refresh');

    if (!token && refresh) {
      refreshTokenFn(refresh);
    } else if (!token && !refresh && pathname.startsWith('/dashboard')) {
      router.push(`/?redirect=${pathname}`);
      dispatch(setLoginModalOpen(true));
    } else if (token && !accessToken) {
      dispatch(loadAuthFromCookies());
    }
  }, [accessToken, dispatch, pathname, refreshTokenFn, router]);

  useEffect(() => {
    if (MOCK_BYPASS) return;

    const interval = setInterval(() => {
      const refresh = Cookies.get('refresh');
      if (refresh) {
        refreshTokenFn(refresh);
      }
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearInterval(interval);
  }, [refreshTokenFn]);

  return null;
};

export default AuthRedirect;
