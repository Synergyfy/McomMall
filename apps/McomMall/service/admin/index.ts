import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  PromotionSummaryStatisticsDto,
  TPromotionTransactionHistoryPage,
  TVoucherTransactionHistoryPage,
  VoucherSummaryStatisticsDto,
} from './types';

const getPromotionSummaryStatistics = async (id: string) => {
  const { data } = await api.get<PromotionSummaryStatisticsDto>(
    `/promotions/${id}/summary-statistics`
  );
  return data;
};

export const useGetPromotionSummaryStatistics = (id: string) => {
  return useQuery({
    queryKey: ['promotionSummaryStatistics', id],
    queryFn: () => getPromotionSummaryStatistics(id),
    enabled: !!id,
  });
};

const getPromotions = async () => {
  const { data } = await api.get<any[]>('/promotions');
  return data;
}

export const useGetPromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: getPromotions,
  });
}

const getPromotionTransactionHistory = async (
  id: string,
  params: {
    page?: number;
    take?: number;
    order?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
  }
) => {
  const { data } = await api.get<TPromotionTransactionHistoryPage>(
    `/promotions/${id}/transaction-history`,
    { params }
  );
  return data;
};

export const useGetPromotionTransactionHistory = (
  id: string,
  params: {
    page?: number;
    take?: number;
    order?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery({
    queryKey: ['promotionTransactionHistory', id, params],
    queryFn: () => getPromotionTransactionHistory(id, params),
    enabled: !!id,
  });
};

const getVoucherSummaryStatistics = async () => {
  const { data } = await api.get<VoucherSummaryStatisticsDto>(
    '/admin/vouchers/summary-statistics'
  );
  return data;
};

export const useGetVoucherSummaryStatistics = () => {
  return useQuery({
    queryKey: ['voucherSummaryStatistics'],
    queryFn: getVoucherSummaryStatistics,
  });
};

const getVoucherTransactionHistory = async (params: {
  page?: number;
  take?: number;
  order?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  );
  const { data } = await api.get<TVoucherTransactionHistoryPage>(
    '/admin/vouchers/transaction-history',
    { params: cleanParams }
  );
  return data;
};

export const useGetVoucherTransactionHistory = (params: {
  page?: number;
  take?: number;
  order?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['voucherTransactionHistory', params],
    queryFn: () => getVoucherTransactionHistory(params),
  });
};