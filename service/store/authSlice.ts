import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  userName: null,
  userRole: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      Cookies.set('access', action.payload.accessToken, { expires: 1 / 72 }); // 20 minutes

      Cookies.set('refresh', action.payload.refreshToken, { expires: 7 });

    },
    setUserData: (
      state,
      action: PayloadAction<{
        id: string;
        userName: string;
        userRole: string;
      }>
    ) => {
      state.userId = action.payload.id;
      state.userName = action.payload.userName;
      state.userRole = action.payload.userRole;
      Cookies.set('userId', action.payload.id, { expires: 7 });
      localStorage.setItem('user-name', action.payload.userName);
      localStorage.setItem('user-type', action.payload.userRole);
    },
    logout: state => {
      state.accessToken = null;
      state.userId = null;
      state.userName = null;
      state.userRole = null;
      Cookies.remove('access');
      Cookies.remove('refresh');
      Cookies.remove('userId');
      localStorage.removeItem('user-name');
      localStorage.removeItem('user-type');
    },
    loadAuthFromCookies: state => {
      const accessToken = Cookies.get('access');
      const userId = Cookies.get('userId');
      const userName = localStorage.getItem('user-name');
      const userRole = localStorage.getItem('user-type');
      if (accessToken) {
        state.accessToken = accessToken;
      }
      if (userId) {
        state.userId = userId;
      }
      if (userName) {
        state.userName = userName;
      }
      if (userRole) {
        state.userRole = userRole;
      }
    },
  },
});

export const { setAuthTokens, setUserData, logout, loadAuthFromCookies } =
  authSlice.actions;
export default authSlice.reducer;
