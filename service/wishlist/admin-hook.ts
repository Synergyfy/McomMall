import useSWR from 'swr';
import api from '../api';
import { AdminWishlistItem } from './admin-types';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useAdminWishlist = () => {
  const { data, error } = useSWR<AdminWishlistItem[]>('/wishlist/all', fetcher);

  return {
    wishlistItems: data,
    isLoading: !error && !data,
    isError: error,
  };
};
