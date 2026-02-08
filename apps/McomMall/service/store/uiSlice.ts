import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoginModalOpen: boolean;
}

const initialState: UIState = {
  isLoginModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalOpen = action.payload;
    },
  },
});

export const { setLoginModalOpen } = uiSlice.actions;
export default uiSlice.reducer;
