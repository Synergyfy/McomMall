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

// Initialize the token from cookies when the application loads
const initialToken = Cookies.get('access');
if (initialToken) {
  setBearerToken(initialToken);
}

// Global response interceptor to handle trial expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const message = error.response.data?.message || "";
      if (message.toLowerCase().includes("trial period has expired")) {
        // Redirect to Pricing/Tiers page
        if (typeof window !== "undefined") {
          window.location.href = "/pricing";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;