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
    faceValue?: number | null;
    maxCashbackPercent?: number;
    validProductIds?: string[];
    validServiceIds?: string[];
    expiresAt?: string | null;
}

export interface RewardDefinitionsResponse {
    data: DefinitionResponseDto[];
    count: number;
}

export interface UserVoucherResponseDto {
    id: string;
    code?: string;
    totalBalance: number;
    state: string;
    definition: DefinitionResponseDto;
    faceValue?: number | null;
    functionalType?: string | null;
    contributionRemaining?: number;
    expiresAt?: string | null;
}

export interface IssueVoucherDto {
    rewardDefinitionId: string;
    recipientUserId?: string;
    recipientEmail?: string;
    expiresAt?: string;
    issuanceId?: string;
}

export type VoucherCouponStatus = 'active' | 'redeemed' | 'expired';

export interface BusinessVoucherCoupon {
    id: string;
    code: string;
    templateName: string | null;
    description: string | null;
    faceValue: number;
    status: VoucherCouponStatus;
    recipientEmail: string | null;
    recipientName: string | null;
    expiresAt: string | null;
    createdAt: string | null;
    discountRedeemed: number;
    scopeType: string | null;
    validShops: string[];
}

export interface BusinessVoucherCouponStats {
    total: number;
    active: number;
    redeemed: number;
    expired: number;
    totalDiscountIssued: number;
    totalDiscountRedeemed: number;
}

export interface BusinessVoucherCouponsResponse {
    data: BusinessVoucherCoupon[];
    count: number;
    stats: BusinessVoucherCouponStats;
}

export interface GetBusinessVoucherCouponsParams {
    page?: number;
    limit?: number;
    status?: 'all' | VoucherCouponStatus;
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
    transactionId: string; // Stripe Intent ID / PayPal Order ID / MCOM charge id
    paymentGateway: 'STRIPE' | 'PAYPAL' | 'MCOM_WALLET';
}

export interface BusinessStatsResponseDto {
    totalSpentInShop: number;
    customersCount: number;
    cashbackGivenCount: number;
    cashbackGivenAmount?: number;
    rewardRedeemedAmount?: number;
    realRedeemedAmount?: number;
    salesAttributed?: number;
}

export interface SpendDto {
    userVoucherId: string;
    amount: number;
    shopId: string;
}

export interface InitiateContributionDto {
    amount: number;
    paymentGateway: 'STRIPE' | 'PAYPAL' | 'MCOM_WALLET';
}

export interface ContributeToVoucherDto {
    amount: number;
    paymentGateway: 'STRIPE' | 'PAYPAL' | 'MCOM_WALLET';
    transactionId: string;
}

export interface ContributionInitiateResponse {
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string | null;
    transactionId?: string;
    provider: string;
}

export interface CustomerStatsResponseDto {
    activeVouchersCount: number;
    activeVoucherCouponsCount?: number;
    totalCurrentBalance: number;
    currentRealBalance: number;
    currentRewardBalance: number;
    totalBusinessRewardsReceived: number;
    totalSpent: number;
}
