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