import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMyVouchers,
    transferMoney,
    giveCashback,
    purchaseVoucher,
    initiateVoucherPurchase,
    getBusinessStats,
    getOwnerRewardDefinitions,
    getCustomerStats,
    getPublicRewardDefinitions,
    spendVoucher,
    posSpendVoucher,
    issueVoucher,
    initiateVoucherContribution,
    contributeToVoucher,
    getBusinessVoucherCoupons,
} from './index';
import {
    TransferDto,
    CashbackDto,
    PurchaseVoucherDto,
    SpendDto,
    InitiateContributionDto,
    ContributeToVoucherDto,
    IssueVoucherDto,
    GetBusinessVoucherCouponsParams,
} from './types';

export const useGetMyVouchers = (enabled = true) => {
    return useQuery({
        queryKey: ['my-vouchers'],
        queryFn: getMyVouchers,
        enabled,
    });
};

export const useSpendVoucher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SpendDto) => spendVoucher(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
            queryClient.invalidateQueries({ queryKey: ['business-stats'] });
        },
    });
};

export const usePosSpendVoucher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SpendDto) => posSpendVoucher(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
            queryClient.invalidateQueries({ queryKey: ['business-stats'] });
            queryClient.invalidateQueries({ queryKey: ['FETCH_MY_DEALS'] });
        },
    });
};

export const useIssueVoucher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IssueVoucherDto) => issueVoucher(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
            queryClient.invalidateQueries({ queryKey: ['FETCH_MY_DEALS'] });
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            queryClient.invalidateQueries({ queryKey: ['business-voucher-coupons'] });
        },
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

export const useInitiateMoneyVoucherPurchase = () => {
    return useMutation({
        mutationFn: (data: {
            rewardDefinitionId: string;
            paymentAmount: number;
            paymentGateway: 'STRIPE' | 'PAYPAL' | 'MCOM_WALLET';
            idempotencyKey?: string;
        }) => initiateVoucherPurchase(data),
    });
};

export const useGetBusinessStats = (enabled = true) => {
    return useQuery({
        queryKey: ['business-stats'],
        queryFn: getBusinessStats,
        enabled,
    });
};

export const useGetBusinessVoucherCoupons = (
    params: GetBusinessVoucherCouponsParams = {},
    enabled = true,
) => {
    return useQuery({
        queryKey: [
            'business-voucher-coupons',
            params.status ?? 'all',
            params.page ?? 1,
            params.limit ?? 100,
        ],
        queryFn: () => getBusinessVoucherCoupons(params),
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

export const useInitiateVoucherContribution = () => {
    return useMutation({
        mutationFn: ({ code, ...data }: { code: string } & InitiateContributionDto) =>
            initiateVoucherContribution(code, data),
    });
};

export const useContributeToVoucher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ code, ...data }: { code: string } & ContributeToVoucherDto) =>
            contributeToVoucher(code, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['FETCH_MY_DEALS'] });
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
        },
    });
};
