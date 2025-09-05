export interface WishlistItem {
  id: string;
  product: any; // Replace with a proper Product interface
  created_at: Date;
  updated_at: Date;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
  user: any; // Replace with a proper User interface
  created_at: Date;
  updated_at: Date;
}

export interface AddToWishlistDto {
  productId: string;
}
