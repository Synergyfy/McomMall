'use client';

import React, { useEffect, Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setAuthTokens, setUserData, logout } from '@/service/store/authSlice';
import { setBearerToken } from '@/service/api';
import Cookies from 'js-cookie';
import {
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '@/service/api';
import { AppDispatch } from '@/service/store/store';
import { redirectToMcomSolutionsSubscription } from '@/service/auth/hook';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);
  const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);
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
    const reasonParam = searchParams.get('reason');
    const upgradeUrlParam = searchParams.get('upgradeUrl');
    const planIdParam = searchParams.get('planId');
    const isTrialParam = searchParams.get('isTrial');

    // Handle subscription_required error from backend redirect
    if (errorParam === 'subscription_required') {
      calledRef.current = true;
      setError('subscription_required');
      if (reasonParam) setDeniedReason(reasonParam);
      if (upgradeUrlParam) setUpgradeUrl(upgradeUrlParam);
      return;
    }

    // Clear stale auth state
    setBearerToken('');
    Cookies.remove('access');
    Cookies.remove('refresh');
    Cookies.remove('userId');
    Cookies.remove('userRole');
    Cookies.remove('packageInfo');
    Cookies.remove('is_trial');
    Cookies.remove('mcom_plan');
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
          packageInfo: planIdParam ? { planType: planIdParam } : null,
          isTrial: isTrialParam === 'true',
          planId: planIdParam || null,
        }),
      );
      setBearerToken(accessToken);
      const redirectTo =
        state && state.startsWith('/') ? state : '/dashboard';
      router.replace(redirectTo);
      return;
    }

    // Standard SSO flow: MCOM Solutions redirected with auth code
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
                : (data.planId ? { planType: data.planId } : null),
              isTrial: Boolean(data.isTrial),
              planId: data.planId || null,
              planName: data.planName || null,
              tasks: data.tasks || [],
              entitlement: data.entitlement || null,
            }),
          );
          setBearerToken(data.auth.accessToken);

          router.replace('/dashboard');
        })
        .catch((err: any) => {
          console.error('[SSO Callback] Failed:', {
            status: err?.response?.status,
            message: err?.response?.data?.message || err?.message,
            reason: err?.response?.data?.reason,
            upgradeUrl: err?.response?.data?.upgradeUrl,
            fullError: err,
          });

          if (
            err?.response?.status === 403 &&
            (err?.response?.data?.message === 'subscription_required' ||
              err?.response?.data?.reason)
          ) {
            setError('subscription_required');
            setDeniedReason(err?.response?.data?.reason || null);
            setUpgradeUrl(err?.response?.data?.upgradeUrl || null);
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

  const handleActionClick = () => {
    if (upgradeUrl) {
      window.location.href = upgradeUrl;
    } else {
      redirectToMcomSolutionsSubscription();
    }
  };

  if (error) {
    const isSubscriptionRequired = error === 'subscription_required';

    let title = 'Sign-In Failed';
    let description = error;
    let buttonLabel = 'Return to Sign In';
    let icon = <AlertCircle className="w-8 h-8 text-red-500" />;
    let iconBg = 'bg-red-500/20';

    if (isSubscriptionRequired) {
      switch (deniedReason) {
        case 'UNVERIFIED':
          title = 'Verification Fee Required';
          description =
            'You are required to pay a £1 verification fee on MCOM Central to activate your 14-day trial access to MCOM Mall.';
          buttonLabel = 'Pay £1 Verification Fee';
          icon = <ShieldAlert className="w-8 h-8 text-amber-500" />;
          iconBg = 'bg-amber-500/20';
          break;
        case 'PLATFORM_NOT_IN_MEMBERSHIP':
          title = 'Membership Upgrade Required';
          description =
            'Your current MCOM Membership tier does not bundle MCOM Mall. Upgrade your membership tier on MCOM Central to unlock access.';
          buttonLabel = 'Upgrade MCOM Membership';
          icon = <Sparkles className="w-8 h-8 text-orange-500" />;
          iconBg = 'bg-orange-500/20';
          break;
        case 'TRIAL_NO_TASKS':
          title = 'No Active Programme Tasks';
          description =
            'Your trial access requires active onboarding tasks for MCOM Mall. No tasks are currently assigned to your account in the Programme Task Engine.';
          buttonLabel = 'Check Programme on Central';
          icon = <Clock className="w-8 h-8 text-blue-500" />;
          iconBg = 'bg-blue-500/20';
          break;
        case 'TRIAL_EXPIRED':
          title = 'Trial Period Expired';
          description =
            'Your 14-day trial period has ended. Subscribe to an active MCOM Membership or standalone plan to continue accessing MCOM Mall.';
          buttonLabel = 'Subscribe to Continue';
          icon = <Clock className="w-8 h-8 text-rose-500" />;
          iconBg = 'bg-rose-500/20';
          break;
        case 'MEMBERSHIP_EXPIRED':
          title = 'Membership Expired';
          description =
            'Your MCOM Membership has expired. Renew your plan on MCOM Central to restore access to your storefront and listings.';
          buttonLabel = 'Renew Membership';
          icon = <AlertCircle className="w-8 h-8 text-red-500" />;
          iconBg = 'bg-red-500/20';
          break;
        default:
          title = 'Subscription Required';
          description =
            'You need an active MCOM Mall subscription or an MCOM Membership bundling MCOM Mall to access the merchant dashboard.';
          buttonLabel = 'Manage Membership on Central';
          icon = <Sparkles className="w-8 h-8 text-orange-500" />;
          iconBg = 'bg-orange-500/20';
          break;
      }
    }

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-4">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[110px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-md w-full px-6 py-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div
            className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mx-auto shadow-xl ring-1 ring-white/10`}
          >
            {icon}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          {isSubscriptionRequired && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 text-left flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                MCOM Central manages identity, verification fees, and multi-app
                memberships across all ecosystem services.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            {isSubscriptionRequired ? (
              <button
                onClick={handleActionClick}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01]"
              >
                <span>{buttonLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : null}

            <button
              onClick={() => router.replace('/signin')}
              className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
            >
              Return to Sign In
            </button>
          </div>
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
            Resolving your MCOM entitlement and verifying access permissions...
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
