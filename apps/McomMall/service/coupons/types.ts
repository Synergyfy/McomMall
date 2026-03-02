export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CouponStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
  DISABLED = 'disabled',
}

export enum CouponSourceType {
  PLATFORM = 'platform',
  BUSINESS = 'business',
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  targetPostalCodes?: string[];
}

export interface Business {
  id: string;
  businessName: string;
  status: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  sourceType: CouponSourceType;
  discountValue: number | string;
  discountType: DiscountType;
  usageLimit: number;
  perUserLimit: number;
  status: CouponStatus;
  expiresAt: string | null;
  business?: Business | null;
  campaign?: MarketingCampaign | null;
  created_at: string;
  updated_at: string;
}

export interface SavedCoupon {
  id: string;
  savedAt: string;
  coupon: Coupon;
}

export interface CreateCouponDto {
  title: string;
  description?: string;
  code: string;
  sourceType: CouponSourceType;
  discountValue: number;
  discountType: DiscountType;
  usageLimit?: number;
  perUserLimit?: number;
  startDate?: string;
  expiresAt?: string;
  campaignId?: string;
  businessId?: string;
  brandingBusinessId?: string;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

export interface ValidateCouponDto {
  code: string;
  productIds?: string[];
}

export interface ValidateCouponResponse extends Coupon {
  discountAmount: number;
}
