import useSWR from 'swr';
import { Coupon, CreateCouponDto, UpdateCouponDto } from './types';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useCoupons = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data: coupons, error, mutate } = useSWR<Coupon[]>(token ? '/coupons/mine' : null, fetcher);

  const createCoupon = async (couponData: CreateCouponDto) => {
    const response = await api.post('/coupons', couponData);
    mutate(); // Revalidate the list of coupons
    return response.data;
  };

  const updateCoupon = async (id: string, couponData: UpdateCouponDto) => {
    const response = await api.patch(`/coupons/${id}`, couponData);
    mutate(); // Revalidate the list of coupons
    return response.data;
  };

  const deleteCoupon = async (id: string) => {
    await api.delete(`/coupons/${id}`);
    mutate(); // Revalidate the list of coupons
  };

  const getCoupon = async (id: string) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  };

  return {
    coupons,
    isLoading: !error && !coupons,
    isError: error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCoupon,
  };
};
