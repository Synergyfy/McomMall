import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { Voucher, VoucherBalance } from './types';

const getVoucherByCode = async (code: string): Promise<Voucher> => {
  const { data } = await api.get<Voucher>(`/vouchers/${code}`);
  return data;
};

// We use useMutation here for a GET request to allow for manual triggering,
// which is consistent with other data-fetching hooks in the application (e.g., useCheckGiftCardBalance).
export const useApplyVoucher = () => {
  return useMutation<Voucher, Error, string>({
    mutationFn: getVoucherByCode,
  });
};

/**
 * Authenticated balance lookup. The public `/vouchers/:code` endpoint masks the
 * balance, so the checkout must use this route to decide whether a voucher can
 * be applied.
 */
export const useVoucherBalance = () => {
  return useMutation<VoucherBalance, Error, string>({
    mutationFn: async (code: string) => {
      const { data } = await api.get<VoucherBalance>(
        `/vouchers/${encodeURIComponent(code)}/balance`,
      );
      return data;
    },
  });
};

import { useQuery } from '@tanstack/react-query';

const getVoucherById = async (id: string): Promise<Voucher> => {
  const { data } = await api.get<Voucher>(`/vouchers/${id}`);
  return data;
};

export const useGetVoucherById = (id: string, options?: { enabled?: boolean }) => {

  return useQuery({

    queryKey: ['voucher', id],

    queryFn: () => getVoucherById(id),

    enabled: options?.enabled !== undefined ? options.enabled : !!id,

  });

};

export const useGetPublicVoucherDetails = (code: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['publicVoucherDetails', code],
    queryFn: () => getVoucherByCode(code),
    enabled: options?.enabled !== undefined ? options.enabled : !!code,
  });
};

export const useGetPublicVoucherProductDetails = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['publicVoucherProductDetails', id],
    queryFn: () => api.get(`/vouchers/products/${id}`).then(res => res.data),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};
