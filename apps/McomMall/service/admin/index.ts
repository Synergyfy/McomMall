import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  TVoucherTransactionHistoryPage,
  VoucherSummaryStatisticsDto,
} from './types';

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
  limit?: number;
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
  limit?: number;
  order?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['voucherTransactionHistory', params],
    queryFn: () => getVoucherTransactionHistory(params),
  });
};