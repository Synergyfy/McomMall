import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { CouponProduct, CreateCouponProductDto, UpdateCouponProductDto } from './types';

export const useGetCouponProducts = () => {
  return useQuery<CouponProduct[]>({
    queryKey: ['coupon-products'],
    queryFn: () => api.get('/business/coupon-products').then(res => res.data),
  });
};

export const useGetCouponProductsByBusiness = (businessId: string) => {
  return useQuery({
    queryKey: ['couponProducts', businessId],
    queryFn: () => api.get(`/business/coupon-products?businessId=${businessId}`),
    enabled: !!businessId,
  });
};

export const useGetCouponProduct = (id: string) => {
  return useQuery({
    queryKey: ['couponProduct', id],
    queryFn: () => api.get(`/business/coupon-products/${id}`),
    enabled: !!id,
  });
};

export const useCreateCouponProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponProductDto) => {
      return api.post('/business/coupon-products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-products'] });
    },
  });
};

export const useEditCouponProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCouponProductDto) => {
      return api.patch(`/business/coupon-products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-products'] });
      queryClient.invalidateQueries({ queryKey: ['couponProduct', id] });
    },
  });
};

export const useDeleteCouponProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      return api.delete(`/business/coupon-products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-products'] });
    },
  });
};
