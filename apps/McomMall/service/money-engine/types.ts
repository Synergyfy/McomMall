export interface DefinitionResponseDto {
    id: string;
    name: string;
    description: string;
    visualType: string;
    functionalType?: string;
    splitRatio: {
        real: number;
        reward: number;
    };
    burnStrategy?: string;
    isActive: boolean;
    seasonalLabels?: string[];
    scopeType?: string;
    validShops?: any[];
    utilization?: number;
}

export interface RewardDefinitionsResponse {
    data: DefinitionResponseDto[];
    count: number;
}

export interface UserVoucherResponseDto {
    id: string;
    totalBalance: number;
    state: string;
    definition: DefinitionResponseDto;
}

export interface TransferDto {
    fromVoucherId: string;
    toVoucherId: string;
    amount: number;
}

export interface CashbackDto {
    userVoucherId: string;
    amount: number;
    shopId: string;
}

export interface PurchaseVoucherDto {
    rewardDefinitionId: string;
    paymentAmount: number;
    transactionId: string; // Stripe Intent ID or PayPal Order ID
    paymentGateway: 'STRIPE' | 'PAYPAL';
}

export interface BusinessStatsResponseDto {
    totalSpentInShop: number;
    customersCount: number;
    cashbackGivenCount: number;
}

export interface SpendDto {
    userVoucherId: string;
    amount: number;
    shopId: string;
}

export interface CustomerStatsResponseDto {
    activeVouchersCount: number;
    totalCurrentBalance: number;
    currentRealBalance: number;
    currentRewardBalance: number;
    totalBusinessRewardsReceived: number;
    totalSpent: number;
}
