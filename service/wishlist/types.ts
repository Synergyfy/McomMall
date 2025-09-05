export interface WishlistItem {
  id: string;
  product: any; // Replace with a proper Product interface
  createdAt: Date;
  updatedAt: Date;
}

export interface Wishlist {
  id:string;
  items: WishlistItem[];
  user: any; // Replace with a proper User interface
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToWishlistDto {
  productId: string;
}
