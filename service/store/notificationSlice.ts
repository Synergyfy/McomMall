import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationData } from '../notifications/types';

interface NotificationState {
  notifications: NotificationData | null;
}

const initialState: NotificationState = {
  notifications: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationData>) => {
      state.notifications = action.payload;
    },
    clearNotifications: state => {
      state.notifications = null;
    },
  },
});

export const { setNotifications, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
