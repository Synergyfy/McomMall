import api from '@/service/api';
import {
    UserVoucherResponseDto,
    TransferDto,
    CashbackDto,
    PurchaseVoucherDto,
    BusinessStatsResponseDto,
    SpendDto,
    RewardDefinitionsResponse,
    CustomerStatsResponseDto
} from './types';

export const getMyVouchers = async (): Promise<UserVoucherResponseDto[]> => {
    const response = await api.get<any>('/money-engine/me');
    // Handle paginated responses which might wrap the array in 'items' or 'data'
    if (response.data?.items && Array.isArray(response.data.items)) return response.data.items;
    if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const transferMoney = async (data: TransferDto): Promise<void> => {
    await api.post('/money-engine/transfer', data);
};

export const giveCashback = async (data: CashbackDto): Promise<void> => {
    await api.post('/money-engine/cashback', data);
};

export const purchaseVoucher = async (data: PurchaseVoucherDto): Promise<UserVoucherResponseDto> => {
    const response = await api.post<UserVoucherResponseDto>('/money-engine/purchase', data);
    return response.data;
};

export const getBusinessStats = async (): Promise<BusinessStatsResponseDto> => {
    const response = await api.get<BusinessStatsResponseDto>('/money-engine/business/stats');
    return response.data;
};

export const spendVoucher = async (data: SpendDto): Promise<void> => {
    await api.post('/money-engine/spend', data);
};

export const getOwnerRewardDefinitions = async (page = 1, limit = 10): Promise<RewardDefinitionsResponse> => {
    const response = await api.get<any>('/money-engine/definitions/owner/me', {
        params: { page, limit }
    });

    // Adapt array response to RewardDefinitionsResponse
    if (Array.isArray(response.data)) {
        return {
            data: response.data,
            count: response.data.length
        };
    }

    // Handle wrapped response
    if (response.data?.data && Array.isArray(response.data.data)) {
        return {
            data: response.data.data,
            count: response.data.count || response.data.data.length
        };
    }

    return { data: [], count: 0 };
};

export const getCustomerStats = async (): Promise<CustomerStatsResponseDto> => {
    const response = await api.get<CustomerStatsResponseDto>('/money-engine/me/stats');
    return response.data;
};

export const getPublicRewardDefinitions = async (page = 1, limit = 10): Promise<RewardDefinitionsResponse> => {
    const response = await api.get<any>('/money-engine/definitions/public', {
        params: { page, limit }
    });

    if (Array.isArray(response.data)) {
        return {
            data: response.data,
            count: response.data.length
        };
    }

    if (response.data?.data && Array.isArray(response.data.data)) {
        return {
            data: response.data.data,
            count: response.data.count || response.data.data.length
        };
    }

    if (response.data?.items && Array.isArray(response.data.items)) {
        return {
            data: response.data.items,
            count: response.data.totalItems || response.data.items.length
        };
    }

    return { data: [], count: 0 };
};
