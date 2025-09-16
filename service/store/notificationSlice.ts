import { createSlice } from '@reduxjs/toolkit';

interface NotificationState {}

const initialState: NotificationState = {};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
});

export default notificationSlice.reducer;
