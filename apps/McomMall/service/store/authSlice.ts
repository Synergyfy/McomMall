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

      Cookies.set('userId', action.payload.id, { expires: 7 });
      Cookies.set('userRole', action.payload.userRole, { expires: 7 });
      Cookies.set('is_trial', action.payload.isTrial ? 'true' : 'false', { expires: 7 });
      if (action.payload.planId) {
        Cookies.set('mcom_plan', action.payload.planId, { expires: 7 });
      }
      localStorage.setItem('user-name', action.payload.userName);
      if (action.payload.packageInfo) {
        Cookies.set('packageInfo', JSON.stringify(action.payload.packageInfo), { expires: 7 });
      }
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
      Cookies.remove('access');
      Cookies.remove('refresh');
      Cookies.remove('userId');
      Cookies.remove('userRole');
      Cookies.remove('packageInfo');
      Cookies.remove('is_trial');
      Cookies.remove('mcom_plan');
      localStorage.removeItem('user-name');
      localStorage.removeItem('mcom_tasks');
      localStorage.removeItem('mcom_entitlement');
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
