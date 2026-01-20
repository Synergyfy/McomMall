import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { CashbackBalanceResponse, CashbackHistoryParams, CashbackHistoryResponse, CashbackRule } from './types';

export const useGetCashbackRules = () => {
  return useQuery({
    queryKey: ['cashback-rules'],
    queryFn: async () => {
      const { data } = await api.get<CashbackRule[]>('/cashback/rules');
      return data;
    },
  });
};

export const useGetCashbackBalance = () => {
  return useQuery({
    queryKey: ['cashback-balance'],
    queryFn: async () => {
      const { data } = await api.get<CashbackBalanceResponse>('/cashback/balance');
      return data;
    },
  });
};

export const useGetCashbackHistory = (params: CashbackHistoryParams = {}) => {
  return useQuery({
    queryKey: ['cashback-history', params],
    queryFn: async () => {
      const { data } = await api.get<CashbackHistoryResponse>('/cashback/history', {
        params,
      });
      return data;
    },
  });
};
