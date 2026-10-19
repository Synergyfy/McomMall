import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clearAuthCookies,
  getAccessToken,
  getIsTrial,
  getPackageInfo,
  getPlanId,
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
  isTrial: boolean;
  planId: string | null;
  planName: string | null;
  tasks: any[];
  entitlement: any | null;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  userName: null,
  userRole: null,
  packageInfo: null,
  isTrial: false,
  planId: null,
  planName: null,
  tasks: [],
  entitlement: null,
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
      // The JWT `exp` claim governs validity (see service/api.ts). The helper
      // keeps the cookie longer than the token so it doesn't vanish mid-session.
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
        isTrial?: boolean;
        planId?: string | null;
        planName?: string | null;
        tasks?: any[];
        entitlement?: any | null;
      }>
    ) => {
      state.userId = action.payload.id;
      state.userName = action.payload.userName;
      state.userRole = action.payload.userRole;
      state.packageInfo = action.payload.packageInfo;
      state.isTrial = Boolean(action.payload.isTrial);
      state.planId = action.payload.planId || null;
      state.planName = action.payload.planName || null;
      state.tasks = action.payload.tasks || [];
      state.entitlement = action.payload.entitlement || null;

      setUserMeta({
        userId: action.payload.id,
        userRole: action.payload.userRole,
        isTrial: Boolean(action.payload.isTrial),
        planId: action.payload.planId,
        packageInfo: action.payload.packageInfo,
      });
      localStorage.setItem('user-name', action.payload.userName);
      if (action.payload.tasks) {
        localStorage.setItem('mcom_tasks', JSON.stringify(action.payload.tasks));
      }
      if (action.payload.entitlement) {
        localStorage.setItem('mcom_entitlement', JSON.stringify(action.payload.entitlement));
      }
    },
    logout: state => {
      state.accessToken = null;
      state.userId = null;
      state.userName = null;
      state.userRole = null;
      state.packageInfo = null;
      state.isTrial = false;
      state.planId = null;
      state.planName = null;
      state.tasks = [];
      state.entitlement = null;
      clearAuthCookies();
      localStorage.removeItem('user-name');
      localStorage.removeItem('mcom_tasks');
      localStorage.removeItem('mcom_entitlement');
    },
    loadAuthFromCookies: state => {
      const accessToken = getAccessToken();
      const userId = getUserId();
      const userRole = getUserRole();
      const userName = localStorage.getItem('user-name');
      const packageInfo = getPackageInfo();
      const isTrial = getIsTrial();
      const planId = getPlanId();
      const tasks = localStorage.getItem('mcom_tasks');
      const entitlement = localStorage.getItem('mcom_entitlement');

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
      if (isTrial !== undefined) {
        state.isTrial = isTrial === 'true';
      }
      if (planId) {
        state.planId = planId;
      }
      if (tasks) {
        try {
          state.tasks = JSON.parse(tasks);
        } catch {
          state.tasks = [];
        }
      }
      if (entitlement) {
        try {
          state.entitlement = JSON.parse(entitlement);
        } catch {
          state.entitlement = null;
        }
      }
    },
  },
});

export const { setAuthTokens, setUserData, logout, loadAuthFromCookies } =
  authSlice.actions;
export default authSlice.reducer;
