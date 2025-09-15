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
    clearBookingNotifications: state => {
      if (state.notifications) {
        state.notifications.total -= state.notifications.newBookings.count;
        state.notifications.newBookings = { count: 0, ids: [] };
      }
    },
    clearOrderNotifications: state => {
      if (state.notifications) {
        state.notifications.total -= state.notifications.newOrders.count;
        state.notifications.newOrders = { count: 0, ids: [] };
      }
    },
    clearMessageNotifications: (state, action: PayloadAction<string>) => {
      const senderId = action.payload;
      if (
        state.notifications &&
        state.notifications.newMessages.senders[senderId]
      ) {
        const count = state.notifications.newMessages.senders[senderId].count;
        state.notifications.total -= count;
        state.notifications.newMessages.total -= count;
        delete state.notifications.newMessages.senders[senderId];
      }
    },
  },
});

export const {
  setNotifications,
  clearNotifications,
  clearBookingNotifications,
  clearOrderNotifications,
  clearMessageNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
