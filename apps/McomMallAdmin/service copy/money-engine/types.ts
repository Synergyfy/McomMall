export interface SplitRatioDto {
    real: number;
    reward: number;
}

export interface CreateRewardDefinitionDto {
    name: string;
    description?: string;
    visualType: 'coupon' | 'voucher';
    functionalType: 'price_reducer' | 'spending_power';
    splitRatio: SplitRatioDto;
    scopeType: 'any_shop' | 'specific_shops' | 'expo_only' | 'campaign_only';
    validShopIds?: string[];
    seasonalLabels?: string[];
    isActive?: boolean;
    burnStrategy?: 'reward_first' | 'real_first' | 'proportional';
}

export interface RewardDefinition extends CreateRewardDefinitionDto {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    burnStrategy?: 'reward_first' | 'real_first' | 'proportional';
    isActive: boolean;
}

export interface AnalyticsMetric {
    value: number;
    percentageChange: number;
}

export interface MoneyEngineAnalytics {
    activeVouchers: AnalyticsMetric;
    realMoneyInput: AnalyticsMetric;
    rewardValueGiven: AnalyticsMetric;
    networkUtilization: AnalyticsMetric;
}
