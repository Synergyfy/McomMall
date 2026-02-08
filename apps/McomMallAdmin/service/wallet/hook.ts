import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { WalletData } from './types';

const fetchWalletData = async () => {
  const { data } = await api.get<WalletData>('/wallet');
  return data;
};

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWalletData,
  });
};
