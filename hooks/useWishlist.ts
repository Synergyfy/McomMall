import { useWishlist as useWishlistService } from '@/service/wishlist/hook';

export const useWishlist = () => {
  const { wishlist, addItem, removeItem, isLoading } = useWishlistService();

  return {
    wishlist,
    loading: isLoading,
    addItemToWishlist: addItem,
    removeItemFromWishlist: removeItem,
    wishlistCount: wishlist?.items?.length || 0,
  };
};
