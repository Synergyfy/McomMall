import api from '../api';

export enum CampaignTargetType {
    CUSTOMER = 'CUSTOMER',
    BUSINESS = 'BUSINESS',
    ALL = 'ALL',
    SPECIFIC_USERS = 'SPECIFIC_USERS',
}

export enum CampaignDisplayType {
    VOUCHER = 'VOUCHER',
    E_CARD = 'E_CARD',
}

export enum CampaignUnlockMode {
    REQUIRE_FULL_UNLOCK = 'REQUIRE_FULL_UNLOCK',
    ALLOW_PRELOADED_USAGE = 'ALLOW_PRELOADED_USAGE',
}

export enum SpendingChannel {
    HYPERLOCAL = 'HYPERLOCAL',
    NEARBY = 'NEARBY',
    ONLINE = 'ONLINE',
}

export enum CampaignCategory {
    REGULAR = 'REGULAR',
    SEASONAL = 'SEASONAL',
}

export enum CampaignUsageType {
    ORDER_PRODUCT = 'ORDER_PRODUCT',
    BOOK_SERVICE = 'BOOK_SERVICE',
    BUY_GIFT_CARD = 'BUY_GIFT_CARD',
    BUY_VOUCHER = 'BUY_VOUCHER',
    BUY_DIGITAL_VALUE = 'BUY_DIGITAL_VALUE',
    EXCHANGE_ITEM = 'EXCHANGE_ITEM',
    ANYWHERE = 'ANYWHERE',
}

export interface CreateCampaignCashbackDto {
    name: string;
    type: CampaignCategory;
    seasonId?: string;
    startDate?: string;
    endDate?: string;
    targetType: CampaignTargetType;
    displayType: CampaignDisplayType;
    totalValue: number;
    unlockMode: CampaignUnlockMode;
    expiryDate: string;
    activationTimerDays?: number;
    activationTasks?: string[];
    externalCampaign?: boolean;
    externalRedemptionUrl?: string;

    // Value 1
    value1Title: string;
    value1Description: string;
    value1UsageText: string;
    value1Channels: SpendingChannel[];
    value1UsageTypes: CampaignUsageType[];

    // Value 2
    value2Title: string;
    value2Description: string;
    value2UsageText: string;
    value2Channels: SpendingChannel[];
    value2UsageTypes: CampaignUsageType[];

    // Value 3
    value3Title: string;
    value3Description: string;
    value3UsageText: string;
    value3Channels: SpendingChannel[];
    value3UsageTypes: CampaignUsageType[];

    selectAll: boolean;
    targetIds?: string[];
}

export const campaignCashbackApi = {
    create: async (payload: CreateCampaignCashbackDto) => {
        // Base URL already includes /api/v1
        const response = await api.post('/campaign-cashback', payload);
        return response.data;
    },

    findAll: async (targetType?: CampaignTargetType) => {
        const response = await api.get('/campaign-cashback', {
            params: { targetType },
        });
        return response.data;
    },

    findOne: async (id: string) => {
        const response = await api.get(`/campaign-cashback/${id}`);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/campaign-cashback/${id}`);
        return response.data;
    },
};
