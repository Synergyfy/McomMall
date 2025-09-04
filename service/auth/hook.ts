import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import api, { setBearerToken } from '../api';
import { useSelector } from 'react-redux';
import {
  UserInterface,
  AuthInterface,
  LoginResponse,
  ClaimInterface,
} from './types';
import { useDispatch } from 'react-redux';
import {
  setAuthTokens,
  setUserData,
  logout as logoutAction,
} from '../store/authSlice';
import { AppDispatch } from '../store/store';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

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
  return mutation;
};

export const useAuth = () => {
  const { user, token } = useSelector((state: any) => state.auth);
  return { user, token };
}

export const useLogin = () => {
  const dispatch: AppDispatch = useDispatch();
  const login = async (payload: AuthInterface): Promise<LoginResponse> => {
    try {
      const response = await api.post('auth', {
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
          userName: data.name,
          userRole: String(data.role),
        })
      );
      setBearerToken(data.auth.accessToken);
    },
  });
  return mutation;
};

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
        err.response?.data?.message ||
          err.message ||
          'Failed to refresh token'
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
