export type LoyaltyRuleType =
    | 'percentage_of_spend'
    | 'fixed_per_booking'
    | 'bonus_multiplier'
    | 'welcome_bonus';

export interface LoyaltyOffer {
    id: string;
    title: string;
    points: number;
    isActive: boolean;
}

export interface LoyaltyStats {
    activeRewards: number;
    pointsIssued: number;
    redemptionRate: number;
    programGrowth: number;
    completedBookings: number;
    offers: LoyaltyOffer[];
}

export interface LoyaltyRule {
    id: string;
    name: string;
    description?: string;
    ruleType: LoyaltyRuleType;
    pointsPerCurrency?: number;
    fixedPoints?: number;
    multiplier?: number;
    appliesTo?: string;
    isActive: boolean;
    businessId: string;
}

export interface LoyaltySettings {
    id: string;
    businessId: string;
    isEnabled: boolean;
    pointsPerCurrency?: number;
    pointsMultiplier?: number;
    signupBonusPoints?: number;
    redemptionApproval: string;
    terms?: string;
}

export interface UpdateLoyaltySettingsDto {
    isEnabled?: boolean;
    pointsPerCurrency?: number;
    pointsMultiplier?: number;
    signupBonusPoints?: number;
    redemptionApproval?: string;
    terms?: string;
}

export interface UpdateLoyaltyRuleDto {
    name?: string;
    description?: string;
    ruleType?: LoyaltyRuleType;
    pointsPerCurrency?: number;
    fixedPoints?: number;
    multiplier?: number;
    appliesTo?: string;
    isActive?: boolean;
}
