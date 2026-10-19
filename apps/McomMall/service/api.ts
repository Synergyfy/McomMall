import axios from 'axios';
import {
  clearAuthCookies as clearStoredAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '@/lib/auth-cookies';

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcom-mall-rest.vercel.app/api/v1/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This function sets the bearer token for all subsequent API requests.
export const setBearerToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// The access token is a JWT. Its cookie is only a transport mechanism — the
// token's own `exp` claim is the source of truth for whether it is still valid.
// `lib/auth-cookies` keeps the cookie alive long enough that it never
// disappears while the token (or refresh token) is still usable;
// `ensureFreshToken` decides validity.

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

/** Read the `exp` claim (ms since epoch) from a JWT without verifying it. */
export function getTokenExpiry(token?: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      '='
    );
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Whether a token is missing or will expire within `skewMs`.
 * Tokens we cannot decode are treated as valid so non-JWT/mock tokens are not
 * dropped, but they will still be replaced on the next 401.
 */
export function isTokenExpired(
  token: string | null | undefined,
  skewMs = 0
): boolean {
  if (!token) return true;
  const expiry = getTokenExpiry(token);
  if (expiry === null) return false;
  return expiry - skewMs <= Date.now();
}

function persistTokens({ accessToken, refreshToken }: RefreshResult) {
  setBearerToken(accessToken);
  setAuthTokens(accessToken, refreshToken);
}

function clearAuthCookies() {
  clearStoredAuthCookies();
}

const SESSION_REFRESHED_EVENT = 'mcom:session-refreshed';
const SESSION_EXPIRED_EVENT = 'mcom:session-expired';

function emitSessionRefreshed(tokens: RefreshResult) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(SESSION_REFRESHED_EVENT, { detail: tokens })
  );
}

function emitSessionExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export const SESSION_EVENTS = {
  REFRESHED: SESSION_REFRESHED_EVENT,
  EXPIRED: SESSION_EXPIRED_EVENT,
} as const;

function isRejectedRefresh(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  // Only the refresh endpoint explicitly rejecting the token means the session
  // is really over. Network errors / 5xx must not destroy a valid session.
  return status === 400 || status === 401 || status === 403;
}

let refreshPromise: Promise<RefreshResult | null> | null = null;

/**
 * Single-flight session refresh shared by the request/response interceptors,
 * the scheduled refresher and the visibility/online handlers.
 *
 * Resolves to the new tokens, or null when no refresh could be performed.
 * The stored session is only cleared when `/auth/refresh` explicitly rejects
 * the refresh token — never on network failures, timeouts or 5xx responses.
 */
export function refreshSession(): Promise<RefreshResult | null> {
  if (refreshPromise) return refreshPromise;

  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    return Promise.resolve(null);
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${baseURL}auth/refresh`,
        { refreshToken: refreshTokenValue },
        { timeout: 15_000 }
      );

      const { accessToken, refreshToken } = response.data;
      if (!accessToken || !refreshToken) return null;

      const tokens = { accessToken, refreshToken };
      persistTokens(tokens);
      emitSessionRefreshed(tokens);
      return tokens;
    } catch (error) {
      if (isRejectedRefresh(error)) {
        clearAuthCookies();
        emitSessionExpired();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const AUTH_ENDPOINT_PATTERN = /(^|\/)(auth|sso)(\/|$)/;

function isAuthEndpoint(url?: string): boolean {
  return !!url && AUTH_ENDPOINT_PATTERN.test(url);
}

/**
 * Returns a currently-valid access token, refreshing if the stored token is
 * missing or expired. A stale in-memory header is never trusted on its own.
 */
async function ensureFreshToken(): Promise<string | null> {
  const cookieToken = getAccessToken();
  const header = api.defaults.headers.common['Authorization'];
  const headerToken =
    typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : null;

  let token = cookieToken || headerToken || null;

  // Refresh proactively shortly before expiry, or when nothing usable exists.
  if (!token || isTokenExpired(token, 30_000)) {
    const refreshed = await refreshSession();
    token = refreshed?.accessToken || getAccessToken() || null;
  }

  if (token) setBearerToken(token);
  return token;
}

// Initialize the token from cookies when the application loads.
// Skip this during the SSO callback — the callback page manages its own auth lifecycle
// and a stale token here would leak into other requests (e.g. Header) causing spurious 401s.
if (typeof window !== 'undefined') {
  const isCallbackPath = window.location.pathname.startsWith('/auth/callback');
  if (!isCallbackPath) {
    const initialToken = getAccessToken();
    if (initialToken) {
      setBearerToken(initialToken);
    }
  }
}

// Request interceptor: make sure the request carries a valid token.
if (typeof window !== 'undefined') {
  api.interceptors.request.use(async (config) => {
    // Auth/SSO endpoints run their own flow and must not be refreshed/retried.
    if (isAuthEndpoint(config.url)) {
      return config;
    }

    const token = await ensureFreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

// Global response interceptor to handle trial expiration and 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 403) {
      const message = error.response.data?.message || '';
      if (message.toLowerCase().includes('trial period has expired')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/pricing';
        }
      }
    }

    if (status === 401) {
      const originalRequest = error.config;

      // Don't loop on auth endpoints or on an already-retried request.
      if (
        originalRequest &&
        !originalRequest._retry &&
        !isAuthEndpoint(originalRequest.url)
      ) {
        originalRequest._retry = true;
        const refreshed = await refreshSession();

        if (refreshed?.accessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return api(originalRequest);
        }
        // If the refresh token was explicitly rejected, refreshSession() has
        // already cleared the session and emitted SESSION_EXPIRED. Callers and
        // AuthRedirect handle the resulting signed-out UI. Transient failures
        // deliberately leave the session intact so it can recover on retry.
      }
    }

    return Promise.reject(error);
  }
);

export default api;
