import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

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
      Cookies.set('access', action.payload.accessToken, { expires: 1 / 72 }); // 20 minutes

      Cookies.set('refresh', action.payload.refreshToken, { expires: 7 });

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
      Cookies.set('userId', action.payload.id, { expires: 7 });
      Cookies.set('userRole', action.payload.userRole, { expires: 7 });
      localStorage.setItem('user-name', action.payload.userName);
      if (action.payload.packageInfo) {
        Cookies.set('packageInfo', JSON.stringify(action.payload.packageInfo), { expires: 7 });
      }
    },
    logout: state => {
      state.accessToken = null;
      state.userId = null;
      state.userName = null;
      state.userRole = null;
      state.packageInfo = null;
      Cookies.remove('access');
      Cookies.remove('refresh');
      Cookies.remove('userId');
      Cookies.remove('userRole');
      Cookies.remove('packageInfo');
      localStorage.removeItem('user-name');
    },
    loadAuthFromCookies: state => {
      const accessToken = Cookies.get('access');
      const userId = Cookies.get('userId');
      const userRole = Cookies.get('userRole');
      const userName = localStorage.getItem('user-name') || (Cookies.get('userName') ? decodeURIComponent(Cookies.get('userName')!) : null);
      const packageInfo = Cookies.get('packageInfo');

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
        state.packageInfo = JSON.parse(packageInfo);
      }
    },
  },
});

export const { setAuthTokens, setUserData, logout, loadAuthFromCookies } =
  authSlice.actions;
export default authSlice.reducer;
