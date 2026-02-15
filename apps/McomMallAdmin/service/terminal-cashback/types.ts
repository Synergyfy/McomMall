export interface TerminalCashbackStats {
    pendingCount: number;
    approvedCount: number;
    totalEarned: number;
}

export type TerminalCashbackLevel = 1 | 2 | 3;

export interface TerminalCashbackRange {
    id: string;
    minSpend: number;
    maxSpend: number;
    rewardValue: number;
    isActive: boolean;
}

export interface TerminalCashbackLimits {
    maxPerDay: number;
    maxPerCustomer: number;
    maxPerReceipt: number;
    monthlyBudget: number;
    maxClaimsPerUser: number;
}

export interface TerminalCashbackConfig {
    userId: string;
    userName: string;
    level: TerminalCashbackLevel;
    isEnabled: boolean;
    autoApprovalHours: number;
    claimUrl?: string;
    qrCodeUrl?: string;
    ranges: TerminalCashbackRange[];
    fixedRewardValue?: number;
    apiEndpoint?: string;
    rewardType?: 'fixed' | 'percentage';
    rewardPercentage?: number;
    limits: TerminalCashbackLimits;
    updatedAt?: string;
}

export interface CreateTerminalConfigDto {
    userId: string;
    userName: string;
    level: TerminalCashbackLevel;
    ranges: TerminalCashbackRange[]; 
    limits: TerminalCashbackLimits;
    // Level 3 specific fields
    fixedRewardValue?: number;
    apiEndpoint?: string;
    rewardType?: 'fixed' | 'percentage';
    rewardPercentage?: number;
}

export interface UpdateTerminalConfigDto {
    isEnabled?: boolean;
    level?: TerminalCashbackLevel;
    autoApprovalHours?: number;
    ranges?: TerminalCashbackRange[];
    fixedRewardValue?: number;
    apiEndpoint?: string;
    rewardType?: 'fixed' | 'percentage';
    rewardPercentage?: number;
    limits?: TerminalCashbackLimits;
}

export interface TerminalGlobalRule {
    ruleKey: string;
    value: string;
    description?: string;
    isActive: boolean;
}

export type TerminalCashbackClaimStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export interface TerminalCashbackClaim {
    id: string;
    userId: string;
    userName?: string; 
    ownerId: string;
    ownerName?: string;
    amount: number; // Reward value
    spendAmount?: number;
    amountRange?: string; // UI helper
    proofUrl: string;
    status: TerminalCashbackClaimStatus;
    submittedAt: string;
    reviewedAt?: string;
    meta?: {
        gps?: {
            lat: number;
            lng: number;
        };
        deviceId?: string;
    };
    riskScore?: number;
    flaggedReason?: string;
    rejectionReason?: string;
}

export interface UpdateClaimStatusDto {
    status: TerminalCashbackClaimStatus;
    rejectionReason?: string;
}

export interface GetClaimsParams {
    ownerId?: string;
    status?: string;
    limit?: number;
    page?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
}