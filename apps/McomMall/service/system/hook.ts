import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useGetPublicGiftCardTemplates = (limit = 10) => {
  const fetcher = async () => {
    const response = await api.get('gift-cards/templates/public', {
      params: { limit, page: 1 },
    });
    return response.data;
  };

  return useQuery({
    queryFn: fetcher,
    queryKey: ['GET_PUBLIC_GIFT_CARD_TEMPLATES', limit],
  });
};

export const useGetPublicCouponProducts = (limit = 10) => {
  const fetcher = async () => {
    const response = await api.get('coupons/products/public', {
      params: { limit, page: 1 },
    });
    return response.data;
  };

  return useQuery({
    queryFn: fetcher,
    queryKey: ['GET_PUBLIC_COUPON_PRODUCTS', limit],
  });
};

export const useGetPublicVoucherProducts = (limit = 10) => {
  const fetcher = async () => {
    const response = await api.get('vouchers/products/public', {
      params: { limit, page: 1 },
    });
    return response.data;
  };

  return useQuery({
    queryFn: fetcher,
    queryKey: ['GET_PUBLIC_VOUCHER_PRODUCTS', limit],
  });
};

export const useGetCapabilityUsage = () => {
  const fetcher = async () => {
    const response = await api.get('capability/usage');
    return response.data;
  };

  return useQuery({
    queryFn: fetcher,
    queryKey: ['GET_CAPABILITY_USAGE'],
  });
};
