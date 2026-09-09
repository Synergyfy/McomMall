import { useWishlist as useWishlistService } from '@/service/wishlist/hook';

export const useWishlist = () => {
  const { wishlist, addItem, removeItem, isLoading, isFetching, status } = useWishlistService();

  return {
    wishlist,
    loading: isLoading,
    isFetching,
    status,
    addItemToWishlist: addItem,
    removeItemFromWishlist: removeItem,
    wishlistCount: wishlist?.items?.length || 0,
  };
};
