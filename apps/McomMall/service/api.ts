import axios from 'axios';
import Cookies from 'js-cookie';

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcom-mall-rest.vercel.app/api/v1/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock bypass adapter removed: the storefront always talks to the NestJS
// backend. No NEXT_PUBLIC_MOCK_BYPASS short-circuit remains in production.

// This function sets the bearer token for all subsequent API requests.
export const setBearerToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Token refresh mutex — prevents multiple concurrent refresh attempts and
// queues requests that fire before the first refresh completes.
let refreshPromise: Promise<boolean> | null = null;

async function ensureToken(): Promise<boolean> {
  // Already have a token — nothing to do
  if (api.defaults.headers.common['Authorization']) {
    return true;
  }

  // Try reading from cookie again (may have been set by another tab)
  const cookieToken = Cookies.get('access');
  if (cookieToken) {
    setBearerToken(cookieToken);
    return true;
  }

  // No refresh token — can't recover
  const refreshTokenValue = Cookies.get('refresh');
  if (!refreshTokenValue) {
    return false;
  }

  // A refresh is already in flight — wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start a new refresh
  refreshPromise = (async () => {
    try {
      const response = await axios.post(`${baseURL}auth/refresh`, {
        refreshToken: refreshTokenValue,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      setBearerToken(accessToken);
      Cookies.set('access', accessToken, { expires: 1 / 72 });
      Cookies.set('refresh', newRefreshToken, { expires: 7 });
      return true;
    } catch {
      // Refresh failed — clear everything
      Cookies.remove('access');
      Cookies.remove('refresh');
      Cookies.remove('userId');
      Cookies.remove('userRole');
      Cookies.remove('packageInfo');
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Initialize the token from cookies when the application loads.
// Skip this during the SSO callback — the callback page manages its own auth lifecycle
// and a stale token here would leak into other requests (e.g. Header) causing spurious 401s.
if (typeof window !== 'undefined') {
  const isCallbackPath = window.location.pathname.startsWith('/auth/callback');
  if (!isCallbackPath) {
    const initialToken = Cookies.get('access');
    if (initialToken) {
      setBearerToken(initialToken);
    }
  }
}

// Paths that handle their own auth flow — never auto-redirect to /login from these
const AUTH_EXEMPT_PATHS = ['/', '/auth/callback', '/auth/sso', '/login', '/signin', '/getstarted'];

// Request interceptor: ensure a valid token exists before sending any request
if (typeof window !== 'undefined') {
  api.interceptors.request.use(async (config) => {
    // Skip token injection for auth endpoints (they handle their own flow)
    if (config.url?.includes('/auth/')) {
      return config;
    }

    const hasToken = !!api.defaults.headers.common['Authorization'];
    if (!hasToken) {
      await ensureToken();
    }

    // Sync token from cookie (may have been refreshed)
    const token = Cookies.get('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

// Global response interceptor to handle trial expiration and 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    if (error.response?.status === 403) {
      const message = error.response.data?.message || "";
      if (message.toLowerCase().includes("trial period has expired")) {
        if (typeof window !== "undefined") {
          window.location.href = "/pricing";
        }
      }
    }
    if (error.response?.status === 401) {
      const isExempt = AUTH_EXEMPT_PATHS.some((p) => pathname.startsWith(p));
      const originalRequest = error.config;

      if (!isExempt && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
        originalRequest._retry = true;
        return ensureToken().then((refreshed) => {
          if (refreshed) {
            const newToken = Cookies.get('access');
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          }
          // Refresh failed — clear auth and redirect to login
          Cookies.remove('access');
          Cookies.remove('refresh');
          Cookies.remove('userId');
          Cookies.remove('userRole');
          Cookies.remove('packageInfo');
          setBearerToken('');
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }
          return Promise.reject(error);
        });
      }

      if (!isExempt && !originalRequest?.url?.includes('/auth/')) {
        // Token is invalid or expired — clear auth and redirect to login
        Cookies.remove('access');
        Cookies.remove('refresh');
        Cookies.remove('userId');
        Cookies.remove('userRole');
        Cookies.remove('packageInfo');
        setBearerToken('');
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
