import useSWR, { useSWRConfig } from 'swr';
import {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  ValidateCouponResponse,
} from './types';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useGetCoupons = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data: coupons, error } = useSWR<Coupon[]>(
    token ? '/coupons/mine' : null,
    fetcher
  );

  return {
    coupons,
    isLoading: !error && !coupons,
    isError: error,
  };
};

export const useGetCoupon = (id: string, enabled: boolean = true) => {
  const { data: coupon, error } = useSWR<Coupon>(
    enabled ? `/coupons/${id}` : null,
    fetcher
  );

  return {
    coupon,
    isLoading: !error && !coupon,
    isError: error,
  };
};

export const useAddCoupon = () => {
  const { mutate } = useSWRConfig();
  const addCoupon = async (couponData: CreateCouponDto) => {
    const response = await api.post('/coupons', couponData);
    mutate('/coupons/mine');
    return response.data;
  };
  return addCoupon;
};

export const useEditCoupon = () => {
  const { mutate } = useSWRConfig();
  const editCoupon = async (id: string, couponData: UpdateCouponDto) => {
    const response = await api.patch(`/coupons/${id}`, couponData);
    mutate('/coupons/mine');
    mutate(`/coupons/${id}`);
    return response.data;
  };
  return editCoupon;
};

export const useDeleteCoupon = () => {
  const { mutate } = useSWRConfig();
  const deleteCoupon = async (id: string) => {
    await api.delete(`/coupons/${id}`);
    mutate('/coupons/mine');
  };
  return deleteCoupon;
};

export const useValidateCoupon = () => {
  const validateCoupon = async (
    validationData: ValidateCouponDto
  ): Promise<ValidateCouponResponse> => {
    const response = await api.post('/coupons/validate-coupon', validationData);
    const data = response.data;
    return {
      ...data,
      discountAmount: Number(data.discountAmount),
    };
  };
  return validateCoupon;
};
