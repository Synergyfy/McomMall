import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart } from '@/hooks/useCart';

interface CartState {
  cart: Cart | null;
  loading: boolean;
}

const initialState: CartState = {
  cart: null,
  loading: true,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart | null>) => {
      state.cart = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCart, setLoading } = cartSlice.actions;
export default cartSlice.reducer;
