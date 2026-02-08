import { useWishlist as useWishlistService } from '@/service/wishlist/hook';

export const useWishlist = () => {
  const { wishlist, addItem, removeItem, isLoading, isFetching, status } = useWishlistService();

  console.log('useWishlist Hook Debug:', { wishlist, isLoading, isFetching, status });

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
