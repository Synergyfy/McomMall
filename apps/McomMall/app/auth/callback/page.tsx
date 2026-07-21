'use client';

import React, { useEffect, Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setAuthTokens, setUserData, logout } from '@/service/store/authSlice';
import { setBearerToken } from '@/service/api';
import Cookies from 'js-cookie';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import api from '@/service/api';
import { AppDispatch } from '@/service/store/store';
import { redirectToMcomSolutionsSubscription } from '@/service/auth/hook';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('name');
    const userRole = searchParams.get('role');
    const errorParam = searchParams.get('error');

    // Handle subscription_required error from backend redirect
    if (errorParam === 'subscription_required') {
      calledRef.current = true;
      setError('subscription_required');
      return;
    }

    // Clear any stale auth state from a previous session.
    // During SSO callback we don't want a stale bearer token leaking into
    // other requests (Header, etc.) which would cause spurious 401 redirects
    // before the callback exchange completes.
    setBearerToken('');
    Cookies.remove('access');
    Cookies.remove('refresh');
    Cookies.remove('userId');
    Cookies.remove('userRole');
    Cookies.remove('packageInfo');
    dispatch(logout());

    // Legacy flow: MCOM Solutions backend redirected with tokens as URL params
    if (accessToken && refreshToken && userId) {
      calledRef.current = true;
      const tokens = { accessToken, refreshToken };
      dispatch(setAuthTokens(tokens));
      dispatch(
        setUserData({
          id: userId,
          userName: userName || 'User',
          userRole: userRole || 'customer',
          packageInfo: null,
        }),
      );
      setBearerToken(accessToken);
      const redirectTo =
        state && state.startsWith('/') ? state : '/dashboard';
      router.replace(redirectTo);
      return;
    }

    // New SSO flow: MCOM Solutions redirected with auth code
    if (code) {
      calledRef.current = true;

      // CSRF protection: verify state matches
      const savedState = sessionStorage.getItem('sso_state');
      if (savedState && state !== savedState) {
        setError('Invalid state parameter. Possible CSRF attack.');
        sessionStorage.removeItem('sso_state');
        return;
      }
      sessionStorage.removeItem('sso_state');

      const redirectUri = `${window.location.origin}/auth/callback`;

      api
        .post('sso/callback', { code, redirect_uri: redirectUri })
        .then((res) => {
          const data = res.data;
          if (data.error) throw new Error(data.error);

          const tokens = {
            accessToken: data.auth.accessToken,
            refreshToken: data.auth.refreshToken,
          };
          dispatch(setAuthTokens(tokens));
          dispatch(
            setUserData({
              id: data.userId,
              userName: data.name,
              userRole: String(data.role),
              packageInfo: data.packageInfo
                ? { planType: data.packageInfo.planType }
                : null,
            }),
          );
          setBearerToken(data.auth.accessToken);

          router.replace('/dashboard');
        })
        .catch((err: any) => {
          console.error('[SSO Callback] Failed:', {
            status: err?.response?.status,
            message: err?.response?.data?.message || err?.message,
            url: err?.config?.url,
            fullError: err,
          });
          if (err?.response?.status === 403 && err?.response?.data?.message === 'subscription_required') {
            setError('subscription_required');
            return;
          }
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'Failed to complete sign-in. Please try again.',
          );
        });
      return;
    }

    // No code or tokens — redirect to sign-in
    if (!code && !accessToken) {
      router.replace('/signin');
    }
  }, [searchParams, dispatch, router]);

  if (error) {
    const isSubscriptionRequired = error === 'subscription_required';

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[110px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-sm px-6">
          <div className={`w-16 h-16 rounded-2xl ${isSubscriptionRequired ? 'bg-orange-500/20' : 'bg-red-500/20'} flex items-center justify-center mx-auto shadow-xl`}>
            {isSubscriptionRequired ? (
              <Sparkles className="w-8 h-8 text-orange-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isSubscriptionRequired ? 'Subscription Required' : 'Sign-In Failed'}
            </h2>
            <p className="text-sm text-slate-400">
              {isSubscriptionRequired
                ? 'You need an active MCOM Mall subscription to access the dashboard.'
                : error}
            </p>
          </div>
          {isSubscriptionRequired ? (
            <button
              onClick={() => redirectToMcomSolutionsSubscription()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-semibold transition-all"
            >
              Subscribe to MCOM Mall
            </button>
          ) : (
            <button
              onClick={() => router.replace('/signin')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-semibold transition-all"
            >
              Return to Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[110px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center space-y-6 max-w-sm px-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Signing You In
          </h2>
          <p className="text-sm text-slate-400">
            Authenticating your secure session across the MCOM network...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
