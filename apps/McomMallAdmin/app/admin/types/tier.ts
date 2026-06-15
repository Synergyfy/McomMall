export interface TierQuota {
    maxListings: number;
    allowProductListing: boolean;
    allowServiceListing: boolean;
    maxProducts: number;
    maxServices: number;
    maxGiftCardTemplates: number;
    maxCouponTemplates: number;
    maxLoyaltyPrograms: number;
    maxImagesPerListing: number;
    featuredListingAllowance: number;
    maxTeamMembers?: number;
}

export interface TierFeatureFlags {
    priorityInSearch: boolean;
    advancedAnalytics: boolean;
    dedicatedSupport: boolean;
    allowCustomBranding: boolean;
    allowGroupCreation: boolean;
}

export interface TierConfiguration {
    quotas: TierQuota;
    featureFlags: TierFeatureFlags;
    disabledNavIds?: string[];
}

export enum TierType {
    STANDARD = 'STANDARD',
    SEASONAL = 'SEASONAL',
    TRIAL = 'TRIAL',
}

export interface Tier {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    quarterlyPrice: number;
    annualPrice: number;
    stripeMonthlyPriceId: string;
    stripeQuarterlyPriceId: string;
    stripeAnnualPriceId: string;
    paypalMonthlyPlanId: string;
    paypalQuarterlyPlanId: string;
    paypalAnnualPlanId: string;
    features?: string[];
    configuration: TierConfiguration;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    type?: TierType;
    trialDuration?: number;
}

export type CreateTierInput = Omit<Tier, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTierInput = Partial<CreateTierInput>;
