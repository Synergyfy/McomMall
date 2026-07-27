'use client';

import React, { useEffect, Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/service/store/store';
import { setAuthTokens, setUserData } from '@/service/store/authSlice';
import { setBearerToken } from '@/service/api';
import { useSsoLogin } from '@/service/auth/hook';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { redirectToMcomSolutionsSubscription } from '@/service/auth/hook';

function SSOReceiverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const { mutateAsync: ssoLogin, isError, error } = useSsoLogin();
  const calledRef = useRef(false);
  const [subscriptionError, setSubscriptionError] = useState(false);

  useEffect(() => {
    if (calledRef.current) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const ssoToken = searchParams.get('sso_token');
    const accessToken = searchParams.get('accessToken');
    const errorParam = searchParams.get('error');

    // Handle subscription_required error from backend redirect
    if (errorParam === 'subscription_required') {
      calledRef.current = true;
      setSubscriptionError(true);
      return;
    }

    if (code && state) {
      calledRef.current = true;
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1/';
      const callbackUrl = `${apiBase.replace(/\/$/, '')}/sso/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      window.location.href = callbackUrl;
    } else if (accessToken) {
      calledRef.current = true;
      const refreshToken = searchParams.get('refreshToken') || '';
      const userId = searchParams.get('userId') || '';
      const name = searchParams.get('name') || searchParams.get('userName') || 'User';
      const role = searchParams.get('role') || searchParams.get('userRole') || 'customer';

      dispatch(setAuthTokens({ accessToken, refreshToken }));
      dispatch(
        setUserData({
          id: userId,
          userName: name,
          userRole: role,
          packageInfo: null,
        }),
      );
      setBearerToken(accessToken);

      const redirectTo = state && state.startsWith('/') ? state : '/dashboard';
      router.replace(redirectTo);
    } else if (ssoToken && !calledRef.current) {
      calledRef.current = true;
      ssoLogin(ssoToken)
        .then(() => {
          const redirectTo = state && state.startsWith('/') ? state : '/dashboard';
          router.replace(redirectTo);
        })
        .catch((err) => {
          console.error('SSO authentication failed:', err);
          router.replace('/signin?error=sso_authentication_failed');
        });
    } else if (!code && !ssoToken && !accessToken) {
      router.replace('/');
    }
  }, [searchParams, ssoLogin, router, dispatch]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans selection:bg-orange-500">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[110px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center space-y-6 max-w-sm px-6">
        {subscriptionError ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto shadow-xl">
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Subscription Required</h2>
              <p className="text-sm text-slate-400">You need an active MCOM Mall subscription to access the dashboard.</p>
            </div>
            <button
              onClick={() => redirectToMcomSolutionsSubscription()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-semibold transition-all"
            >
              Subscribe to MCOM Mall
            </button>
          </>
        ) : isError ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto shadow-xl">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Sync Failed</h2>
              <p className="text-sm text-slate-400">{(error as Error)?.message || 'We could not authenticate your session.'}</p>
            </div>
            <button
              onClick={() => router.replace('/')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-semibold transition-all animate-bounce"
            >
              Return Home
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Ecosystem Syncing</h2>
              <p className="text-sm text-slate-400">Authenticating your secure session across the MCOM &amp; 247GBS network...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SSOReceiverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <SSOReceiverContent />
    </Suspense>
  );
}
