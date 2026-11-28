import axios, { type InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens as persistAuthTokens,
} from '@/lib/auth-cookies';
import { RefreshTokenResponse } from './auth/types';
import { setAuthTokens as setAuthTokensInStore } from './store/authSlice';
import { store } from './store/store';

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcom-mall-rest.vercel.app/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the mall session without going through this client, otherwise a
 * failed refresh would recurse back into the 401 handler below.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<RefreshTokenResponse>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
    );

    const { accessToken, refreshToken: newRefreshToken } = data;
    if (!accessToken || !newRefreshToken) return null;

    persistAuthTokens(accessToken, newRefreshToken);
    store.dispatch(
      setAuthTokensInStore({ accessToken, refreshToken: newRefreshToken }),
    );
    return accessToken;
  } catch {
    return null;
  }
}

// Add a request interceptor to inject the token automatically
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// An expired access token should not leave pages showing a generic load error.
// Refresh once and replay the original request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const token = await refreshPromise;
    if (!token) return Promise.reject(error);

    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  },
);

// This function remains for manual overrides if needed
export const setBearerToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;
