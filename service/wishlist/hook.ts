import useSWR from 'swr';
import api from '../api';
import { Wishlist, AddToWishlistDto } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useWishlist = () => {
  const { userRole } = useSelector((state: RootState) => state.auth);

  // Only fetch wishlist if the user is not an agent
  const shouldFetch = userRole !== 'agent';
  const { data, error, mutate } = useSWR<Wishlist>(
    shouldFetch ? '/wishlist' : null,
    fetcher
  );

  const addItem = async (item: AddToWishlistDto) => {
    try {
      const { data: updatedWishlist } = await api.post<Wishlist>('/wishlist', item);
      mutate(updatedWishlist, false);
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const { data: updatedWishlist } = await api.delete<Wishlist>(`/wishlist/${productId}`);
      mutate(updatedWishlist, false);
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
    }
  };

  return {
    wishlist: data,
    isLoading: !error && !data,
    isError: error,
    addItem,
    removeItem,
  };
};
