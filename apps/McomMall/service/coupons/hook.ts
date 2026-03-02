import useSWR, { useSWRConfig } from 'swr';
import {
  Coupon,
  SavedCoupon,
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  ValidateCouponResponse,
} from './types';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

// --- Merchant Hooks ---

export const useGetCoupons = (page: number = 1, limit: number = 10) => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data, error } = useSWR<{ data: Coupon[]; meta: any }>(
    token ? `/coupons/mine?page=${page}&limit=${limit}` : null,
    fetcher
  );

  return {
    coupons: data?.data,
    meta: data?.meta,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useGetCoupon = (id: string, enabled: boolean = true) => {
  const { data: coupon, error } = useSWR<Coupon>(
    (id && enabled) ? `/coupons/${id}` : null,
    fetcher
  );

  return {
    coupon,
    isLoading: !error && !coupon && enabled,
    isError: error,
  };
};

export const useAddCoupon = () => {
  const { mutate } = useSWRConfig();
  const addCoupon = async (couponData: CreateCouponDto) => {
    const response = await api.post('/coupons', couponData);
    mutate(url => typeof url === 'string' && url.startsWith('/coupons/mine'));
    return response.data;
  };
  return addCoupon;
};

export const useEditCoupon = () => {
  const { mutate } = useSWRConfig();
  const editCoupon = async (id: string, couponData: UpdateCouponDto) => {
    const response = await api.patch(`/coupons/${id}`, couponData);
    mutate(url => typeof url === 'string' && url.startsWith('/coupons/mine'));
    mutate(`/coupons/${id}`);
    return response.data;
  };
  return editCoupon;
};

export const useDeleteCoupon = () => {
  const { mutate } = useSWRConfig();
  const deleteCoupon = async (id: string) => {
    await api.delete(`/coupons/${id}`);
    mutate(url => typeof url === 'string' && url.startsWith('/coupons/mine'));
  };
  return deleteCoupon;
};

// --- Consumer Hooks ---

export const useGetAllCoupons = (page: number = 1, limit: number = 10) => {
  const { data, error } = useSWR<{ data: Coupon[]; meta: any }>(
    `/coupons/list?page=${page}&limit=${limit}`,
    fetcher
  );

  return {
    coupons: data?.data,
    meta: data?.meta,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useGetSavedCoupons = (page: number = 1, limit: number = 10) => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data: savedCoupons, error } = useSWR<SavedCoupon[]>(
    token ? `/coupons/saved?page=${page}&limit=${limit}` : null,
    fetcher
  );

  return {
    savedCoupons,
    isLoading: !error && !savedCoupons,
    isError: error,
  };
};

export const useSaveCoupon = () => {
  const { mutate } = useSWRConfig();
  const saveCoupon = async (code: string) => {
    const response = await api.post('/coupons/save', { code });
    mutate('/coupons/saved');
    return response.data;
  };
  return saveCoupon;
};

export const useRemoveSavedCoupon = () => {
  const { mutate } = useSWRConfig();
  const removeSavedCoupon = async (code: string) => {
    await api.post('/coupons/remove-saved', { code });
    mutate('/coupons/saved');
  };
  return removeSavedCoupon;
};

export const useValidateCoupon = () => {
  const validateCoupon = async (
    validationData: ValidateCouponDto
  ): Promise<ValidateCouponResponse> => {
    const response = await api.post('/coupons/validate', validationData);
    return response.data;
  };
  return validateCoupon;
};

export const useGetCouponByCode = (code: string, enabled: boolean = true) => {
  const { data: coupon, error } = useSWR<Coupon>(
    enabled ? `/coupons/detail/${code}` : null,
    fetcher
  );

  return {
    coupon,
    isLoading: !error && !coupon,
    isError: error,
  };
};

// --- Business Analytics Hooks ---

export const useGetBusinessCouponStats = () => {
  const { data: stats, error } = useSWR('/business/coupons/stats', fetcher);
  return { stats, isLoading: !error && !stats, isError: error };
};

export const useGetBusinessCouponChartData = () => {
  const { data: chartData, error } = useSWR('/business/coupons/chart-data', fetcher);
  return { chartData, isLoading: !error && !chartData, isError: error };
};
