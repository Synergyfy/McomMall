export type MallRewardDiscountType = 'percentage' | 'fixed';

export interface EligibleRewardLine {
  lineKey: string;
  discountAmount: number;
  capped?: boolean;
}

export interface EligibleReward {
  issuanceId: string;
  rewardTitle: string;
  rewardType?: string | null;
  discountType: MallRewardDiscountType;
  discountValue: number;
  expiresAt?: string | null;
  code?: string | null;
  applicableLines: EligibleRewardLine[];
}

export interface EligibleRewardsResponse {
  meshEnabled: boolean;
  degraded: boolean;
  rewards: EligibleReward[];
}

export interface RewardIssuance {
  id: string;
  rewardTitle?: string | null;
  rewardType?: string | null;
  status: string;
  code?: string | null;
  value?: number;
  expiresAt?: string | null;
  redeemedAt?: string | null;
  issuerClientId?: string;
  metadata?: Record<string, unknown> | null;
}

export interface MyRewardsResponse {
  meshEnabled: boolean;
  degraded: boolean;
  partnerRewards: RewardIssuance[];
  giftCards: unknown[];
  vouchers: unknown[];
  coupons: unknown[];
}

export interface RewardApplication {
  issuanceId: string;
  lineKey: string;
}

export interface EligibleRewardsItem {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface EligibleRewardsServiceBooking {
  serviceId: string;
  price?: number;
  quantity?: number;
}
