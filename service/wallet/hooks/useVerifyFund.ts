import { useMutation } from '@tanstack/react-query';
import api from '../../api';
import { VerifyFundingDto } from '../types';

const verifyFund = async (dto: VerifyFundingDto) => {
  const { data } = await api.post('/wallet/fund/verify', dto);
  return data;
};

export const useVerifyFund = () => {
  return useMutation({
    mutationFn: verifyFund,
  });
};
