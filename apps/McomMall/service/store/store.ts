import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import cartReducer from './cartSlice';
import notificationReducer from './notificationSlice';
import bookingReducer from './bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    cart: cartReducer,
    notifications: notificationReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Pre-typed hooks — use these instead of plain useSelector/useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
