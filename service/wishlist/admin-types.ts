import { WishlistItem } from './types';

export interface AdminWishlistItem extends WishlistItem {
  user: {
    id: string;
    name: string;
    email: string;
  };
}
