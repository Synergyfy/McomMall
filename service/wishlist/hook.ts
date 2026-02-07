import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Wishlist, AddToWishlistDto } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const FETCH_WISHLIST_KEY = 'FETCH_WISHLIST';

// --- API Functions ---

const fetchWishlist = async (): Promise<Wishlist> => {
  try {
    const { data } = await api.get<Wishlist>('/wishlist');
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch wishlist');
  }
};

const addToWishlistFn = async (item: AddToWishlistDto): Promise<Wishlist> => {
  try {
    const { data } = await api.post<Wishlist>('/wishlist', item);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to add to wishlist');
  }
};

const removeFromWishlistFn = async (productId: string): Promise<Wishlist> => {
  try {
    const { data } = await api.delete<Wishlist>(`/wishlist/${productId}`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to remove from wishlist');
  }
};

// --- Hooks ---

export const useGetWishlist = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: [FETCH_WISHLIST_KEY],
    queryFn: fetchWishlist,
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToWishlistFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FETCH_WISHLIST_KEY] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromWishlistFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FETCH_WISHLIST_KEY] });
    },
  });
};

// Keep old useWishlist for compatibility if needed, but updated to use the new hooks
export const useWishlist = () => {
  const { data, isLoading, error, isFetching, status } = useGetWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  return {
    wishlist: data,
    isLoading: isLoading,
    isFetching,
    status,
    isError: !!error,
    addItem: addToWishlist.mutateAsync,
    removeItem: removeFromWishlist.mutateAsync,
    isAdding: addToWishlist.isPending,
    isRemoving: removeFromWishlist.isPending,
  };
};
