import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { Coupon, InitiateCouponPurchaseDto, InitiateReloadDto, VerifyCouponPurchaseDto, VerifyReloadDto } from './types';

export const useInitiateCouponPurchase = () => {
  return useMutation({
    mutationFn: (data: InitiateCouponPurchaseDto) => {
      return api.post('/coupons/initiate-purchase', data);
    },
  });
};

export const useVerifyCouponPurchase = () => {
  return useMutation({
    mutationFn: (data: VerifyCouponPurchaseDto) => {
      return api.post('/coupons/verify-purchase', data);
    },
  });
};

export const useInitiateCouponReload = (code: string) => {
  return useMutation({
    mutationFn: (data: InitiateReloadDto) => {
      return api.post(`/coupons/${code}/initiate-reload`, data);
    },
  });
};

export const useVerifyCouponReload = (code:string) => {
    return useMutation({
        mutationFn: (data: VerifyReloadDto) => {
            return api.post(`/coupons/${code}/verify-reload`, data)
        }
    })
}

export const useGetMyCoupons = () => {
  return useQuery<Coupon[]>({
    queryKey: ['my-coupons'],
    queryFn: () => api.get('/coupons/my-coupons').then(res => res.data),
  });
};
