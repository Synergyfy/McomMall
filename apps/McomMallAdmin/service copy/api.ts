import axios from 'axios';
import Cookies from 'js-cookie';

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3009';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token automatically
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This function remains for manual overrides if needed
export const setBearerToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;
