import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyVouchers, transferMoney, giveCashback, purchaseVoucher, getBusinessStats, getOwnerRewardDefinitions, getCustomerStats, getPublicRewardDefinitions } from './index';
import { TransferDto, CashbackDto, PurchaseVoucherDto } from './types';

export const useGetMyVouchers = (enabled = true) => {
    return useQuery({
        queryKey: ['my-vouchers'],
        queryFn: getMyVouchers,
        enabled,
    });
};

export const useTransferMoney = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TransferDto) => transferMoney(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
        },
    });
};

export const useGiveCashback = () => {
    return useMutation({
        mutationFn: (data: CashbackDto) => giveCashback(data),
    });
};

export const usePurchaseVoucher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PurchaseVoucherDto) => purchaseVoucher(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
        },
    });
};

export const useGetBusinessStats = (enabled = true) => {
    return useQuery({
        queryKey: ['business-stats'],
        queryFn: getBusinessStats,
        enabled,
    });
};

export const useGetOwnerRewardDefinitions = (enabled = true) => {
    return useQuery({
        queryKey: ['owner-reward-definitions'],
        queryFn: () => getOwnerRewardDefinitions(),
        enabled,
    });
};

export const useGetCustomerStats = (enabled = true) => {
    return useQuery({
        queryKey: ['customer-stats'],
        queryFn: getCustomerStats,
        enabled,
    });
};

export const useGetPublicRewardDefinitions = (enabled = true) => {
    return useQuery({
        queryKey: ['public-reward-definitions'],
        queryFn: (() => getPublicRewardDefinitions()),
        enabled,
    });
};
