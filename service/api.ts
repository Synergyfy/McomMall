import axios from 'axios';

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3009';

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

export default api;
