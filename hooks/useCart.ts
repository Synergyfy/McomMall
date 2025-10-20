import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '@/service/api';
import { useAuth } from '@/service/auth/hook';
import { RootState, AppDispatch } from '@/service/store/store';
import { setCart, setLoading } from '@/service/store/cartSlice';
import { v4 as uuidv4 } from 'uuid';

// DTOs
export interface AddItemToCartDto {
  productId: string;
  quantity: number;
  variants?: Record<string, string>;
  product?: any;
}

export interface UpdateCartItemDto {
  productId: string;
  quantity: number;
}

// Cart interfaces
export interface CartItem {
  id: string;
  product: any;
  quantity: number;
  cart?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  user?: any;
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
      const localCart = localStorage.getItem(CART_STORAGE_KEY);
      if (localCart) {
        dispatch(setCart(JSON.parse(localCart)));
      }
      dispatch(setLoading(false));
    }
  }, [token, dispatch]);

  const addItemToCart = async (item: AddItemToCartDto) => {
    if (!token) {
      const localCartString = localStorage.getItem(CART_STORAGE_KEY);
      let localCart: Cart = localCartString
        ? JSON.parse(localCartString)
        : {
            id: uuidv4(),
            items: [],
            total: 0,
            created_at: new Date(),
            updated_at: new Date(),
          };

      const existingItem = localCart.items.find(
        i => i.product.id === item.productId
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        localCart.items.push({
          id: uuidv4(),
          product: item.product,
          quantity: item.quantity,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      localCart.total = localCart.items.reduce(
        (acc, item) => acc + (item.product.price || item.product.fixedPrice) * item.quantity,
        0
      );
      localCart.updated_at = new Date();

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
      dispatch(setCart(localCart));
      return;
    }

    try {
      const { data } = await api.post<Cart>('/cart/add', {
        productId: item.productId,
        quantity: item.quantity,
        variants: item.variants,
      });
      dispatch(setCart(data));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const updateCartItem = async (item: UpdateCartItemDto) => {
    if (!token) {
        const localCartString = localStorage.getItem(CART_STORAGE_KEY);
        if (!localCartString) return;
        let localCart: Cart = JSON.parse(localCartString);
        const itemToUpdate = localCart.items.find(i => i.product.id === item.productId);

        if (itemToUpdate) {
            itemToUpdate.quantity = item.quantity;
            localCart.total = localCart.items.reduce((acc, item) => acc + (item.product.price || item.product.fixedPrice) * item.quantity, 0);
            localCart.updated_at = new Date();
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
            dispatch(setCart(localCart));
        }
        return;
    }
    try {
      const { data } = await api.patch<Cart>('/cart/update', item);
      dispatch(setCart(data));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const removeCartItem = async (productId: string) => {
    if (!token) {
        const localCartString = localStorage.getItem(CART_STORAGE_KEY);
        if (!localCartString) return;
        let localCart: Cart = JSON.parse(localCartString);
        localCart.items = localCart.items.filter(i => i.product.id !== productId);
        localCart.total = localCart.items.reduce((acc, item) => acc + (item.product.price || item.product.fixedPrice) * item.quantity, 0);
        localCart.updated_at = new Date();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
        dispatch(setCart(localCart));
        return;
    }
    try {
      const { data } = await api.delete<Cart>(`/cart/remove/${productId}`);
      dispatch(setCart(data));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const clearCart = async () => {
    if (!token) {
        localStorage.removeItem(CART_STORAGE_KEY);
        dispatch(setCart(null));
        return;
    }
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
