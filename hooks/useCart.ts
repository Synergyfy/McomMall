import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '@/service/api';
import { useAuth } from '@/service/auth/hook';
import { RootState, AppDispatch } from '@/service/store/store';
import { setCart, setLoading } from '@/service/store/cartSlice';

// DTOs
export interface AddItemToCartDto {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
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
  selectedVariants?: Record<string, string>;
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
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading } = useSelector((state: RootState) => state.cart);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      dispatch(setLoading(true));
      try {
        const { data } = await api.get<Cart>('/cart');
        dispatch(setCart(data));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        // Attempt to load from local storage if API fails
        const localCart = localStorage.getItem(CART_STORAGE_KEY);
        if (localCart) {
          dispatch(setCart(JSON.parse(localCart)));
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (token) {
      fetchCart();
    } else {
      dispatch(setLoading(false));
    }
  }, [token, dispatch]);

  const addItemToCart = async (item: AddItemToCartDto) => {
    try {
      const { data } = await api.post<Cart>('/cart/add', {
        productId: item.productId,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants,
      });
      dispatch(setCart(data));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const updateCartItem = async (item: UpdateCartItemDto) => {
    try {
      const { data } = await api.patch<Cart>('/cart/update', item);
      dispatch(setCart(data));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const removeCartItem = async (productId: string) => {
    try {
      const { data } = await api.delete<Cart>(`/cart/remove/${productId}`);
      dispatch(setCart(data));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      dispatch(setCart(null));
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
