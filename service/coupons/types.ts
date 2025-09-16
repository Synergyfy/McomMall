interface CouponBusiness {
  id: string;
  businessName: string;
  // Add other properties from the JSON if they are needed for display
}

export interface Coupon {
  id: string;
  couponCode: string;
  couponDescription?: string;
  widgetBackgroundUrl?: string;
  discountType: 'percentage' | 'fixed';
  couponAmount: string;
  expiryDate: string;
  minSpend?: number;
  maxSpend?: number;
  individualUseOnly: boolean;
  allowedEmails?: string;
  usageLimitPerCoupon?: number;
  usageLimitPerUser?: number;
  usageCount?: number; // Not present in the new JSON, making it optional
  businesses: CouponBusiness[];
  created_at: string;
  updated_at: string;
}

export interface CreateCouponDto {
  couponCode: string;
  couponDescription?: string;
  widgetBackgroundUrl?: string;
  discountType: 'percentage' | 'fixed';
  couponAmount: number;
  expiryDate: number;
  minSpend?: number;
  maxSpend?: number;
  products?: string;
  individualUseOnly?: boolean;
  allowedEmails?: string;
  usageLimitPerCoupon?: number;
  usageLimitPerUser?: number;
  businessIds: string[];
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

export interface ValidateCouponDto {
  productIds: string[];
  couponCode: string;
}

export interface ValidateCouponResponse {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
}
