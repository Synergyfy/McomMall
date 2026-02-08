import { useMutation } from '@tanstack/react-query';
import api from '../../api';
import { InitiateFundingDto } from '../types';

const initiateFund = async (dto: InitiateFundingDto) => {
  const { data } = await api.post('/wallet/fund/initiate', dto);
  return data;
};

export const useInitiateFund = () => {
  return useMutation({
    mutationFn: initiateFund,
  });
};
