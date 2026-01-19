import api from '@/service/api';
import { UserVoucherResponseDto, TransferDto, CashbackDto } from './types';

export const getMyVouchers = async (): Promise<UserVoucherResponseDto[]> => {
    const response = await api.get<UserVoucherResponseDto[]>('/money-engine/me');
    return response.data;
};

export const transferMoney = async (data: TransferDto): Promise<void> => {
    await api.post('/money-engine/transfer', data);
};

export const giveCashback = async (data: CashbackDto): Promise<void> => {
    await api.post('/money-engine/cashback', data);
};
