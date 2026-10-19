/**
 * Contract types for MCOM Rewards partner issuances.
 *
 * These mirror the fields documented in the mcom-rewards
 * `partner-rewards-m2m.md` spec. Only fields the mall consumes are modelled;
 * extra fields are tolerated.
 */

export type MallRewardDiscountType = 'percentage' | 'fixed';

export type MallRewardTargetScope = 'SPECIFIC' | 'ALL';

/**
 * Mall-specific targeting carried in an issuance's `metadata.mallTargets`.
 * Populated by MCOM Rewards when a business configures a mall-targeted reward.
 */
export interface MallRewardTargets {
  /** SPECIFIC = only the listed product/service ids; ALL = whole business (or ecosystem). */
  scope?: MallRewardTargetScope;
  /** MCOM Central user id of the sponsoring business owner. */
  businessMcomUserId?: string;
  /** Mall business id (optional shortcut). */
  businessId?: string;
  productIds?: string[];
  serviceIds?: string[];
  discountType?: MallRewardDiscountType;
  discountValue?: number;
  /** Cap on the computed discount (fixed or percentage). */
  maxDiscount?: number;
  /** Minimum line total required to apply. */
  minSpend?: number;
}

export interface RewardIssuanceRecipient {
  email?: string | null;
  mcomUserId?: string | null;
  userId?: string | null;
  userType?: string | null;
  name?: string | null;
  resolved?: boolean;
}

export interface RewardIssuanceDto {
  id: string;
  rewardId?: string | null;
  businessRewardId?: string | null;
  rewardTitle?: string | null;
  issuerClientId?: string;
  externalRef?: string | null;
  idempotencyKey?: string;
  recipient?: RewardIssuanceRecipient;
  code?: string | null;
  status: string;
  rewardType?: string | null;
  value?: number;
  pointsAwarded?: number | null;
  mallReference?: string | null;
  quantity?: number;
  expiresAt?: string | null;
  redeemedAt?: string | null;
  revokedAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedIssuances {
  data: RewardIssuanceDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** A single cart/booking line considered for reward eligibility. */
export interface EligibilityLine {
  /** Stable key chosen by the caller (e.g. `product:<id>` or `service:<id>`). */
  lineKey: string;
  kind: 'PRODUCT' | 'SERVICE';
  /** Mall product id or service id. */
  id: string;
  /** Mall business id. */
  businessId?: string;
  /** MCOM Central user id of the business owner (for business scoping). */
  businessMcomUserId?: string;
  unitPrice: number;
  quantity: number;
}

export interface EligibleRewardLine {
  lineKey: string;
  discountAmount: number;
  /** True when the discount hit the configured cap. */
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
