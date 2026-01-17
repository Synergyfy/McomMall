import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyVouchers, transferMoney } from './index';
import { TransferDto } from './types';

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
