'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getAccessToken, getRefreshToken } from '@/lib/auth-cookies';
import {
  getTokenExpiry,
  isTokenExpired,
  refreshSession,
  SESSION_EVENTS,
} from '../api';

// Refresh a minute before the JWT actually expires.
const EXPIRY_SKEW_MS = 60 * 1000;
// Never wait longer than this between checks (e.g. opaque tokens).
const MAX_SCHEDULE_MS = 20 * 60 * 1000;
// Minimum delay before retrying after a transient (network/5xx) failure.
const RETRY_MIN_MS = 15 * 1000;

/**
 * Keeps the mall session alive.
 *
 * - Schedules refreshes from the access token's real `exp`, not a blind
 *   20-minute interval started at page load.
 * - Pauses while the tab is hidden and refreshes immediately when it becomes
 *   visible again if the token expired while the tab was suspended.
 * - Retries transient failures instead of logging the user out. The session is
 *   only cleared when `/auth/refresh` explicitly rejects the refresh token
 *   (handled inside `refreshSession`).
 */
export const useTokenRefresh = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (delayOverride?: number) => {
      clearTimer();

      if (delayOverride !== undefined) {
        timerRef.current = setTimeout(runRefresh, delayOverride);
        return;
      }

      const expiry = getTokenExpiry(getAccessToken());
      const delay =
        expiry === null
          ? MAX_SCHEDULE_MS
          : Math.max(
              RETRY_MIN_MS,
              Math.min(MAX_SCHEDULE_MS, expiry - Date.now() - EXPIRY_SKEW_MS)
            );

      timerRef.current = setTimeout(runRefresh, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearTimer]
  );

  const runRefresh = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      // Don't fire network refreshes in a hidden tab: browsers freeze/suspend
      // it and the request can abort, which used to wipe the session.
      if (typeof document !== 'undefined' && document.hidden) return;

      const tokens = await refreshSession();

      if (tokens) {
        scheduleNext();
        return;
      }

      // refreshSession clears the cookie only when the refresh token is
      // explicitly rejected. If it still exists, this was a transient failure.
      if (getRefreshToken()) {
        scheduleNext(RETRY_MIN_MS);
      }
    } finally {
      runningRef.current = false;
    }
  }, [scheduleNext]);

  useEffect(() => {
    const refreshIfNeeded = () => {
      if (typeof document !== 'undefined' && document.hidden) return;

      const token = getAccessToken();
      const hasRefreshToken = !!getRefreshToken();

      if (!hasRefreshToken) {
        clearTimer();
        return;
      }

      if (!token || isTokenExpired(token, EXPIRY_SKEW_MS)) {
        void runRefresh();
      } else {
        scheduleNext();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshIfNeeded();
    };
    const handleOnline = () => refreshIfNeeded();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', refreshIfNeeded);
    window.addEventListener('online', handleOnline);
    window.addEventListener(SESSION_EVENTS.EXPIRED, clearTimer);

    refreshIfNeeded();

    return () => {
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refreshIfNeeded);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener(SESSION_EVENTS.EXPIRED, clearTimer);
    };
  }, [clearTimer, runRefresh, scheduleNext]);
};
