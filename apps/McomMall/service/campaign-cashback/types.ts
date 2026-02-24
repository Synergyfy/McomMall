export enum CampaignTargetType {
    B2C = 'B2C',
    B2B = 'B2B',
}

export enum CampaignDisplayType {
    VOUCHER = 'VOUCHER',
    E_CARD = 'E_CARD',
}

export enum CampaignUnlockMode {
    REQUIRE_FULL_UNLOCK = 'REQUIRE_FULL_UNLOCK',
    ALLOW_PRELOADED_USAGE = 'ALLOW_PRELOADED_USAGE',
}

export enum CampaignStatus {
    NOT_ACTIVE = 'NOT_ACTIVE', // Added explicitly for "Campaign not yet active"
    LOCKED = 'LOCKED',
    ACTIVE = 'ACTIVE',
    PARTIALLY_USED = 'PARTIALLY_USED',
    FULLY_USED = 'FULLY_USED',
    EXPIRED = 'EXPIRED',
}

export enum SpendingChannel {
    HYPERLOCAL = 'HYPERLOCAL',
    NEARBY = 'NEARBY',
    ONLINE = 'ONLINE',
}

export interface CampaignWallet {
    channelType: SpendingChannel;
    value1Balance: number; // 247GBS Preloaded
    value2Balance: number; // System Preloaded
    value3Balance: number; // Contribution
}

export interface CampaignCashback {
    id: string;
    name: string;
    targetType: CampaignTargetType;
    displayType: CampaignDisplayType;
    totalValue: number;
    levelValue: number; // typically totalValue / 3

    unlockMode: CampaignUnlockMode;
    contributionRequired: boolean;
    contributionPaid: boolean;
    externalCampaign: boolean; // Flag to show "External Campaign" badge
    externalRedemptionUrl?: string; // If true, disable spend and show link

    expiryDate: string;
    status: CampaignStatus;

    // Wallets broken down by channel
    wallets: CampaignWallet[];

    // Admin Explainer texts
    value1Title: string;
    value1Description: string;
    value1UsageText: string;

    value2Title: string;
    value2Description: string;
    value2UsageText: string;

    value3Title: string;
    value3Description: string;
    value3UsageText: string;
}

export interface CampaignCashbackResponse {
    data: CampaignCashback[];
    total: number;
    page: number;
    limit: number;
}
