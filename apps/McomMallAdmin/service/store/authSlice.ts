import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clearAuthCookies,
  getAccessToken,
  getPackageInfo,
  getUserId,
  getUserRole,
  setAuthTokens as persistAuthTokens,
  setUserMeta,
} from '@/lib/auth-cookies';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  packageInfo: {
    planType: string;
  } | null;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  userName: null,
  userRole: null,
  packageInfo: null,
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
      persistAuthTokens(
        action.payload.accessToken,
        action.payload.refreshToken
      );
    },
    setUserData: (
      state,
      action: PayloadAction<{
        id: string;
        userName: string;
        userRole: string;
        packageInfo: {
          planType: string;
        } | null;
      }>
    ) => {
      state.userId = action.payload.id;
      state.userName = action.payload.userName;
      state.userRole = action.payload.userRole;
      state.packageInfo = action.payload.packageInfo;
      setUserMeta({
        userId: action.payload.id,
        userRole: action.payload.userRole,
        packageInfo: action.payload.packageInfo,
      });
      localStorage.setItem('user-name', action.payload.userName);
    },
    logout: state => {
      state.accessToken = null;
      state.userId = null;
      state.userName = null;
      state.userRole = null;
      state.packageInfo = null;
      clearAuthCookies();
      localStorage.removeItem('user-name');
    },
    loadAuthFromCookies: state => {
      const accessToken = getAccessToken();
      const userId = getUserId();
      const userRole = getUserRole();
      const userName = localStorage.getItem('user-name');
      const packageInfo = getPackageInfo();

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
      if (packageInfo) {
        try {
          state.packageInfo = JSON.parse(packageInfo);
        } catch (e) {
          console.error('Error parsing packageInfo:', e);
          state.packageInfo = null;
        }
      }
    },
  },
});

export const { setAuthTokens, setUserData, logout, loadAuthFromCookies } =
  authSlice.actions;
export default authSlice.reducer;
