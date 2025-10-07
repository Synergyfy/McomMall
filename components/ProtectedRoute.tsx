'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    // ✅ Read cookies only in browser
    setRefreshToken(Cookies.get('refresh'));
  }, []);

  // 🧩 Prevent hydration mismatch by rendering nothing until client is ready
  if (!isMounted) return null;

  if (!accessToken && refreshToken) {
    return <div>Loading...</div>; // show a spinner if you like
  }

  if (!accessToken && !refreshToken) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
