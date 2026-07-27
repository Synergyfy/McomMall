import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import api, { setBearerToken } from '../api';
import { useSelector } from 'react-redux';
import {
  UserInterface,
  AuthInterface,
  LoginResponse,
  ClaimInterface,
  SendOtpInterface,
  ValidateOtpInterface,
  ResetPasswordInterface,
} from './types';
import { useDispatch } from 'react-redux';
import {
  setAuthTokens,
  setUserData,
  logout as logoutAction,
} from '../store/authSlice';
import { AppDispatch, RootState } from '../store/store';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useCheckEmail = () => {
  const checkEmail = async (email: string) => {
    try {
      const response = await api.get(`users/check-email?email=${email}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to check email'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: checkEmail,
  });
  return { ...mutation, mutateAsync: mutation.mutateAsync };
};

export const useCreateUser = () => {
  const create = async (payload: UserInterface) => {
    try {
      const response = await api.post('users/create', { ...payload });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to create user account'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: create,
  });
  return { ...mutation, mutateAsync: mutation.mutateAsync };
};

export const useSendOtp = () => {
  const sendOtp = async (payload: SendOtpInterface) => {
    try {
      const response = await api.post('email/send-otp', {
        ...payload,
      });
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to send OTP'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: sendOtp,
  });
  return mutation;
};

export const useValidateOtp = () => {
  const validateOtp = async (payload: ValidateOtpInterface) => {
    try {
      const response = await api.post('email/validate-otp', {
        ...payload,
      });
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to validate OTP');
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to validate OTP'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: validateOtp,
  });
  return mutation;
};

export const useResetPassword = () => {
  const resetPassword = async (payload: ResetPasswordInterface) => {
    try {
      const response = await api.post('auth/reset-password', {
        ...payload,
      });
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to reset password'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: resetPassword,
  });
  return mutation;
};

export const useAuth = () => {
  const { accessToken, userId, userName, userRole } = useSelector(
    (state: RootState) => state.auth
  );

  const user = useMemo(() => {
    return userId ? { id: userId, name: userName, role: userRole } : null;
  }, [userId, userName, userRole]);

  return useMemo(() => ({ user, token: accessToken }), [user, accessToken]);
};

export const useLogin = () => {
  const dispatch: AppDispatch = useDispatch();
  const login = async (payload: AuthInterface): Promise<LoginResponse> => {
    try {
      const response = await api.post('auth/', {
        ...payload,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to login. Please check your credentials and try again.'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: data => {
      dispatch(
        setAuthTokens({
          accessToken: data.auth.accessToken,
          refreshToken: data.auth.refreshToken,
        })
      );
      dispatch(
        setUserData({
          id: data.userId,
          userName: data.name,
          userRole: String(data.role),
          packageInfo: data.packageInfo
            ? { planType: data.packageInfo.planType }
            : null,
        })
      );
      setBearerToken(data.auth.accessToken);
    },
  });
  return { ...mutation, mutateAsync: mutation.mutateAsync };
};

export const useSsoLogin = () => {
  const dispatch: AppDispatch = useDispatch();
  const ssoLogin = async (token: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('auth/sso', {
        token,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'SSO login failed'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: ssoLogin,
    onSuccess: data => {
      dispatch(
        setAuthTokens({
          accessToken: data.auth.accessToken,
          refreshToken: data.auth.refreshToken,
        })
      );
      dispatch(
        setUserData({
          id: data.userId,
          userName: data.name,
          userRole: String(data.role),
          packageInfo: data.packageInfo
            ? { planType: data.packageInfo.planType }
            : null,
        })
      );
      setBearerToken(data.auth.accessToken);
    },
  });
  return { ...mutation, mutateAsync: mutation.mutateAsync };
};

const MCOM_SOLUTIONS_URL =
  process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000';

export function redirectToMcomSolutionsLogin(returnState: string = '/dashboard') {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1/';
  const authorizeUrl = `${apiBase.replace(/\/$/, '')}/sso/authorize?state=${encodeURIComponent(returnState)}`;
  window.location.href = authorizeUrl;
}

export function redirectToMcomSolutionsSignup(returnState: string = '/dashboard') {
  const state = crypto.randomUUID();
  const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || 'mcom-mall';
  const redirectUri = `${window.location.origin}/auth/sso`;

  sessionStorage.setItem('sso_state', state);

  const params = new URLSearchParams({
    client_id: clientId,
    source: 'mcommall',
    redirect_uri: redirectUri,
    state: returnState,
  });

  window.location.href = `${MCOM_SOLUTIONS_URL}/register/customer?${params.toString()}`;
}

export function redirectToMcomSolutionsSubscription(callbackPath: string = '/dashboard/billing/success') {
  const callbackUrl = encodeURIComponent(window.location.origin + callbackPath);
  const subscribeUrl = `${MCOM_SOLUTIONS_URL}/getstarted/business?source=mcommall&redirect=${callbackUrl}`;
  window.location.href = subscribeUrl;
}

export const useRefreshToken = () => {
  const dispatch: AppDispatch = useDispatch();
  const refresh = async (
    refreshToken: string
  ): Promise<LoginResponse['auth']> => {
    try {
      const response = await api.post('auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to refresh token'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: refresh,
    onSuccess: data => {
      dispatch(
        setAuthTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      setBearerToken(data.accessToken);
    },
    onError: () => {
      dispatch(logoutAction());
    },
  });
  return mutation;
};

export const useLogout = () => {
  const dispatch: AppDispatch = useDispatch();
  const logout = () => {
    const accessToken = Cookies.get('access');
    if (accessToken) {
      fetch(`${api.defaults.baseURL}auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      }).catch(() => {});
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3001'}/api/v1/sso/logout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        },
      ).catch(() => {});
    }
    setBearerToken('');
    dispatch(logoutAction());
  };
  return logout;
};

export const useClaimBusiness = () => {
  const claim = async (payload: ClaimInterface) => {
    try {
      const response = await api.post('claim/start', {
        ...payload,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to create business'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: claim,
    onSuccess: data => {
      if (data.authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.authUrl,
          'GoogleAuth',
          `width=${width},height=${height},top=${top},left=${left}`
        );
      } else {
        alert('Unable to start Google verification.');
      }
    },
  });
  return mutation;
};
