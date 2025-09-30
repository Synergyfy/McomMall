import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { RedeemVoucherDto, Voucher } from './types';

const redeemVoucher = async (redeemVoucherDto: RedeemVoucherDto): Promise<Voucher> => {
  const { data } = await api.post<Voucher>(
    '/vouchers/redeem',
    redeemVoucherDto
  );
  return data;
};

export const useRedeemVoucher = () => {
  return useMutation<Voucher, Error, RedeemVoucherDto>({
    mutationFn: redeemVoucher,
  });
};