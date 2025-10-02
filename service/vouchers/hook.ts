import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { Voucher } from './types';

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