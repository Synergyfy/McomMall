import axios from 'axios';
import Cookies from 'js-cookie';
import { MOCK_BYPASS, handleMockRequest, initMockAuth } from '@/lib/mock-data/mock-api-provider';

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcom-mall-rest.vercel.app/api/v1/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (MOCK_BYPASS && typeof window !== 'undefined') {
  initMockAuth();

  api.defaults.adapter = (config: any) => {
    const method = (config.method || 'get').toUpperCase();
    let url = config.url || '';

    if (url.startsWith('http')) {
      try {
        const parsed = new URL(url);
        url = parsed.pathname;
        const apiIdx = url.indexOf('/api/v1/');
        if (apiIdx !== -1) {
          url = url.substring(apiIdx + '/api/v1/'.length);
        }
      } catch {
        url = url.replace(/^https?:\/\/[^\/]+\/api\/v1\//, '');
      }
    }

    url = url.replace(/^\/+/, '').replace(/\/+$/, '');

    let requestData = config.data;
    if (typeof requestData === 'string') {
      try { requestData = JSON.parse(requestData); } catch {}
    }

    const result = handleMockRequest(method, url, requestData);

    return Promise.resolve({
      data: result.data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    });
  } as any;
}

// This function sets the bearer token for all subsequent API requests.
export const setBearerToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

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

// Global response interceptor to handle trial expiration and 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (MOCK_BYPASS) return Promise.reject(error);

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
      if (!isExempt) {
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
