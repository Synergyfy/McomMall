import { useState, useEffect } from 'react';
import api from '@/service/api';
import { useAuth } from '@/service/auth/hook';

// DTOs
export interface AddItemToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  productId: string;
  quantity: number;
}

// Cart interfaces
export interface CartItem {
  id: string;
  product: any; // You might want to replace 'any' with a proper Product interface
  quantity: number;
  cart: any;
  created_at: Date;
  updated_at: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  user: any; // You might want to replace 'any' with a proper User interface
  created_at: Date;
  updated_at: Date;
}

const CART_STORAGE_KEY = 'mcom_cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get<Cart>('/cart');
        setCart(data);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        // Attempt to load from local storage if API fails
        const localCart = localStorage.getItem(CART_STORAGE_KEY);
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [token]);

  const addItemToCart = async (item: AddItemToCartDto) => {
    try {
      const { data } = await api.post<Cart>('/cart/add', item);
      setCart(data);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const updateCartItem = async (item: UpdateCartItemDto) => {
    try {
      const { data } = await api.patch<Cart>('/cart/update', item);
      setCart(data);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const removeCartItem = async (productId: string) => {
    try {
      const { data } = await api.delete<Cart>(`/cart/remove/${productId}`);
      setCart(data);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return {
    cart,
    loading,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    cartItemCount: cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
  };
};
